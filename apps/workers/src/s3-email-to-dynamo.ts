/* eslint-disable no-console */

import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConversationRole,
} from '@aws-sdk/client-bedrock-runtime'
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { InvoiceEntry } from '@imovel/core/domain/ledger-entry'
import { ContractRepositoryDynamo, PaymentRepositoryDynamo } from '@imovel/data-access/repository'
import { simpleParser } from 'mailparser'
import { Readable } from 'stream'

const s3 = new S3Client({})
const bedrock = new BedrockRuntimeClient({
  region: 'us-east-1',
})
const RAW_PREFIX = process.env.RAW_PREFIX || 'raw/'
const PARSED_PREFIX = process.env.PARSED_PREFIX || 'parsed/'

export async function extractPixDataFromText(rawText: string) {
  const prompt = `
Você é um assistente que extrai dados estruturados de comprovantes de Pix.

A partir do texto abaixo, extraia APENAS:

- nome do remetente
- CPF ou CNPJ do remetente (pode estar mascarado)
- valor do Pix (como número, exemplo: 2500.00)
- data do Pix no formato ISO (AAAA-MM-DD)

Responda ESTRITAMENTE em JSON, sem texto extra.

Exemplo de resposta:
{
  "sender_name": "Guilherme",
  "sender_document": "XXX.216.927-XX",
  "amount": 2500.00,
  "date": "2025-11-07"
}

Texto:
"""${rawText}"""
`
  const command = new ConverseCommand({
    modelId: 'amazon.nova-lite-v1:0',
    messages: [
      {
        role: ConversationRole.USER,
        content: [{ text: prompt }],
      },
    ],
    inferenceConfig: {
      maxTokens: 256,
      temperature: 0,
    },
    toolConfig: {
      tools: [
        {
          toolSpec: {
            name: 'extract_pix',
            description: 'Extrai os dados estruturados de comprovantes Pix',
            inputSchema: {
              json: {
                type: 'object',
                properties: {
                  sender_name: { type: 'string' },
                  sender_document: { type: 'string' },
                  amount: { type: 'number' },
                  date: { type: 'string' },
                },
                required: ['sender_name', 'sender_document', 'amount', 'date'],
              },
            },
          },
        },
      ],
      toolChoice: { tool: { name: 'extract_pix' } },
    },
  })

  const response = await bedrock.send(command)

  const content = response.output?.message?.content ?? []

  const toolUse = content.find((c) => c.toolUse)?.toolUse

  if (!toolUse) {
    console.error('Resposta inesperada:', response)
    throw new Error('Modelo não retornou JSON estruturado via toolUse.')
  }

  const data = toolUse.input as { [key: string]: any }

  return {
    sender_name: String(data?.sender_name ?? ''),
    sender_document: String(data?.sender_document ?? ''),
    amount: Number(data?.amount ?? 0),
    date: String(data?.date ?? ''),
  }
}

export const main = async (event: any) => {
  for (const rec of event.Records) {
    const Bucket = rec.s3.bucket.name
    const Key = decodeURIComponent(rec.s3.object.key.replace(/\+/g, ' '))
    if (!Key.startsWith(RAW_PREFIX)) continue

    const obj = await s3.send(new GetObjectCommand({ Bucket, Key }))
    const email = await simpleParser(obj.Body as Readable)

    const data = await extractPixDataFromText(email.html || '')

    const contractRepository = new ContractRepositoryDynamo()
    const contract = await contractRepository.findByDocument(data.sender_document)
    const payment = InvoiceEntry.create(
      contract ? contract.id : 'unknown',
      data.amount,
      new Date(data.date),
      contract ? contract.userId : data.sender_document,
      undefined,
      undefined,
      `Pagamento via Pix | arquivo S3: ${Key} | documento: ${data.sender_document} | nome: ${data.sender_name}`,
    )
    const paymentRepository = new PaymentRepositoryDynamo()
    await paymentRepository.save(payment)
    if (contract) {
      contract.updateLastPayment(payment.id, payment.date)
      console.log('Updated contract last payment:', contract.toJson())
      await contractRepository.save(contract)
    }

    const parsed = {
      from: email.from?.text || '',
      subject: email.subject || '',
      date: email.date ? email.date.toISOString() : '',
      pix_data: data,
    }

    console.log(parsed)

    const parsedKey = Key.replace(RAW_PREFIX, PARSED_PREFIX).replace(/\.eml$/i, '') + '.json'
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: parsedKey,
        Body: Buffer.from(JSON.stringify(parsed, null, 2), 'utf-8'),
        ContentType: 'application/json',
      }),
    )
  }

  return { ok: true }
}

/* eslint-disable no-console */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ApartmentRepository, PaymentRepository, PaymentService } from '@imovel/core'
import { htmlToText } from 'html-to-text'
import { simpleParser } from 'mailparser'
import { Readable } from 'stream'

const s3 = new S3Client({})
const RAW_PREFIX = process.env.RAW_PREFIX || 'raw/'
const PARSED_PREFIX = process.env.PARSED_PREFIX || 'parsed/'

function normalize(str: string) {
  return str
    .replace(/\r/g, '')
    .replace(/\u00A0/g, ' ')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .toLowerCase()
}
function parseBRLNumber(s: string): number {
  // remove R$, espaços, etc. — mantém dígitos, vírgula, hífen
  const only = s.replace(/[^\d,-]/g, '')
  // remove separadores de milhar e troca vírgula por ponto
  const normalized = only.replace(/\./g, '').replace(',', '.')
  const n = Number(normalized)
  if (Number.isNaN(n)) throw new Error('Valor inválido')
  return n
}

const reCpf = /(?:^|[^0-9xX])(([0-9xX]{3}\.){2}[0-9xX]{3}-[0-9xX]{2})(?![0-9xX])/
const reCnpj =
  /(?:^|[^0-9xX])([0-9xX]{2}\.[0-9xX]{3}\.[0-9xX]{3}\/[0-9xX]{4}-[0-9xX]{2})(?![0-9xX])/i
const reValor = /(?:^|[^\d])((?:r\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2})(?!\d)/i
const reData =
  /(?:^|[^\d])(\d{1,2}\/\d{1,2}\/\d{2,4})(?:\s*(?:às|as)?\s*(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*h)?)?/i

const candidateNamePatterns: RegExp[] = [
  /voce\s+recebeu\s+um\s+pix\s+de\s+([a-z0-9 .,'-]{3,80})/i,
  /pix\s+recebido\s+de\s+([a-z0-9 .,'-]{3,80})/i,
  /remetente[:\s]+([a-z0-9 .,'-]{3,80})/i,
  /pagador[:\s]+([a-z0-9 .,'-]{3,80})/i,
  /de[:\s]+([a-z0-9 .,'-]{3,80})\s+(?:cpf|cnpj)\b/i,
]

function pickFirst(re: RegExp, text: string) {
  const m = text.match(re)
  return m ? m[0] : undefined
}

function pickFirstGroup(patterns: RegExp[], text: string) {
  for (const p of patterns) {
    const m = text.match(p)
    if (m && m[1]) return m[1].trim()
  }
  return undefined
}

async function invokeLambda(payload: any) {
  try {
    const [dd, mm, yyyy] = payload.data.split('/').map(Number)
    const msDate = Date.UTC(yyyy, mm - 1, dd)
    const dueDate = new Date(msDate)

    const paymentRepository = PaymentRepository.getInstance()
    const apartmentRepository = ApartmentRepository.getInstance()
    const paymentService = new PaymentService(paymentRepository, apartmentRepository)
    console.log('aaaa', {
      doc: payload.cpf || payload.cnpj,
      name: payload.quemFez,
      amount: parseBRLNumber(payload.valor),
      dueDate: dueDate,
      contractId: payload.cpf || payload.cnpj,
    })
    const data = await paymentService.createPayment({
      doc: payload.cpf.trim() || payload.cnpj.trim(),
      name: payload.quemFez.trim(),
      amount: parseBRLNumber(payload.valor),
      dueDate: dueDate.toISOString(),
      contractId: payload.cpf.trim() || payload.cnpj.trim(),
    })
    return data
  } catch (err) {
    console.error('Error invoking Lambda function:', err)
  }
}

export const main = async (event: any) => {
  for (const rec of event.Records) {
    const Bucket = rec.s3.bucket.name
    const Key = decodeURIComponent(rec.s3.object.key.replace(/\+/g, ' '))
    if (!Key.startsWith(RAW_PREFIX)) continue

    const obj = await s3.send(new GetObjectCommand({ Bucket, Key }))
    const mail = await simpleParser(obj.Body as Readable)

    const textOriginal =
      mail.text?.toString() ||
      (mail.html ? htmlToText(mail.html.toString(), { wordwrap: false }) : '')

    const textNorm = normalize(textOriginal || '')

    const cnpj = pickFirst(reCnpj, textOriginal || '') || pickFirst(reCnpj, textNorm || '')
    const cpf = pickFirst(reCpf, textOriginal || '') || pickFirst(reCpf, textNorm || '')
    const valor = pickFirst(reValor, textOriginal || '') || pickFirst(reValor, textNorm || '')

    let data: string | undefined
    {
      const m = (textOriginal || '').match(reData) || (textNorm || '').match(reData)
      if (m) data = m[1] + (m[2] ? ` ${m[2]}` : '')
    }

    let quemFez =
      pickFirstGroup(candidateNamePatterns, textOriginal || '') ||
      pickFirstGroup(candidateNamePatterns, textNorm || '')

    if (quemFez && textNorm.includes('airbnb')) quemFez = 'Airbnb'

    if (!quemFez) {
      const lines = (textOriginal || '').split(/\n+/)
      for (const ln of lines) {
        if (reCpf.test(ln) || reCnpj.test(ln)) {
          const cut = ln.split(/cpf|CPF|cnpj|CNPJ/)[0]
          const maybe = cut.replace(/.*de[:\s]+/i, '').trim()
          if (maybe.length >= 3 && maybe.length <= 80) {
            quemFez = maybe
            break
          }
        }
      }
    }

    const valorBR = valor?.replace(/^r\$\s*/i, 'R$ ')
    const idFiscal = cnpj || cpf

    const parsed = {
      s3: { bucket: Bucket, key: Key },
      subject: mail.subject,
      from: mail.from?.text,
      to: mail.to?.text,
      quemFez: quemFez,
      cpf: cpf || null,
      cnpj: cnpj || null,
      idFiscal: idFiscal || null,
      valor: valorBR || null,
      data: data || null,
      textPreview: (textOriginal || '').slice(0, 800),
      receivedAt: new Date().toISOString(),
    }
    console.log('Parsed email:', parsed)
    await invokeLambda(parsed)

    const parsedKey = Key.replace(RAW_PREFIX, PARSED_PREFIX).replace(/\.eml$/i, '') + '.json'
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: parsedKey,
        Body: Buffer.from(JSON.stringify(parsed, null, 2), 'utf-8'),
        ContentType: 'application/json',
      }),
    )

    console.log('Parsed saved:', { Bucket, parsedKey })
  }

  return { ok: true }
}

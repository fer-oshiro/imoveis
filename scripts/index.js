#!/usr/bin/env ts-node

import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = process.env.TABLE_NAME || 'imovel-fer-tableTable-onmvxzza'
const REGION = process.env.AWS_REGION || 'us-east-1'
const PK_NAME = process.env.PK_NAME || 'PK'
const SK_NAME = process.env.SK_NAME || 'SK'
const CONTACT_DOC_PATH = process.env.CONTACT_DOC_PATH || 'contactDocument'
const DRY_RUN = (process.env.DRY_RUN ?? 'false').toLowerCase() === 'true'

// --- Helpers ---------------------------------------------------------------

/** Monta nomes de atributos para UpdateExpression suportando caminho aninhado. */
function buildPathAttrNames(path) {
  const parts = path.split('.')
  const names = {}
  const tokens = parts.map((p, i) => {
    const k = `#n${i}`
    names[k] = p
    return k
  })
  return { names, pathExpr: tokens.join('.') }
}

/** Normaliza o documento para o formato XXX.123.456-XX */
export function normalizeMaskedCpfLike(doc) {
  const s = (doc || '').trim()

  // Caso 1: já vem mascarado com * ou X (***.ddd.ddd-**)
  const maskedMatch = s.match(/^[*X]{3}\.(\d{3})\.(\d{3})-[*X]{2}$/)
  if (maskedMatch) {
    const [, m1, m2] = maskedMatch
    return `XXX.${m1}.${m2}-XX`
  }

  // Caso 2: CPF completo (11 dígitos) -> mascara
  const digits = s.replace(/\D/g, '')
  if (digits.length === 11) {
    return `XXX.${digits.slice(3, 6)}.${digits.slice(6, 9)}-XX`
  }

  // Caso 3: fallback — só troca '*' por 'X' (idempotente)
  return s.replace(/\*/g, 'X')
}

/** Pagina um scan com filtro por sk = 'METADATA' e chama o callback por item. */
async function scanAll(ddb, onItem) {
  let ExclusiveStartKey = undefined
  let processed = 0

  do {
    const res = await ddb.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        // Filtra por sk = "METADATA"
        FilterExpression: '#sk = :sk',
        ExpressionAttributeNames: { '#sk': SK_NAME },
        ExpressionAttributeValues: { ':sk': 'METADATA' },
        ExclusiveStartKey,
      }),
    )

    for (const item of res.Items ?? []) {
      await onItem(item)
      processed++
      if (processed % 100 === 0) {
        console.log(`→ Processados ${processed} itens...`)
      }
    }

    ExclusiveStartKey = res.LastEvaluatedKey
  } while (ExclusiveStartKey)

  console.log(`✓ Concluído. Total processado: ${processed}`)
}

// --- Main ------------------------------------------------------------------

async function main() {
  if (!TABLE_NAME) {
    console.error('Defina TABLE_NAME no ambiente.')
    process.exit(1)
  }

  const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
    marshallOptions: { removeUndefinedValues: true },
  })

  const { names, pathExpr } = buildPathAttrNames(CONTACT_DOC_PATH)

  let updates = 0
  let skipped = 0

  await scanAll(ddb, async (item) => {
    const pk = item[PK_NAME]
    const sk = item[SK_NAME]

    // Obtém o valor atual (suporta caminho aninhado simples)
    const current = CONTACT_DOC_PATH.split('.').reduce(
      (acc, part) => (acc ? acc[part] : undefined),
      item,
    )

    if (!current || typeof current !== 'string') {
      skipped++
      return
    }

    const next = normalizeMaskedCpfLike(current)

    if (next === current) {
      skipped++
      return
    }

    console.log(`${pk} | ${sk} :: "${current}" -> "${next}"${DRY_RUN ? '  [dry-run]' : ''}`)

    if (DRY_RUN) return

    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { [PK_NAME]: pk, [SK_NAME]: sk },
        UpdateExpression: `SET ${pathExpr} = :v`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: { ':v': next },
      }),
    )

    updates++
  })

  console.log(`Resumo: atualizados=${updates} | sem mudança=${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

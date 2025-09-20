// npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const {
  DynamoDBDocumentClient,
  ScanCommand,
  TransactWriteCommand,
} = require('@aws-sdk/lib-dynamodb')

// ===== Config =====
const TABLE_NAME = process.env.TABLE_NAME || 'imovel-fer-tableTable-onmvxzza'
const REGION = process.env.AWS_REGION || 'us-east-1'

// Nomes dos atributos de chave
const PK_ATTR = process.env.PK_ATTR || 'PK'
const SK_ATTR = process.env.SK_ATTR || 'SK'

// Valor antigo e novo do SK
const OLD_SK_VALUE = process.env.OLD_SK_VALUE || 'INFO'
const NEW_SK_VALUE = process.env.NEW_SK_VALUE || 'METADATA'

// Opcional: filtrar apenas partições que começam com este prefixo (ex.: APARTMENT#)
// Para migrar TUDO que tiver SK=INFO, defina PK_PREFIX="" (string vazia)
const PK_PREFIX = process.env.PK_PREFIX ?? 'APARTMENT#'

// Paginação e modo
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT || '1000')
const DRY_RUN = String(process.env.DRY_RUN || 'true').toLowerCase() === 'true'

// ===== Clients =====
const ddb = new DynamoDBClient({ region: REGION })
const doc = DynamoDBDocumentClient.from(ddb, { marshallOptions: { removeUndefinedValues: true } })

// ===== Scan: encontra itens a migrar =====
async function* scanItems() {
  let lastKey

  // Monta FilterExpression dinamicamente
  const usePrefix = PK_PREFIX !== ''
  const FilterExpression = usePrefix ? 'begins_with(#pk, :prefix) AND #sk = :old' : '#sk = :old'

  const ExpressionAttributeNames = { '#pk': PK_ATTR, '#sk': SK_ATTR }
  const ExpressionAttributeValues = usePrefix
    ? { ':prefix': PK_PREFIX, ':old': OLD_SK_VALUE }
    : { ':old': OLD_SK_VALUE }

  do {
    const res = await doc.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: PAGE_LIMIT,
        FilterExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ExclusiveStartKey: lastKey,
      }),
    )
    for (const it of res.Items ?? []) yield it
    lastKey = res.LastEvaluatedKey
  } while (lastKey)
}

// ===== Migra UM item (Put novo + Delete antigo) =====
async function migrateOne(item) {
  const oldPk = item[PK_ATTR]
  const oldSk = item[SK_ATTR]

  if (typeof oldPk !== 'string' || typeof oldSk !== 'string')
    return { skipped: true, reason: 'invalid key' }
  if (oldSk !== OLD_SK_VALUE) return { skipped: true, reason: 'sk not match' }

  const newItem = JSON.parse(JSON.stringify(item))
  newItem[SK_ATTR] = NEW_SK_VALUE

  if (DRY_RUN) {
    console.log(`[dry-run] PUT ${oldPk} | ${NEW_SK_VALUE}  ;  DEL ${oldPk} | ${oldSk}`)
    return { applied: false }
  }

  const tx = {
    TransactItems: [
      {
        Put: {
          TableName: TABLE_NAME,
          Item: newItem,
          ConditionExpression: 'attribute_not_exists(#pk) AND attribute_not_exists(#sk)',
          ExpressionAttributeNames: { '#pk': PK_ATTR, '#sk': SK_ATTR },
        },
      },
      {
        Delete: {
          TableName: TABLE_NAME,
          Key: { [PK_ATTR]: oldPk, [SK_ATTR]: oldSk },
          ConditionExpression: 'attribute_exists(#pk) AND attribute_exists(#sk)',
          ExpressionAttributeNames: { '#pk': PK_ATTR, '#sk': SK_ATTR },
        },
      },
    ],
  }

  // Retry simples
  let attempts = 0
  while (true) {
    try {
      await doc.send(new TransactWriteCommand(tx))
      return { applied: true }
    } catch (err) {
      attempts++
      const status = err?.$metadata?.httpStatusCode || 0
      const retryable =
        err?.name === 'TransactionCanceledException' ||
        err?.name === 'ProvisionedThroughputExceededException' ||
        err?.name === 'ThrottlingException' ||
        status >= 500

      // Se já existe o novo item, pulamos este registro
      if (err?.name === 'ConditionalCheckFailedException') {
        console.warn(`[skip] Já existe ${oldPk} | ${NEW_SK_VALUE} (ConditionCheckFailed)`)
        return { skipped: true, reason: 'exists-new' }
      }

      if (retryable && attempts < 6) {
        const backoff = Math.min(200 * 2 ** (attempts - 1), 2000)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }
      console.error(`[error] Falha ao migrar ${oldPk} | ${oldSk}:`, err)
      return { skipped: true, reason: 'error' }
    }
  }
}

// ===== Main =====
;(async () => {
  console.log(`[start] table=${TABLE_NAME} region=${REGION} dryRun=${DRY_RUN}`)
  console.log(
    `[filter] PK_PREFIX=${PK_PREFIX === '' ? '(TODOS)' : PK_PREFIX} ; FROM SK="${OLD_SK_VALUE}" TO SK="${NEW_SK_VALUE}"`,
  )

  let scanned = 0,
    matched = 0,
    applied = 0,
    skipped = 0

  for await (const item of scanItems()) {
    scanned++
    matched++
    const res = await migrateOne(item)
    if (res?.applied) applied++
    else skipped++
  }

  console.log(
    `[done] scanned=${scanned} matched=${matched} applied=${applied} skipped=${skipped} dryRun=${DRY_RUN}`,
  )
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

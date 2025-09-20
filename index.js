// npm i @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

// ===== Config =====
const TABLE_NAME = process.env.TABLE_NAME || 'imovel-fer-tableTable-onmvxzza'
const REGION = process.env.AWS_REGION || 'us-east-1'
const PK_ATTR = process.env.PK_ATTR || 'PK'
const SK_ATTR = process.env.SK_ATTR || 'SK'

// Só mexe em itens cujo PK começa com este prefixo
const PK_PREFIX = process.env.PK_PREFIX || 'APARTMENT#'

// Paginação do Scan
const PAGE_LIMIT = Number(process.env.PAGE_LIMIT || '1000')

// Segurança: começa em DRY-RUN
const DRY_RUN = String(process.env.DRY_RUN || 'true').toLowerCase() === 'true'

// Mapeamento de renome
const RENAME_MAP = [
  { old: 'unidade', neu: 'unitLabel' },
  { old: 'tipoDeContrato', neu: 'rentalType' },
  { old: 'valorBase', neu: 'baseRent' },
  { old: 'valorFaxina', neu: 'cleaningFee' },
  { old: 'faxina', neu: 'hasCleaningService' },
  { old: 'telefone', neu: 'contactPhone' },
  { old: 'agua', neu: 'waterIncluded' },
  { old: 'name', neu: 'contactName' },
  { old: 'luz', neu: 'electricityIncluded' },
  { old: 'cpf', neu: 'contactDocument' },
]

// ===== Clients =====
const ddb = new DynamoDBClient({ region: REGION })
const doc = DynamoDBDocumentClient.from(ddb, {
  marshallOptions: { removeUndefinedValues: true },
})

// ===== Helpers =====
function extractUnitCode(pk, prefix) {
  if (typeof pk !== 'string' || !pk.startsWith(prefix)) return undefined
  const after = pk.slice(prefix.length) // tudo após 'APARTMENT#'
  // se houver outro '#', corta antes dele
  const hash = after.indexOf('#')
  return hash === -1 ? after : after.slice(0, hash)
}

async function* scanByPrefix() {
  let ExclusiveStartKey
  do {
    const res = await doc.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: PAGE_LIMIT,
        FilterExpression: 'begins_with(#pk, :prefix)',
        ExpressionAttributeNames: { '#pk': PK_ATTR },
        ExpressionAttributeValues: { ':prefix': PK_PREFIX },
        ExclusiveStartKey,
      }),
    )
    for (const item of res.Items ?? []) yield item
    ExclusiveStartKey = res.LastEvaluatedKey
  } while (ExclusiveStartKey)
}

function buildUpdateForItem(item) {
  const ean = {}
  const eav = {}
  const setParts = []
  const removeParts = []

  const pk = item[PK_ATTR]
  const sk = item[SK_ATTR]

  if (!pk || !sk) return null

  // unitCode
  const unitCode = extractUnitCode(pk, PK_PREFIX)
  if (unitCode) {
    ean['#unitCode'] = 'unitCode'
    eav[':unitCode'] = unitCode
    setParts.push('#unitCode = if_not_exists(#unitCode, :unitCode)')
  }

  // renomes
  for (const { old, neu } of RENAME_MAP) {
    if (Object.prototype.hasOwnProperty.call(item, old)) {
      // set novo se ainda não existir
      const newAlias = `#${neu}`
      const oldAlias = `#${old}`
      const valAlias = `:${neu}`

      ean[newAlias] = neu
      ean[oldAlias] = old
      eav[valAlias] = item[old]

      setParts.push(`${newAlias} = if_not_exists(${newAlias}, ${valAlias})`)
      removeParts.push(oldAlias)
    }
  }

  if (!setParts.length && !removeParts.length) return null

  const UpdateExpression =
    `SET ${setParts.join(', ')}` + (removeParts.length ? ` REMOVE ${removeParts.join(', ')}` : '')

  return {
    Key: { [PK_ATTR]: pk, [SK_ATTR]: sk },
    UpdateExpression,
    ExpressionAttributeNames: ean,
    ExpressionAttributeValues: eav,
  }
}

async function updateWithRetry(params) {
  let attempts = 0
  while (true) {
    try {
      await doc.send(new UpdateCommand({ TableName: TABLE_NAME, ...params }))
      return
    } catch (err) {
      attempts++
      const status = err?.$metadata?.httpStatusCode || 0
      const retryable =
        err?.name === 'ProvisionedThroughputExceededException' ||
        err?.name === 'ThrottlingException' ||
        status >= 500
      if (retryable && attempts < 6) {
        const backoff = Math.min(200 * 2 ** (attempts - 1), 2000)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }
      throw err
    }
  }
}

// ===== Main =====
;(async () => {
  console.log(`[start] table=${TABLE_NAME} region=${REGION} dryRun=${DRY_RUN}`)
  console.log(`[filter] PK begins_with "${PK_PREFIX}"`)

  let scanned = 0
  let matched = 0
  let planned = 0
  let applied = 0

  for await (const item of scanByPrefix()) {
    scanned++

    const params = buildUpdateForItem(item)
    if (!params) continue
    matched++
    planned++

    if (DRY_RUN) {
      console.log(
        `[dry-run] Key(${PK_ATTR}=${params.Key[PK_ATTR]}, ${SK_ATTR}=${params.Key[SK_ATTR]}) ` +
          `UpdateExpression="${params.UpdateExpression}"`,
      )
      continue
    }

    try {
      await updateWithRetry(params)
      applied++
    } catch (err) {
      console.error(
        `[error] Failed to update Key(${PK_ATTR}=${params.Key[PK_ATTR]}, ${SK_ATTR}=${params.Key[SK_ATTR]}):`,
        err,
      )
      // segue para o próximo item
    }
  }

  console.log(
    `[done] scanned=${scanned} items | matchedForUpdate=${matched} | planned=${planned} | applied=${applied}`,
  )
  if (DRY_RUN) {
    console.log('DRY_RUN=true → nenhuma modificação foi feita.')
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

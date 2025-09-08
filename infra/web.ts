import { backend } from './api'
import { poolClient } from './cognito'

const stage = process.env.SST_STAGE ?? 'dev'
const isProd = stage === 'prod'
const isStg = stage === 'stg'

// Defina os domínios por stage:
const domain = isProd ? 'imovel.charmbyte.dev' : 'stg.imovel.charmbyte.dev'

export const web = new sst.aws.Nextjs('web', {
  path: 'packages/web',
  domain,
  environment: {
    NEXT_PUBLIC_COGNITO_CLIENT_ID: poolClient.id,
    NEXT_PUBLIC_API_URL: backend.url,
  },
})

import { backend } from './api'
import { poolClient } from './cognito'

const stage = $app.stage ?? 'dev'
const isProd = stage === 'prod'

const domain = isProd ? 'imovel.charmbyte.dev' : 'stg.imovel.charmbyte.dev'

export const web = new sst.aws.Nextjs('web', {
  path: 'apps/web',
  domain,
  environment: {
    NEXT_PUBLIC_COGNITO_CLIENT_ID: poolClient.id,
    NEXT_PUBLIC_API_URL: backend.url,
  },
})

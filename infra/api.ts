import { poolClient, userPool } from './cognito'
import { UserTable } from './dynamo'
import { bucket } from './storage'

export const myApi = new sst.aws.Function('MyApi', {
  url: true,
  link: [bucket, UserTable],
  handler: 'apps/api/src/api.handler',
})

export const backend = new sst.aws.ApiGatewayV2('Backend')
const authorizer = backend.addAuthorizer({
  name: 'MyAuthorizer',
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [poolClient.id],
  },
})
backend.route(
  'GET /{proxy+}',
  {
    url: true,
    link: [bucket, UserTable],
    handler: 'apps/api/src/api.handler',
  },
  {
    auth: {
      jwt: {
        authorizer: authorizer.id,
      },
    },
  },
)

backend.route(
  'POST /{proxy+}',
  {
    url: true,
    link: [bucket, UserTable],
    handler: 'apps/api/src/api.handler',
  },
  {
    auth: {
      jwt: {
        authorizer: authorizer.id,
      },
    },
  },
)

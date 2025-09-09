import { awsLambdaFastify } from '@fastify/aws-lambda'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'

import { apartamentos } from './apartamentos'
import { app } from './app'
import { comprovantes } from './comprovantes'
import { img } from './img'

const proxy = awsLambdaFastify(app)

export const handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  if (event.rawPath.startsWith('/apartamentos')) return apartamentos()
  if (event.rawPath.startsWith('/comprovantes')) return comprovantes(event)
  if (event.rawPath.startsWith('/img')) return img(event)
  return proxy(event, context)
}

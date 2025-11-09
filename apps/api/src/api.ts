import { awsLambdaFastify } from '@fastify/aws-lambda'
import { APIGatewayProxyHandlerV2 } from 'aws-lambda'

import { app } from './app'

const proxy = awsLambdaFastify(app)

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  return proxy(event, context)
}

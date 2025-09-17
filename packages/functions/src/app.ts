import fastify from 'fastify'
import { ZodError } from 'zod'

import { envConfig } from './config/env'
import { Routes } from './http/routes'
import logger from './infra/logger'

export const app = fastify()

app.register(Routes)

app.setErrorHandler(async (error, _, reply) => {
  const env = await envConfig()
  if (error instanceof ZodError) {
    return reply.status(400).send({ message: 'Validation error.', issues: error.format() })
  }
  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    logger.error(error)
  }
  return reply.status(500).send({ message: 'Internal server error.' })
})

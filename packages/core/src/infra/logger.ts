import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  name: process.env.SERVICE_NAME ?? 'imovel-api',
  redact: { paths: ['req.headers.authorization', 'password', 'token'], remove: true },
  base: { env: process.env.NODE_ENV ?? 'dev' },
})

import { FastifyInstance } from 'fastify'
import { apartmentRoutes } from './apartment/apartment.routes'

export async function Routes(app: FastifyInstance) {
  await app.register(apartmentRoutes, { prefix: '/apartments' })
  await app.register(apartmentRoutes, { prefix: '/payments' })
  await app.register(apartmentRoutes, { prefix: '/files' })
}

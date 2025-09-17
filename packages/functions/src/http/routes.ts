import { FastifyInstance } from 'fastify'
import { apartmentRoutes } from './apartment/apartment.routes'
import { userRoutes } from './user/user.routes'
import { contractRoutes } from './contract/contract.routes'
import { paymentRoutes } from './payment/payment.routes'

export async function Routes(app: FastifyInstance) {
  await app.register(apartmentRoutes, { prefix: '/apartments' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(contractRoutes, { prefix: '/contracts' })
  await app.register(paymentRoutes, { prefix: '/payments' })

  // Legacy routes for backward compatibility
  await app.register(apartmentRoutes, { prefix: '/files' })
}

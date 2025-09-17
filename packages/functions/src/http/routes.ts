import { FastifyInstance } from 'fastify'
import { apartmentRoutes } from './apartment/apartment.routes'
import { userRoutes } from './user/user.routes'
import { contractRoutes } from './contract/contract.routes'
import { paymentRoutes } from './payment/payment.routes'
import { relationshipRoutes } from './relationship/relationship.routes'

export async function Routes(app: FastifyInstance) {
  // New domain-based routes
  await app.register(apartmentRoutes, { prefix: '/apartments' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(contractRoutes, { prefix: '/contracts' })
  await app.register(paymentRoutes, { prefix: '/payments' })
  await app.register(relationshipRoutes, { prefix: '/relationships' })

  // Legacy routes for backward compatibility
  await app.register(apartmentRoutes, { prefix: '/files' })

  // Additional legacy route mappings to maintain API compatibility
  await app.register(async (app: FastifyInstance) => {
    // Legacy comprovantes routes
    app.get('/comprovantes', async () => {
      const paymentController = new (
        await import('./payment/payment.controller')
      ).PaymentController()
      return paymentController.getAllPaymentProofs()
    })

    app.post('/comprovantes', async (request) => {
      const paymentController = new (
        await import('./payment/payment.controller')
      ).PaymentController()
      return paymentController.submitLegacyPaymentProof(request.body)
    })

    // Legacy apartamentos route
    app.get('/apartamentos', async () => {
      const apartmentController = new (
        await import('./apartment/apartment.controller')
      ).ApartmentController()
      return apartmentController.getApartmentsWithLastPayment()
    })
  })
}

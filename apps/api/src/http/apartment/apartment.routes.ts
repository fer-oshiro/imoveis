import { FastifyInstance } from 'fastify'
import { ApartmentRepositoryDynamo } from '@imovel/data-access'

import { ApartmentController } from './apartment.controller'

export async function apartmentRoutes(app: FastifyInstance) {
  const apartmentRepository = new ApartmentRepositoryDynamo()
  const controller = new ApartmentController(apartmentRepository)

  app.get('/with-payment-info', async () => {
    return controller.getApartmentsWithLastPayment()
  })

  app.get('/', async () => {
    return controller.getAllApartments()
  })
}

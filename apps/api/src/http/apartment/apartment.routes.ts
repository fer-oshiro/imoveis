import { FastifyInstance } from 'fastify'

import {
  ApartmentRepositoryDynamo,
  ContractRepositoryDynamo,
  UserRepositoryDynamo,
} from '@imovel/data-access'

import { ApartmentController } from './apartment.controller'

export async function apartmentRoutes(app: FastifyInstance) {
  const apartmentRepository = new ApartmentRepositoryDynamo()
  const contractRepository = new ContractRepositoryDynamo()
  const userRepository = new UserRepositoryDynamo()
  const controller = new ApartmentController(
    apartmentRepository,
    contractRepository,
    userRepository,
  )

  app.get('/with-payment-info', async () => {
    return controller.getApartmentsWithLastPayment()
  })

  app.get('/', async () => {
    return controller.getAllApartments()
  })
}

import { FastifyInstance } from 'fastify'

import { ApartmentController } from './apartment.controller'
import {
  CreateApartmentDto,
  UpdateApartmentDto,
  ApartmentQueryDto,
} from '../../domain/apartment/dto'
import { ApartmentStatus, RentalType } from '../../domain/apartment/vo/apartment-enums.vo'

export async function apartmentRoutes(app: FastifyInstance) {
  const controller = new ApartmentController()

  // Main admin view: apartments with last payment info
  app.get('/with-payment-info', async () => {
    return controller.getApartmentsWithLastPayment()
  })

  // Landing page: available apartments for long-term rental
  app.get('/available', async () => {
    return controller.getAvailableApartments()
  })

  // Landing page: Airbnb apartments
  app.get('/airbnb', async () => {
    return controller.getAirbnbApartments()
  })

  // Get apartments by status
  app.get('/status/:status', async (request) => {
    const params = request.params as { status: ApartmentStatus }
    return controller.getApartmentsByStatus(params.status)
  })

  // Get apartments by rental type
  app.get('/rental-type/:rentalType', async (request) => {
    const params = request.params as { rentalType: RentalType }
    return controller.getApartmentsByRentalType(params.rentalType)
  })

  // Query apartments with filters
  app.post('/query', async (request) => {
    const body = request.body as ApartmentQueryDto
    return controller.queryApartments(body)
  })

  // Get apartment details with users and contracts
  app.get('/:unitCode/details', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentDetails(params.unitCode)
  })

  // Get apartment log with history
  app.get('/:unitCode/log', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentLog(params.unitCode)
  })

  // Get apartment users (relationships)
  app.get('/:unitCode/users', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentUsers(params.unitCode)
  })

  // Get apartment contracts
  app.get('/:unitCode/contracts', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentContracts(params.unitCode)
  })

  // Get apartment payments
  app.get('/:unitCode/payments', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentPayments(params.unitCode)
  })

  // Get single apartment by unit code
  app.get('/:unitCode', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getApartmentByUnitCode(params.unitCode)
  })

  // Create new apartment
  app.post('/', async (request) => {
    const body = request.body as CreateApartmentDto
    const createdBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.createApartment(body, createdBy)
  })

  // Update apartment
  app.put('/:unitCode', async (request) => {
    const params = request.params as { unitCode: string }
    const body = request.body as UpdateApartmentDto
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.updateApartment(params.unitCode, body, updatedBy)
  })

  // Deactivate apartment
  app.patch('/:unitCode/deactivate', async (request) => {
    const params = request.params as { unitCode: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.deactivateApartment(params.unitCode, updatedBy)
  })

  // Legacy routes for backward compatibility
  // This maintains the original /apartamentos API contract
  app.get('/', async () => {
    return controller.getApartmentsWithLastPayment()
  })
}

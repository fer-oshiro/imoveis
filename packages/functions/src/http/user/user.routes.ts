import { FastifyInstance } from 'fastify'
import { UserController } from './user.controller'
import { UserStatus } from '../../domain/user/entities/user.entity'

export async function userRoutes(app: FastifyInstance) {
  const controller = new UserController()

  // Get all users
  app.get('/', async () => {
    return controller.getAllUsers()
  })

  // Get user by phone number
  app.get('/:phoneNumber', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserByPhoneNumber(params.phoneNumber)
  })

  // Get user details with relationships and payment history
  app.get('/:phoneNumber/details', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserDetails(params.phoneNumber)
  })

  // Get enhanced user details with aggregated data
  app.get('/:phoneNumber/details/enhanced', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserDetailsEnhanced(params.phoneNumber)
  })

  // Get users by status
  app.get('/status/:status', async (request) => {
    const params = request.params as { status: UserStatus }
    return controller.getUsersByStatus(params.status)
  })

  // Get users by apartment
  app.get('/apartment/:unitCode', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getUsersByApartment(params.unitCode)
  })

  // Get user apartments (relationships)
  app.get('/:phoneNumber/apartments', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserApartments(params.phoneNumber)
  })

  // Get user contracts
  app.get('/:phoneNumber/contracts', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserContracts(params.phoneNumber)
  })

  // Get user payments
  app.get('/:phoneNumber/payments', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getUserPayments(params.phoneNumber)
  })

  // Search users
  app.get('/search', async (request) => {
    const query = request.query as { name?: string; status?: UserStatus }
    return controller.searchUsers(query)
  })

  // Create new user
  app.post('/', async (request) => {
    const body = request.body as any // Will be validated by the controller
    const createdBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.createUser(body, createdBy)
  })

  // Update user
  app.put('/:phoneNumber', async (request) => {
    const params = request.params as { phoneNumber: string }
    const body = request.body as any // Will be validated by the controller
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.updateUser(params.phoneNumber, body, updatedBy)
  })

  // Activate user
  app.patch('/:phoneNumber/activate', async (request) => {
    const params = request.params as { phoneNumber: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.activateUser(params.phoneNumber, updatedBy)
  })

  // Deactivate user
  app.patch('/:phoneNumber/deactivate', async (request) => {
    const params = request.params as { phoneNumber: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.deactivateUser(params.phoneNumber, updatedBy)
  })

  // Suspend user
  app.patch('/:phoneNumber/suspend', async (request) => {
    const params = request.params as { phoneNumber: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.suspendUser(params.phoneNumber, updatedBy)
  })

  // Delete user
  app.delete('/:phoneNumber', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.deleteUser(params.phoneNumber)
  })

  // Validate user exists
  app.get('/:phoneNumber/validate/exists', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.validateUserExists(params.phoneNumber)
  })

  // Validate document uniqueness
  app.post('/validate/document', async (request) => {
    const body = request.body as { document: string; excludePhoneNumber?: string }
    return controller.validateDocumentUnique(body.document, body.excludePhoneNumber)
  })
}

import { FastifyInstance } from 'fastify'

import { RelationshipController } from './relationship.controller'
import {
  CreateUserApartmentRelationDto,
  UpdateUserApartmentRelationDto,
} from '../../domain/relationship/dto'
import { UserRole } from '../../domain/relationship/vo/user-role.vo'

export async function relationshipRoutes(app: FastifyInstance) {
  const controller = new RelationshipController()

  // Get all relationships for an apartment
  app.get('/apartment/:unitCode', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getRelationshipsByApartment(params.unitCode)
  })

  // Get all relationships for a user
  app.get('/user/:phoneNumber', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getRelationshipsByUser(params.phoneNumber)
  })

  // Get active relationships for an apartment
  app.get('/apartment/:unitCode/active', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getActiveRelationshipsByApartment(params.unitCode)
  })

  // Get active relationships for a user
  app.get('/user/:phoneNumber/active', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getActiveRelationshipsByUser(params.phoneNumber)
  })

  // Get relationships by role
  app.get('/role/:role', async (request) => {
    const params = request.params as { role: UserRole }
    return controller.getRelationshipsByRole(params.role)
  })

  // Get specific relationship
  app.get('/apartment/:unitCode/user/:phoneNumber', async (request) => {
    const params = request.params as { unitCode: string; phoneNumber: string }
    return controller.getRelationship(params.unitCode, params.phoneNumber)
  })

  // Create new relationship
  app.post('/', async (request) => {
    const body = request.body as CreateUserApartmentRelationDto
    const createdBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.createRelationship(body, createdBy)
  })

  // Update relationship
  app.put('/apartment/:unitCode/user/:phoneNumber', async (request) => {
    const params = request.params as { unitCode: string; phoneNumber: string }
    const body = request.body as UpdateUserApartmentRelationDto
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.updateRelationship(params.unitCode, params.phoneNumber, body, updatedBy)
  })

  // Deactivate relationship
  app.patch('/apartment/:unitCode/user/:phoneNumber/deactivate', async (request) => {
    const params = request.params as { unitCode: string; phoneNumber: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.deactivateRelationship(params.unitCode, params.phoneNumber, updatedBy)
  })

  // Activate relationship
  app.patch('/apartment/:unitCode/user/:phoneNumber/activate', async (request) => {
    const params = request.params as { unitCode: string; phoneNumber: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.activateRelationship(params.unitCode, params.phoneNumber, updatedBy)
  })

  // Delete relationship
  app.delete('/apartment/:unitCode/user/:phoneNumber', async (request) => {
    const params = request.params as { unitCode: string; phoneNumber: string }
    return controller.deleteRelationship(params.unitCode, params.phoneNumber)
  })

  // Bulk operations
  app.post('/bulk/create', async (request) => {
    const body = request.body as { relationships: CreateUserApartmentRelationDto[] }
    const createdBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.createBulkRelationships(body.relationships, createdBy)
  })

  app.patch('/bulk/deactivate', async (request) => {
    const body = request.body as { relationships: Array<{ unitCode: string; phoneNumber: string }> }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.deactivateBulkRelationships(body.relationships, updatedBy)
  })
}

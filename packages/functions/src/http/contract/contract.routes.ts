import { FastifyInstance } from 'fastify'
import { ContractController } from './contract.controller'
import { CreateContractDto, UpdateContractDto, RenewContractDto } from '../../domain/contract/dto'
import { ContractStatus } from '../../domain/contract/vo/contract-enums.vo'

export async function contractRoutes(app: FastifyInstance) {
  const controller = new ContractController()

  // Get contract by ID
  app.get('/:contractId', async (request) => {
    const params = request.params as { contractId: string }
    return controller.getContractById(params.contractId)
  })

  // Get active contract by apartment
  app.get('/apartment/:unitCode/active', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getActiveContractByApartment(params.unitCode)
  })

  // Get all contracts by apartment
  app.get('/apartment/:unitCode', async (request) => {
    const params = request.params as { unitCode: string }
    return controller.getContractsByApartment(params.unitCode)
  })

  // Get contracts by tenant
  app.get('/tenant/:phoneNumber', async (request) => {
    const params = request.params as { phoneNumber: string }
    return controller.getContractsByTenant(params.phoneNumber)
  })

  // Get contracts by status
  app.get('/status/:status', async (request) => {
    const params = request.params as { status: ContractStatus }
    return controller.getContractsByStatus(params.status)
  })

  // Get expiring contracts
  app.get('/expiring', async (request) => {
    const query = request.query as { daysFromNow?: string }
    const daysFromNow = query.daysFromNow ? parseInt(query.daysFromNow, 10) : undefined
    return controller.getExpiringContracts(daysFromNow)
  })

  // Create new contract
  app.post('/', async (request) => {
    const body = request.body as CreateContractDto
    return controller.createContract(body)
  })

  // Update contract
  app.put('/:contractId', async (request) => {
    const params = request.params as { contractId: string }
    const body = request.body as UpdateContractDto
    return controller.updateContract(params.contractId, body)
  })

  // Terminate contract
  app.patch('/:contractId/terminate', async (request) => {
    const params = request.params as { contractId: string }
    const updatedBy = (request as any).user?.phoneNumber // Assuming auth middleware sets user
    return controller.terminateContract(params.contractId, updatedBy)
  })

  // Renew contract
  app.patch('/:contractId/renew', async (request) => {
    const params = request.params as { contractId: string }
    const body = request.body as RenewContractDto
    return controller.renewContract(params.contractId, body)
  })

  // Delete contract
  app.delete('/:contractId', async (request) => {
    const params = request.params as { contractId: string }
    return controller.deleteContract(params.contractId)
  })
}

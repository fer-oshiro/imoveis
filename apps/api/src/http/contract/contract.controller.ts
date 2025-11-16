import { CreateContractDto, UpdateContractDto, RenewContractDto } from '../../domain/contract/dto'
import { ContractRepository } from '../../domain/contract/repositories/contract.repository'
import { ContractService } from '../../domain/contract/services/contract.service'
import { ContractStatus } from '../../domain/contract/vo/contract-enums.vo'
import { DomainError } from '../../domain/shared/errors/domain-error'

export class ContractController {
  private contractService: ContractService

  constructor() {
    const contractRepository = ContractRepository.getInstance()
    this.contractService = new ContractService(contractRepository)
  }

  // Get contract by ID
  async getContractById(contractId: string) {
    try {
      const contract = await this.contractService.getContractById(contractId)
      if (!contract) {
        throw new DomainError(`Contract with ID ${contractId} not found`, 'CONTRACT_NOT_FOUND', 404)
      }
      return contract
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contract', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get active contract by apartment
  async getActiveContractByApartment(unitCode: string) {
    try {
      return await this.contractService.getActiveContractByApartment(unitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get active contract', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get all contracts by apartment
  async getContractsByApartment(unitCode: string) {
    try {
      return await this.contractService.getContractsByApartment(unitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contracts by apartment', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get contracts by tenant
  async getContractsByTenant(phoneNumber: string) {
    try {
      return await this.contractService.getContractsByTenant(phoneNumber)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contracts by tenant', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get contracts by status
  async getContractsByStatus(status: ContractStatus) {
    try {
      return await this.contractService.getContractsByStatus(status)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contracts by status', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get expiring contracts
  async getExpiringContracts(daysFromNow?: number) {
    try {
      return await this.contractService.getExpiringContracts(daysFromNow)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get expiring contracts', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Create new contract
  async createContract(dto: CreateContractDto) {
    try {
      return await this.contractService.createContract(dto)
    } catch (error) {
      if (error instanceof Error) {
        // ContractService throws regular Error objects, convert to DomainError
        if (error.message.includes('already has an active contract')) {
          throw new DomainError(error.message, 'CONTRACT_CONFLICT_ERROR', 409)
        }
        throw new DomainError(error.message, 'CONTRACT_CREATE_ERROR', 400)
      }
      throw new DomainError('Failed to create contract', 'CONTRACT_CREATE_ERROR')
    }
  }

  // Update contract
  async updateContract(contractId: string, dto: UpdateContractDto) {
    try {
      return await this.contractService.updateContract(contractId, dto)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'CONTRACT_NOT_FOUND', 404)
        }
        throw new DomainError(error.message, 'CONTRACT_UPDATE_ERROR', 400)
      }
      throw new DomainError('Failed to update contract', 'CONTRACT_UPDATE_ERROR')
    }
  }

  // Terminate contract
  async terminateContract(contractId: string, updatedBy?: string) {
    try {
      const contract = await this.contractService.terminateContract(contractId, updatedBy)
      return { message: 'Contract terminated successfully', contract }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'CONTRACT_NOT_FOUND', 404)
        }
        throw new DomainError(error.message, 'CONTRACT_UPDATE_ERROR', 400)
      }
      throw new DomainError('Failed to terminate contract', 'CONTRACT_UPDATE_ERROR')
    }
  }

  // Renew contract
  async renewContract(contractId: string, dto: RenewContractDto) {
    try {
      return await this.contractService.renewContract(contractId, dto)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'CONTRACT_NOT_FOUND', 404)
        }
        if (error.message.includes('can be renewed')) {
          throw new DomainError(error.message, 'CONTRACT_BUSINESS_RULE_ERROR', 409)
        }
        throw new DomainError(error.message, 'CONTRACT_UPDATE_ERROR', 400)
      }
      throw new DomainError('Failed to renew contract', 'CONTRACT_UPDATE_ERROR')
    }
  }

  // Delete contract
  async deleteContract(contractId: string) {
    try {
      await this.contractService.deleteContract(contractId)
      return { message: 'Contract deleted successfully' }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new DomainError(error.message, 'CONTRACT_NOT_FOUND', 404)
        }
        if (error.message.includes('Cannot delete an active contract')) {
          throw new DomainError(error.message, 'CONTRACT_BUSINESS_RULE_ERROR', 409)
        }
        throw new DomainError(error.message, 'CONTRACT_DELETE_ERROR', 400)
      }
      throw new DomainError('Failed to delete contract', 'CONTRACT_DELETE_ERROR')
    }
  }

  // Get all contracts (admin view)
  async getAllContracts(query: { status?: ContractStatus; limit?: string; offset?: string }) {
    try {
      if (query.status) {
        return await this.contractService.getContractsByStatus(query.status)
      }
      // For now, return expiring contracts as a placeholder
      return await this.contractService.getExpiringContracts(365) // Get all contracts expiring in next year
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get all contracts', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get contract payments
  async getContractPayments(_contractId: string) {
    try {
      // This would typically require the payment service
      // For now, return empty array to maintain compatibility
      return []
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contract payments', 'CONTRACT_QUERY_ERROR')
    }
  }

  // Get contract history
  async getContractHistory(_contractId: string) {
    try {
      // This would typically require a history/audit service
      // For now, return empty array to maintain compatibility
      return []
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get contract history', 'CONTRACT_QUERY_ERROR')
    }
  }
}

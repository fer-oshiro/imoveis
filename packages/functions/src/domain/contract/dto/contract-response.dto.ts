import { ContractStatus } from '../vo/contract-enums.vo'
import { ContractTerms } from '../vo/contract-terms.vo'

export interface ContractResponseDto {
  contractId: string
  apartmentUnitCode: string
  tenantPhoneNumber: string
  startDate: string
  endDate: string
  status: ContractStatus
  terms: ContractTerms
  durationInMonths: number
  remainingDays: number
  isActive: boolean
  isExpired: boolean
  isTerminated: boolean
  isPending: boolean
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

export class ContractResponseDtoMapper {
  static fromEntity(contract: any): ContractResponseDto {
    return {
      contractId: contract.contractIdValue,
      apartmentUnitCode: contract.apartmentUnitCodeValue,
      tenantPhoneNumber: contract.tenantPhoneNumberValue,
      startDate: contract.startDateValue.toISOString(),
      endDate: contract.endDateValue.toISOString(),
      status: contract.statusValue,
      terms: contract.termsValue.toJSON(),
      durationInMonths: contract.getDurationInMonths(),
      remainingDays: contract.getRemainingDays(),
      isActive: contract.isActive(),
      isExpired: contract.isExpired(),
      isTerminated: contract.isTerminated(),
      isPending: contract.isPending(),
      createdAt: contract.metadataValue.createdAt.toISOString(),
      updatedAt: contract.metadataValue.updatedAt.toISOString(),
      createdBy: contract.metadataValue.createdBy,
      updatedBy: contract.metadataValue.updatedBy,
      version: contract.metadataValue.version,
    }
  }

  static fromEntities(contracts: any[]): ContractResponseDto[] {
    return contracts.map((contract) => this.fromEntity(contract))
  }
}

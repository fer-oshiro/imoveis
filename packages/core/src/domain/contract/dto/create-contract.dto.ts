import { ContractStatus } from '../vo/contract-enums.vo'
import { type ContractTerms } from '../vo/contract-terms.vo'

export interface CreateContractDto {
  apartmentUnitCode: string
  tenantPhoneNumber: string
  startDate: string | Date
  endDate: string | Date
  terms: ContractTerms
  status?: ContractStatus
  createdBy?: string
}

export class CreateContractDtoValidator {
  static validate(dto: CreateContractDto): void {
    if (!dto.apartmentUnitCode?.trim()) {
      throw new Error('Apartment unit code is required')
    }

    if (!dto.tenantPhoneNumber?.trim()) {
      throw new Error('Tenant phone number is required')
    }

    if (!dto.startDate) {
      throw new Error('Start date is required')
    }

    if (!dto.endDate) {
      throw new Error('End date is required')
    }

    const startDate = new Date(dto.startDate)
    const endDate = new Date(dto.endDate)

    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date format')
    }

    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid end date format')
    }

    if (endDate <= startDate) {
      throw new Error('End date must be after start date')
    }

    if (!dto.terms) {
      throw new Error('Contract terms are required')
    }

    if (!dto.terms.monthlyRent || dto.terms.monthlyRent <= 0) {
      throw new Error('Monthly rent must be greater than 0')
    }

    if (!dto.terms.paymentDueDay || dto.terms.paymentDueDay < 1 || dto.terms.paymentDueDay > 31) {
      throw new Error('Payment due day must be between 1 and 31')
    }
  }

  static sanitize(dto: CreateContractDto): CreateContractDto {
    return {
      ...dto,
      apartmentUnitCode: dto.apartmentUnitCode.trim().toUpperCase(),
      tenantPhoneNumber: dto.tenantPhoneNumber.trim(),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      terms: {
        ...dto.terms,
        monthlyRent: Number(dto.terms.monthlyRent),
        paymentDueDay: Number(dto.terms.paymentDueDay),
        securityDeposit: dto.terms.securityDeposit ? Number(dto.terms.securityDeposit) : undefined,
      },
    }
  }
}

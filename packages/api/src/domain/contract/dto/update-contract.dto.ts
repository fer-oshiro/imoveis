import { ContractTerms } from '../vo/contract-terms.vo'
import { ContractStatus } from '../vo/contract-enums.vo'

export interface UpdateContractDto {
  endDate?: string | Date
  status?: ContractStatus
  terms?: Partial<ContractTerms>
  updatedBy?: string
}

export class UpdateContractDtoValidator {
  static validate(dto: UpdateContractDto): void {
    if (dto.endDate) {
      const endDate = new Date(dto.endDate)
      if (isNaN(endDate.getTime())) {
        throw new Error('Invalid end date format')
      }
    }

    if (dto.terms) {
      if (dto.terms.monthlyRent !== undefined && dto.terms.monthlyRent <= 0) {
        throw new Error('Monthly rent must be greater than 0')
      }

      if (
        dto.terms.paymentDueDay !== undefined &&
        (dto.terms.paymentDueDay < 1 || dto.terms.paymentDueDay > 31)
      ) {
        throw new Error('Payment due day must be between 1 and 31')
      }

      if (dto.terms.securityDeposit !== undefined && dto.terms.securityDeposit < 0) {
        throw new Error('Security deposit cannot be negative')
      }
    }
  }

  static sanitize(dto: UpdateContractDto): UpdateContractDto {
    const sanitized: UpdateContractDto = { ...dto }

    if (dto.endDate) {
      sanitized.endDate = new Date(dto.endDate)
    }

    if (dto.terms) {
      sanitized.terms = { ...dto.terms }
      if (dto.terms.monthlyRent !== undefined) {
        sanitized.terms.monthlyRent = Number(dto.terms.monthlyRent)
      }
      if (dto.terms.paymentDueDay !== undefined) {
        sanitized.terms.paymentDueDay = Number(dto.terms.paymentDueDay)
      }
      if (dto.terms.securityDeposit !== undefined) {
        sanitized.terms.securityDeposit = Number(dto.terms.securityDeposit)
      }
    }

    return sanitized
  }
}

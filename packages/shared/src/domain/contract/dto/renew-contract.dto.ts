import { type ContractTerms } from '../vo/contract-terms.vo'

export interface RenewContractDto {
  newEndDate: string | Date
  newTerms?: Partial<ContractTerms>
  updatedBy?: string
}

export class RenewContractDtoValidator {
  static validate(dto: RenewContractDto): void {
    if (!dto.newEndDate) {
      throw new Error('New end date is required for contract renewal')
    }

    const newEndDate = new Date(dto.newEndDate)
    if (isNaN(newEndDate.getTime())) {
      throw new Error('Invalid new end date format')
    }

    const now = new Date()
    if (newEndDate <= now) {
      throw new Error('New end date must be in the future')
    }

    if (dto.newTerms) {
      if (dto.newTerms.monthlyRent !== undefined && dto.newTerms.monthlyRent <= 0) {
        throw new Error('Monthly rent must be greater than 0')
      }

      if (
        dto.newTerms.paymentDueDay !== undefined &&
        (dto.newTerms.paymentDueDay < 1 || dto.newTerms.paymentDueDay > 31)
      ) {
        throw new Error('Payment due day must be between 1 and 31')
      }

      if (dto.newTerms.securityDeposit !== undefined && dto.newTerms.securityDeposit < 0) {
        throw new Error('Security deposit cannot be negative')
      }
    }
  }

  static sanitize(dto: RenewContractDto): RenewContractDto {
    const sanitized: RenewContractDto = {
      ...dto,
      newEndDate: new Date(dto.newEndDate),
    }

    if (dto.newTerms) {
      sanitized.newTerms = { ...dto.newTerms }
      if (dto.newTerms.monthlyRent !== undefined) {
        sanitized.newTerms.monthlyRent = Number(dto.newTerms.monthlyRent)
      }
      if (dto.newTerms.paymentDueDay !== undefined) {
        sanitized.newTerms.paymentDueDay = Number(dto.newTerms.paymentDueDay)
      }
      if (dto.newTerms.securityDeposit !== undefined) {
        sanitized.newTerms.securityDeposit = Number(dto.newTerms.securityDeposit)
      }
    }

    return sanitized
  }
}

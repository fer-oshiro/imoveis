import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'

// Contract-specific errors
export class ContractNotFoundError extends EntityNotFoundError {
  constructor(contractId: string) {
    super('Contract', contractId)
    this.name = 'ContractNotFoundError'
  }
}

export class ContractAlreadyExistsError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string) {
    super(`Active contract already exists for apartment ${apartmentUnitCode}`)
    this.name = 'ContractAlreadyExistsError'
  }
}

export class InvalidContractDateError extends ValidationError {
  constructor(message: string) {
    super(message, 'contractDate')
    this.name = 'InvalidContractDateError'
  }
}

export class InvalidContractAmountError extends ValidationError {
  constructor(amount: number) {
    super(`Contract amount must be positive, got: ${amount}`, 'monthlyRent')
    this.name = 'InvalidContractAmountError'
  }
}

export class InvalidPaymentDueDayError extends ValidationError {
  constructor(day: number) {
    super(`Payment due day must be between 1 and 31, got: ${day}`, 'paymentDueDay')
    this.name = 'InvalidPaymentDueDayError'
  }
}

export class ContractDateOverlapError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string, startDate: Date, endDate: Date) {
    super(
      `Contract dates overlap with existing contract for apartment ${apartmentUnitCode} (${startDate.toISOString()} - ${endDate.toISOString()})`,
    )
    this.name = 'ContractDateOverlapError'
  }
}

export class ContractAlreadyTerminatedError extends BusinessRuleViolationError {
  constructor(contractId: string) {
    super(`Contract ${contractId} is already terminated`)
    this.name = 'ContractAlreadyTerminatedError'
  }
}

export class ContractNotActiveError extends BusinessRuleViolationError {
  constructor(contractId: string) {
    super(`Contract ${contractId} is not active`)
    this.name = 'ContractNotActiveError'
  }
}

export class ContractExpiredError extends BusinessRuleViolationError {
  constructor(contractId: string, endDate: Date) {
    super(`Contract ${contractId} expired on ${endDate.toISOString()}`)
    this.name = 'ContractExpiredError'
  }
}

export class InvalidContractStatusTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid contract status transition from ${from} to ${to}`)
    this.name = 'InvalidContractStatusTransitionError'
  }
}

export class ContractRenewalError extends BusinessRuleViolationError {
  constructor(contractId: string, reason: string) {
    super(`Cannot renew contract ${contractId}: ${reason}`)
    this.name = 'ContractRenewalError'
  }
}

export class ContractQueryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Contract query failed: ${message}`, 'CONTRACT_QUERY_ERROR', 500)
    this.name = 'ContractQueryError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class ContractCreateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to create contract: ${message}`, 'CONTRACT_CREATE_ERROR', 500)
    this.name = 'ContractCreateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class ContractUpdateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to update contract: ${message}`, 'CONTRACT_UPDATE_ERROR', 500)
    this.name = 'ContractUpdateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

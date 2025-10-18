import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'

export class ApartmentNotFoundError extends EntityNotFoundError {
  constructor(unitCode: string) {
    super('Apartment', unitCode)
    this.name = 'ApartmentNotFoundError'
  }
}

export class ApartmentAlreadyExistsError extends BusinessRuleViolationError {
  constructor(unitCode: string) {
    super(`Apartment with unit code ${unitCode} already exists`)
    this.name = 'ApartmentAlreadyExistsError'
  }
}

export class InvalidUnitCodeError extends ValidationError {
  constructor(unitCode: string) {
    super(`Invalid unit code format: ${unitCode}`, 'unitCode')
    this.name = 'InvalidUnitCodeError'
  }
}

export class InvalidRentalAmountError extends ValidationError {
  constructor(amount: number) {
    super(`Rental amount must be positive, got: ${amount}`, 'baseRent')
    this.name = 'InvalidRentalAmountError'
  }
}

export class InvalidAirbnbLinkError extends ValidationError {
  constructor(link: string) {
    super(`Invalid Airbnb link format: ${link}`, 'airbnbLink')
    this.name = 'InvalidAirbnbLinkError'
  }
}

export class ApartmentNotAvailableError extends BusinessRuleViolationError {
  constructor(unitCode: string) {
    super(`Apartment ${unitCode} is not available for rental`)
    this.name = 'ApartmentNotAvailableError'
  }
}

export class ApartmentOccupiedError extends BusinessRuleViolationError {
  constructor(unitCode: string) {
    super(`Cannot modify apartment ${unitCode} while it is occupied`)
    this.name = 'ApartmentOccupiedError'
  }
}

export class InvalidApartmentStatusTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid apartment status transition from ${from} to ${to}`)
    this.name = 'InvalidApartmentStatusTransitionError'
  }
}

export class ApartmentQueryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Apartment query failed: ${message}`, 'APARTMENT_QUERY_ERROR', 500)
    this.name = 'ApartmentQueryError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class ApartmentCreateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to create apartment: ${message}`, 'APARTMENT_CREATE_ERROR', 500)
    this.name = 'ApartmentCreateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class ApartmentUpdateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to update apartment: ${message}`, 'APARTMENT_UPDATE_ERROR', 500)
    this.name = 'ApartmentUpdateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

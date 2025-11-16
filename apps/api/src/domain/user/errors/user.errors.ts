import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'

// User-specific errors
export class UserNotFoundError extends EntityNotFoundError {
  constructor(phoneNumber: string) {
    super('User', phoneNumber)
    this.name = 'UserNotFoundError'
  }
}

export class UserAlreadyExistsError extends BusinessRuleViolationError {
  constructor(phoneNumber: string) {
    super(`User with phone number ${phoneNumber} already exists`)
    this.name = 'UserAlreadyExistsError'
  }
}

export class DocumentAlreadyExistsError extends BusinessRuleViolationError {
  constructor(document: string) {
    super(`User with document ${document} already exists`)
    this.name = 'DocumentAlreadyExistsError'
  }
}

export class InvalidPhoneNumberError extends ValidationError {
  constructor(phoneNumber: string) {
    super(`Invalid phone number format: ${phoneNumber}`, 'phoneNumber')
    this.name = 'InvalidPhoneNumberError'
  }
}

export class InvalidDocumentError extends ValidationError {
  constructor(document: string) {
    super(`Invalid document format: ${document}`, 'document')
    this.name = 'InvalidDocumentError'
  }
}

export class InvalidEmailError extends ValidationError {
  constructor(email: string) {
    super(`Invalid email format: ${email}`, 'email')
    this.name = 'InvalidEmailError'
  }
}

export class InvalidUserNameError extends ValidationError {
  constructor(name: string) {
    super(`Invalid user name: ${name}`, 'name')
    this.name = 'InvalidUserNameError'
  }
}

export class UserInactiveError extends BusinessRuleViolationError {
  constructor(phoneNumber: string) {
    super(`User ${phoneNumber} is inactive and cannot perform this action`)
    this.name = 'UserInactiveError'
  }
}

export class UserHasActiveContractsError extends BusinessRuleViolationError {
  constructor(phoneNumber: string) {
    super(`Cannot deactivate user ${phoneNumber} with active contracts`)
    this.name = 'UserHasActiveContractsError'
  }
}

export class InvalidUserStatusTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid user status transition from ${from} to ${to}`)
    this.name = 'InvalidUserStatusTransitionError'
  }
}

export class UserQueryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`User query failed: ${message}`, 'USER_QUERY_ERROR', 500)
    this.name = 'UserQueryError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class UserCreateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to create user: ${message}`, 'USER_CREATE_ERROR', 500)
    this.name = 'UserCreateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class UserUpdateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to update user: ${message}`, 'USER_UPDATE_ERROR', 500)
    this.name = 'UserUpdateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

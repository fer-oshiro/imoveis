import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'

// Payment-specific errors
export class PaymentNotFoundError extends EntityNotFoundError {
  constructor(paymentId: string) {
    super('Payment', paymentId)
    this.name = 'PaymentNotFoundError'
  }
}

export class PaymentAlreadyExistsError extends BusinessRuleViolationError {
  constructor(paymentId: string) {
    super(`Payment with ID ${paymentId} already exists`)
    this.name = 'PaymentAlreadyExistsError'
  }
}

export class InvalidPaymentAmountError extends ValidationError {
  constructor(amount: number) {
    super(`Payment amount must be positive, got: ${amount}`, 'amount')
    this.name = 'InvalidPaymentAmountError'
  }
}

export class InvalidPaymentDateError extends ValidationError {
  constructor(date: string) {
    super(`Invalid payment date format: ${date}`, 'paymentDate')
    this.name = 'InvalidPaymentDateError'
  }
}

export class InvalidDueDateError extends ValidationError {
  constructor(date: string) {
    super(`Invalid due date format: ${date}`, 'dueDate')
    this.name = 'InvalidDueDateError'
  }
}

export class PaymentAlreadyPaidError extends BusinessRuleViolationError {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} is already marked as paid`)
    this.name = 'PaymentAlreadyPaidError'
  }
}

export class PaymentAlreadyValidatedError extends BusinessRuleViolationError {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} is already validated`)
    this.name = 'PaymentAlreadyValidatedError'
  }
}

export class PaymentNotPaidError extends BusinessRuleViolationError {
  constructor(paymentId: string) {
    super(`Payment ${paymentId} is not marked as paid`)
    this.name = 'PaymentNotPaidError'
  }
}

export class PaymentOverdueError extends BusinessRuleViolationError {
  constructor(paymentId: string, dueDate: Date) {
    super(`Payment ${paymentId} is overdue (due: ${dueDate.toISOString()})`)
    this.name = 'PaymentOverdueError'
  }
}

export class InvalidPaymentProofError extends ValidationError {
  constructor(reason: string) {
    super(`Invalid payment proof: ${reason}`, 'proofDocumentKey')
    this.name = 'InvalidPaymentProofError'
  }
}

export class PaymentProofMissingError extends ValidationError {
  constructor(paymentId: string) {
    super(`Payment proof is required for payment ${paymentId}`, 'proofDocumentKey')
    this.name = 'PaymentProofMissingError'
  }
}

export class InvalidPaymentStatusTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid payment status transition from ${from} to ${to}`)
    this.name = 'InvalidPaymentStatusTransitionError'
  }
}

export class PaymentAmountMismatchError extends BusinessRuleViolationError {
  constructor(expected: number, actual: number) {
    super(`Payment amount mismatch: expected ${expected}, got ${actual}`)
    this.name = 'PaymentAmountMismatchError'
  }
}

export class PaymentValidationError extends BusinessRuleViolationError {
  constructor(paymentId: string, reason: string) {
    super(`Payment ${paymentId} validation failed: ${reason}`)
    this.name = 'PaymentValidationError'
  }
}

export class PaymentQueryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Payment query failed: ${message}`, 'PAYMENT_QUERY_ERROR', 500)
    this.name = 'PaymentQueryError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class PaymentCreateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to create payment: ${message}`, 'PAYMENT_CREATE_ERROR', 500)
    this.name = 'PaymentCreateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class PaymentUpdateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to update payment: ${message}`, 'PAYMENT_UPDATE_ERROR', 500)
    this.name = 'PaymentUpdateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

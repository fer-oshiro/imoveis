export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityType: string, identifier: string) {
    super(
      `${entityType} with identifier ${identifier} not found`,
      'ENTITY_NOT_FOUND',
      404
    );
    this.name = 'EntityNotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, field?: string) {
    const errorMessage = field ? `Validation failed for ${field}: ${message}` : message;
    super(errorMessage, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super(message, 'BUSINESS_RULE_VIOLATION', 422);
    this.name = 'BusinessRuleViolationError';
  }
}

export class DatabaseError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}
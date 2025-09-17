import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'

// Relationship-specific errors
export class RelationshipNotFoundError extends EntityNotFoundError {
  constructor(apartmentUnitCode: string, userPhoneNumber: string) {
    super('UserApartmentRelation', `${apartmentUnitCode}-${userPhoneNumber}`)
    this.name = 'RelationshipNotFoundError'
  }
}

export class RelationshipAlreadyExistsError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string, userPhoneNumber: string, role: string) {
    super(
      `Relationship already exists between user ${userPhoneNumber} and apartment ${apartmentUnitCode} with role ${role}`,
    )
    this.name = 'RelationshipAlreadyExistsError'
  }
}

export class InvalidUserRoleError extends ValidationError {
  constructor(role: string) {
    super(`Invalid user role: ${role}`, 'role')
    this.name = 'InvalidUserRoleError'
  }
}

export class InvalidRelationshipTypeError extends ValidationError {
  constructor(relationshipType: string) {
    super(`Invalid relationship type: ${relationshipType}`, 'relationshipType')
    this.name = 'InvalidRelationshipTypeError'
  }
}

export class PrimaryTenantAlreadyExistsError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string) {
    super(`Primary tenant already exists for apartment ${apartmentUnitCode}`)
    this.name = 'PrimaryTenantAlreadyExistsError'
  }
}

export class CannotRemovePrimaryTenantError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string) {
    super(
      `Cannot remove primary tenant from apartment ${apartmentUnitCode} while other tenants exist`,
    )
    this.name = 'CannotRemovePrimaryTenantError'
  }
}

export class RelationshipInactiveError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string, userPhoneNumber: string) {
    super(
      `Relationship between user ${userPhoneNumber} and apartment ${apartmentUnitCode} is inactive`,
    )
    this.name = 'RelationshipInactiveError'
  }
}

export class InvalidRoleTransitionError extends BusinessRuleViolationError {
  constructor(from: string, to: string) {
    super(`Invalid role transition from ${from} to ${to}`)
    this.name = 'InvalidRoleTransitionError'
  }
}

export class UserNotAuthorizedForApartmentError extends BusinessRuleViolationError {
  constructor(userPhoneNumber: string, apartmentUnitCode: string) {
    super(`User ${userPhoneNumber} is not authorized to access apartment ${apartmentUnitCode}`)
    this.name = 'UserNotAuthorizedForApartmentError'
  }
}

export class MaximumTenantsReachedError extends BusinessRuleViolationError {
  constructor(apartmentUnitCode: string, maxTenants: number) {
    super(`Maximum number of tenants (${maxTenants}) reached for apartment ${apartmentUnitCode}`)
    this.name = 'MaximumTenantsReachedError'
  }
}

export class RelationshipQueryError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Relationship query failed: ${message}`, 'RELATIONSHIP_QUERY_ERROR', 500)
    this.name = 'RelationshipQueryError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class RelationshipCreateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to create relationship: ${message}`, 'RELATIONSHIP_CREATE_ERROR', 500)
    this.name = 'RelationshipCreateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

export class RelationshipUpdateError extends DomainError {
  constructor(message: string, originalError?: Error) {
    super(`Failed to update relationship: ${message}`, 'RELATIONSHIP_UPDATE_ERROR', 500)
    this.name = 'RelationshipUpdateError'
    if (originalError) {
      this.stack = originalError.stack
    }
  }
}

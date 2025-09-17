import { UserRole } from '../vo/user-role.vo'

export interface CreateRelationshipDtoData {
  apartmentUnitCode: string
  userPhoneNumber: string
  role: UserRole
  relationshipType?: string
  isActive?: boolean
  createdBy?: string
}

export class CreateRelationshipDto {
  apartmentUnitCode: string
  userPhoneNumber: string
  role: UserRole
  relationshipType?: string
  isActive?: boolean
  createdBy?: string

  constructor(data: CreateRelationshipDtoData) {
    this.apartmentUnitCode = data.apartmentUnitCode?.trim()
    this.userPhoneNumber = data.userPhoneNumber?.trim()
    this.role = data.role
    this.relationshipType = data.relationshipType?.trim()
    this.isActive = data.isActive !== false // Default to true
    this.createdBy = data.createdBy?.trim()
  }

  static create(data: CreateRelationshipDtoData): CreateRelationshipDto {
    return new CreateRelationshipDto(data)
  }

  validate(): string[] {
    const errors: string[] = []

    if (!this.apartmentUnitCode) {
      errors.push('Apartment unit code is required')
    }

    if (!this.userPhoneNumber) {
      errors.push('User phone number is required')
    }

    if (!this.role) {
      errors.push('User role is required')
    }

    if (!Object.values(UserRole).includes(this.role)) {
      errors.push(`Invalid user role. Valid roles are: ${Object.values(UserRole).join(', ')}`)
    }

    // Validate relationship type for secondary tenants
    if (this.role === UserRole.SECONDARY_TENANT && !this.relationshipType) {
      errors.push('Relationship type is required for secondary tenants')
    }

    return errors
  }

  isValid(): boolean {
    return this.validate().length === 0
  }
}

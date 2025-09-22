import { EntityMetadataVO, PhoneNumberVO } from '../../shared'
import { ValidationError } from '../../shared/errors/domain-error'
import { UserRoleVO, UserRole } from '../vo/user-role.vo'

export interface UserApartmentRelationProps {
  pk: string
  sk: string
  apartmentUnitCode: string
  userPhoneNumber: string
  role: UserRole
  relationshipType?: string
  isActive: boolean
  metadata: EntityMetadataVO
}

export class UserApartmentRelation {
  private readonly _pk: string
  private readonly _sk: string
  private readonly _apartmentUnitCode: string
  private readonly _userPhoneNumber: PhoneNumberVO
  private readonly _role: UserRoleVO
  private _relationshipType?: string
  private _isActive: boolean
  private _metadata: EntityMetadataVO

  constructor(props: UserApartmentRelationProps) {
    this.validateProps(props)

    this._pk = props.pk
    this._sk = props.sk
    this._apartmentUnitCode = props.apartmentUnitCode
    this._userPhoneNumber = PhoneNumberVO.create(props.userPhoneNumber)
    this._role = UserRoleVO.create(props.role)
    this._relationshipType = props.relationshipType?.trim()
    this._isActive = props.isActive
    this._metadata = props.metadata
  }

  private validateProps(props: UserApartmentRelationProps): void {
    if (!props.apartmentUnitCode || props.apartmentUnitCode.trim().length === 0) {
      throw new ValidationError('Apartment unit code is required')
    }

    if (!props.userPhoneNumber || props.userPhoneNumber.trim().length === 0) {
      throw new ValidationError('User phone number is required')
    }

    // Validate relationship type for certain roles
    if (props.role === UserRole.SECONDARY_TENANT && !props.relationshipType) {
      throw new ValidationError('Relationship type is required for secondary tenants')
    }

    if (props.relationshipType && props.relationshipType.trim().length === 0) {
      throw new ValidationError('Relationship type cannot be empty when provided')
    }
  }

  // Factory methods
  static create(data: {
    apartmentUnitCode: string
    userPhoneNumber: string
    role: UserRole
    relationshipType?: string
    isActive?: boolean
    createdBy?: string
  }): UserApartmentRelation {
    const phoneNumberVO = PhoneNumberVO.create(data.userPhoneNumber)
    const roleVO = UserRoleVO.create(data.role)

    const pk = `APARTMENT#${data.apartmentUnitCode.trim()}`
    const sk = `USER#${phoneNumberVO.value}#${roleVO.value}`

    return new UserApartmentRelation({
      pk,
      sk,
      apartmentUnitCode: data.apartmentUnitCode.trim(),
      userPhoneNumber: data.userPhoneNumber,
      role: data.role,
      relationshipType: data.relationshipType?.trim(),
      isActive: data.isActive !== false, // Default to true
      metadata: EntityMetadataVO.create(data.createdBy),
    })
  }

  static fromDynamoItem(item: Record<string, any>): UserApartmentRelation {
    return new UserApartmentRelation({
      pk: item.pk,
      sk: item.sk,
      apartmentUnitCode: item.apartmentUnitCode,
      userPhoneNumber: item.userPhoneNumber,
      role: item.role as UserRole,
      relationshipType: item.relationshipType,
      isActive: item.isActive,
      metadata: EntityMetadataVO.fromJSON(item.metadata),
    })
  }

  // Getters
  get pk(): string {
    return this._pk
  }

  get sk(): string {
    return this._sk
  }

  get apartmentUnitCode(): string {
    return this._apartmentUnitCode
  }

  get userPhoneNumber(): PhoneNumberVO {
    return this._userPhoneNumber
  }

  get role(): UserRoleVO {
    return this._role
  }

  get relationshipType(): string | undefined {
    return this._relationshipType
  }

  get isActive(): boolean {
    return this._isActive
  }

  get metadata(): EntityMetadataVO {
    return this._metadata
  }

  // Business logic methods
  updateRelationshipType(relationshipType: string | undefined, updatedBy?: string): void {
    if (relationshipType !== undefined) {
      if (this._role.isSecondaryTenant && !relationshipType?.trim()) {
        throw new ValidationError('Relationship type is required for secondary tenants')
      }
      this._relationshipType = relationshipType?.trim()
    }
    this._metadata = this._metadata.update(updatedBy)
  }

  activate(updatedBy?: string): void {
    if (this._isActive) {
      throw new ValidationError('Relationship is already active')
    }
    this._isActive = true
    this._metadata = this._metadata.update(updatedBy)
  }

  deactivate(updatedBy?: string): void {
    if (!this._isActive) {
      throw new ValidationError('Relationship is already inactive')
    }
    this._isActive = false
    this._metadata = this._metadata.update(updatedBy)
  }

  // Helper methods for GSI keys
  getUserCentricPK(): string {
    return `USER#${this._userPhoneNumber.value}`
  }

  getUserCentricSK(): string {
    return `APARTMENT#${this._apartmentUnitCode}#${this._role.value}`
  }

  // Serialization methods
  toDynamoItem(): Record<string, any> {
    return {
      pk: this._pk,
      sk: this._sk,
      apartmentUnitCode: this._apartmentUnitCode,
      userPhoneNumber: this._userPhoneNumber.value,
      role: this._role.value,
      relationshipType: this._relationshipType,
      isActive: this._isActive,
      metadata: this._metadata.toJSON(),
      // GSI keys for user-centric queries
      GSI1PK: this.getUserCentricPK(),
      GSI1SK: this.getUserCentricSK(),
    }
  }

  toJSON(): Record<string, any> {
    return {
      apartmentUnitCode: this._apartmentUnitCode,
      userPhoneNumber: this._userPhoneNumber.formatted,
      role: this._role.value,
      relationshipType: this._relationshipType,
      isActive: this._isActive,
      createdAt: this._metadata.createdAt,
      updatedAt: this._metadata.updatedAt,
    }
  }
}

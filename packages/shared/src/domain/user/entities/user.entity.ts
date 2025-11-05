import { EntityMetadataVO, PhoneNumberVO, DocumentVO } from '../../shared'
import { ValidationError } from '../../shared/errors/domain-error'
import { validateName, validateEmail } from '../utils/validation.utils'

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface UserProps {
  pk: string
  sk: string
  phoneNumber: string
  name: string
  document?: string
  email?: string
  status: UserStatus
  metadata: EntityMetadataVO
}

export class User {
  private readonly _pk: string
  private readonly _sk: string
  private readonly _phoneNumber: PhoneNumberVO
  private _name: string
  private readonly _document: DocumentVO
  private _email?: string
  private _status: UserStatus
  private _metadata: EntityMetadataVO

  constructor(props: UserProps) {
    this.validateProps(props)

    this._pk = props.pk
    this._sk = props.sk
    this._phoneNumber = PhoneNumberVO.create(props.phoneNumber)
    this._name = props.name
    this._document = DocumentVO.create(props.document)
    this._email = props.email
    this._status = props.status
    this._metadata = props.metadata
  }

  private validateProps(props: UserProps): void {
    validateName(props.name)

    if (props.email && !validateEmail(props.email)) {
      throw new ValidationError('Invalid email format', 'email')
    }
  }

  // Factory methods
  static create(data: {
    phoneNumber: string
    name: string
    document?: string
    email?: string
    status?: UserStatus
    createdBy?: string
  }): User {
    const phoneNumberVO = PhoneNumberVO.create(data.phoneNumber)
    const pk = `USER#${phoneNumberVO.value}`
    const sk = 'PROFILE'

    return new User({
      pk,
      sk,
      phoneNumber: data.phoneNumber,
      name: data.name.trim(),
      document: data.document,
      email: data.email?.trim(),
      status: data.status || UserStatus.ACTIVE,
      metadata: EntityMetadataVO.create(data.createdBy),
    })
  }

  static fromDynamoItem(item: Record<string, any>): User {
    // Handle legacy CPF field for backward compatibility
    let document = item.document
    if (!document && item.cpf) {
      document = item.cpf
    }

    return new User({
      pk: item.pk,
      sk: item.sk,
      phoneNumber: item.phoneNumber,
      name: item.name,
      document: document,
      email: item.email,
      status: item.status as UserStatus,
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

  get phoneNumber(): PhoneNumberVO {
    return this._phoneNumber
  }

  get name(): string {
    return this._name
  }

  get document(): DocumentVO {
    return this._document
  }

  get email(): string | undefined {
    return this._email
  }

  get status(): UserStatus {
    return this._status
  }

  get metadata(): EntityMetadataVO {
    return this._metadata
  }

  get isActive(): boolean {
    return this._status === UserStatus.ACTIVE
  }

  // Business logic methods
  updateProfile(data: { name?: string; email?: string; updatedBy?: string }): void {
    if (data.name !== undefined) {
      validateName(data.name)
      this._name = data.name.trim()
    }

    if ('email' in data) {
      if (data.email && !validateEmail(data.email)) {
        throw new ValidationError('Invalid email format', 'email')
      }
      this._email = data.email ? data.email.trim() : undefined
    }

    this._metadata = this._metadata.update(data.updatedBy)
  }

  activate(updatedBy?: string): void {
    if (this._status === UserStatus.ACTIVE) {
      throw new ValidationError('User is already active')
    }
    this._status = UserStatus.ACTIVE
    this._metadata = this._metadata.update(updatedBy)
  }

  deactivate(updatedBy?: string): void {
    if (this._status === UserStatus.INACTIVE) {
      throw new ValidationError('User is already inactive')
    }
    this._status = UserStatus.INACTIVE
    this._metadata = this._metadata.update(updatedBy)
  }

  suspend(updatedBy?: string): void {
    if (this._status === UserStatus.SUSPENDED) {
      throw new ValidationError('User is already suspended')
    }
    this._status = UserStatus.SUSPENDED
    this._metadata = this._metadata.update(updatedBy)
  }

  // Serialization methods
  toDynamoItem(): Record<string, any> {
    return {
      pk: this._pk,
      sk: this._sk,
      phoneNumber: this._phoneNumber.value,
      name: this._name,
      document: this._document.value,
      documentType: this._document.type,
      email: this._email,
      status: this._status,
      metadata: this._metadata.toJSON(),
    }
  }

  toJSON(): Record<string, any> {
    return {
      phoneNumber: this._phoneNumber.formatted,
      name: this._name,
      document: this._document.formatted,
      documentType: this._document.type,
      email: this._email,
      status: this._status,
      isActive: this.isActive,
      createdAt: this._metadata.createdAt,
      updatedAt: this._metadata.updatedAt,
    }
  }
}

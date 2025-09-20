export interface UpdateRelationshipDtoData {
  relationshipType?: string
  isActive?: boolean
  updatedBy?: string
}

export class UpdateRelationshipDto {
  relationshipType?: string
  isActive?: boolean
  updatedBy?: string

  constructor(data: UpdateRelationshipDtoData) {
    this.relationshipType = data.relationshipType?.trim()
    this.isActive = data.isActive
    this.updatedBy = data.updatedBy?.trim()
  }

  static create(data: UpdateRelationshipDtoData): UpdateRelationshipDto {
    return new UpdateRelationshipDto(data)
  }

  validate(): string[] {
    const errors: string[] = []

    // If relationship type is provided but empty, it's invalid
    if ('relationshipType' in this && this.relationshipType === '') {
      errors.push('Relationship type cannot be empty when provided')
    }

    return errors
  }

  isValid(): boolean {
    return this.validate().length === 0
  }

  hasUpdates(): boolean {
    return this.relationshipType !== undefined || this.isActive !== undefined
  }
}

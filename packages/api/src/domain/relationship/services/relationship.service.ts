import {
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'
import { CreateRelationshipDto } from '../dto/create-relationship.dto'
import { UpdateRelationshipDto } from '../dto/update-relationship.dto'
import { UserApartmentRelation } from '../entities/user-apartment-relation.entity'
import {
  IRelationshipRepository,
  RelationshipKey,
} from '../repositories/relationship.repository.interface'
import { UserRole } from '../vo/user-role.vo'

export interface UserWithRelation {
  phoneNumber: string
  role: UserRole
  relationshipType?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ApartmentWithRelation {
  apartmentUnitCode: string
  role: UserRole
  relationshipType?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class RelationshipService {
  constructor(private readonly relationshipRepository: IRelationshipRepository) {}

  async createRelationship(dto: CreateRelationshipDto): Promise<UserApartmentRelation> {
    // Validate DTO
    const validationErrors = dto.validate()
    if (validationErrors.length > 0) {
      throw new ValidationError(`Invalid relationship data: ${validationErrors.join(', ')}`)
    }

    // Check if relationship already exists
    const existingRelationship = await this.relationshipRepository.findSpecificRelation(
      dto.apartmentUnitCode,
      dto.userPhoneNumber,
      dto.role,
    )

    if (existingRelationship) {
      throw new BusinessRuleViolationError(
        `Relationship already exists between user ${dto.userPhoneNumber} and apartment ${dto.apartmentUnitCode} with role ${dto.role}`,
      )
    }

    // Business rule: Only one primary tenant per apartment
    if (dto.role === UserRole.PRIMARY_TENANT) {
      const existingPrimaryTenants = await this.relationshipRepository.findByApartmentAndRole(
        dto.apartmentUnitCode,
        UserRole.PRIMARY_TENANT,
      )

      const activePrimaryTenants = existingPrimaryTenants.filter((rel) => rel.isActive)
      if (activePrimaryTenants.length > 0) {
        throw new BusinessRuleViolationError(
          `Apartment ${dto.apartmentUnitCode} already has an active primary tenant`,
        )
      }
    }

    const relationship = UserApartmentRelation.create({
      apartmentUnitCode: dto.apartmentUnitCode,
      userPhoneNumber: dto.userPhoneNumber,
      role: dto.role,
      relationshipType: dto.relationshipType,
      isActive: dto.isActive,
      createdBy: dto.createdBy,
    })

    return await this.relationshipRepository.save(relationship)
  }

  async getRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
  ): Promise<UserApartmentRelation> {
    const relationship = await this.relationshipRepository.findSpecificRelation(
      apartmentUnitCode,
      userPhoneNumber,
      role,
    )

    if (!relationship) {
      throw new EntityNotFoundError(
        'UserApartmentRelation',
        `${apartmentUnitCode}-${userPhoneNumber}-${role}`,
      )
    }

    return relationship
  }

  async updateRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
    dto: UpdateRelationshipDto,
  ): Promise<UserApartmentRelation> {
    // Validate DTO
    const validationErrors = dto.validate()
    if (validationErrors.length > 0) {
      throw new ValidationError(`Invalid update data: ${validationErrors.join(', ')}`)
    }

    if (!dto.hasUpdates()) {
      throw new ValidationError('No updates provided')
    }

    const relationship = await this.getRelationship(apartmentUnitCode, userPhoneNumber, role)

    // Update relationship type if provided
    if (dto.relationshipType !== undefined) {
      relationship.updateRelationshipType(dto.relationshipType, dto.updatedBy)
    }

    // Update active status if provided
    if (dto.isActive !== undefined) {
      if (dto.isActive && !relationship.isActive) {
        relationship.activate(dto.updatedBy)
      } else if (!dto.isActive && relationship.isActive) {
        relationship.deactivate(dto.updatedBy)
      }
    }

    return await this.relationshipRepository.save(relationship)
  }

  async activateRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
    updatedBy?: string,
  ): Promise<UserApartmentRelation> {
    const relationship = await this.getRelationship(apartmentUnitCode, userPhoneNumber, role)

    // Business rule: Only one primary tenant per apartment can be active
    if (role === UserRole.PRIMARY_TENANT) {
      const existingPrimaryTenants = await this.relationshipRepository.findByApartmentAndRole(
        apartmentUnitCode,
        UserRole.PRIMARY_TENANT,
      )

      const activePrimaryTenants = existingPrimaryTenants.filter(
        (rel) => rel.isActive && rel.userPhoneNumber.value !== relationship.userPhoneNumber.value,
      )

      if (activePrimaryTenants.length > 0) {
        throw new BusinessRuleViolationError(
          `Cannot activate primary tenant. Apartment ${apartmentUnitCode} already has an active primary tenant`,
        )
      }
    }

    relationship.activate(updatedBy)
    return await this.relationshipRepository.save(relationship)
  }

  async deactivateRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
    updatedBy?: string,
  ): Promise<UserApartmentRelation> {
    const relationship = await this.getRelationship(apartmentUnitCode, userPhoneNumber, role)
    relationship.deactivate(updatedBy)
    return await this.relationshipRepository.save(relationship)
  }

  async deleteRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
  ): Promise<void> {
    const relationship = await this.getRelationship(apartmentUnitCode, userPhoneNumber, role)

    // Business rule: Cannot delete active relationships
    if (relationship.isActive) {
      throw new BusinessRuleViolationError(
        'Cannot delete active relationship. Deactivate the relationship first.',
      )
    }

    const key: RelationshipKey = {
      apartmentUnitCode,
      userPhoneNumber,
      role,
    }

    await this.relationshipRepository.delete(key)
  }

  // Apartment-centric queries
  async getRelationshipsByApartment(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findByApartment(apartmentUnitCode)
  }

  async getActiveRelationshipsByApartment(
    apartmentUnitCode: string,
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findActiveByApartment(apartmentUnitCode)
  }

  async getRelationshipsByApartmentAndRole(
    apartmentUnitCode: string,
    role: UserRole,
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findByApartmentAndRole(apartmentUnitCode, role)
  }

  async getUsersByApartment(apartmentUnitCode: string): Promise<UserWithRelation[]> {
    const relationships = await this.relationshipRepository.findByApartment(apartmentUnitCode)

    return relationships.map((rel) => ({
      phoneNumber: rel.userPhoneNumber.formatted,
      role: rel.role.value,
      relationshipType: rel.relationshipType,
      isActive: rel.isActive,
      createdAt: rel.metadata.createdAt,
      updatedAt: rel.metadata.updatedAt,
    }))
  }

  async getActiveUsersByApartment(apartmentUnitCode: string): Promise<UserWithRelation[]> {
    const relationships = await this.relationshipRepository.findActiveByApartment(apartmentUnitCode)

    return relationships.map((rel) => ({
      phoneNumber: rel.userPhoneNumber.formatted,
      role: rel.role.value,
      relationshipType: rel.relationshipType,
      isActive: rel.isActive,
      createdAt: rel.metadata.createdAt,
      updatedAt: rel.metadata.updatedAt,
    }))
  }

  // User-centric queries
  async getRelationshipsByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findByUser(userPhoneNumber)
  }

  async getActiveRelationshipsByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findActiveByUser(userPhoneNumber)
  }

  async getRelationshipsByUserAndRole(
    userPhoneNumber: string,
    role: UserRole,
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findByUserAndRole(userPhoneNumber, role)
  }

  async getApartmentsByUser(userPhoneNumber: string): Promise<ApartmentWithRelation[]> {
    const relationships = await this.relationshipRepository.findByUser(userPhoneNumber)

    return relationships.map((rel) => ({
      apartmentUnitCode: rel.apartmentUnitCode,
      role: rel.role.value,
      relationshipType: rel.relationshipType,
      isActive: rel.isActive,
      createdAt: rel.metadata.createdAt,
      updatedAt: rel.metadata.updatedAt,
    }))
  }

  async getActiveApartmentsByUser(userPhoneNumber: string): Promise<ApartmentWithRelation[]> {
    const relationships = await this.relationshipRepository.findActiveByUser(userPhoneNumber)

    return relationships.map((rel) => ({
      apartmentUnitCode: rel.apartmentUnitCode,
      role: rel.role.value,
      relationshipType: rel.relationshipType,
      isActive: rel.isActive,
      createdAt: rel.metadata.createdAt,
      updatedAt: rel.metadata.updatedAt,
    }))
  }

  // Combined queries
  async getRelationshipsBetweenUserAndApartment(
    apartmentUnitCode: string,
    userPhoneNumber: string,
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findByApartmentAndUser(
      apartmentUnitCode,
      userPhoneNumber,
    )
  }

  // Bulk operations
  async getRelationshipsByMultipleApartments(
    apartmentUnitCodes: string[],
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findMultipleByApartments(apartmentUnitCodes)
  }

  async getRelationshipsByMultipleUsers(
    userPhoneNumbers: string[],
  ): Promise<UserApartmentRelation[]> {
    return await this.relationshipRepository.findMultipleByUsers(userPhoneNumbers)
  }

  // Validation methods
  async relationshipExists(
    apartmentUnitCode: string,
    userPhoneNumber: string,
    role: UserRole,
  ): Promise<boolean> {
    return await this.relationshipRepository.relationshipExists(
      apartmentUnitCode,
      userPhoneNumber,
      role,
    )
  }

  async hasActiveRelationship(
    apartmentUnitCode: string,
    userPhoneNumber: string,
  ): Promise<boolean> {
    return await this.relationshipRepository.hasActiveRelationship(
      apartmentUnitCode,
      userPhoneNumber,
    )
  }

  async getPrimaryTenant(apartmentUnitCode: string): Promise<UserApartmentRelation | null> {
    const primaryTenants = await this.relationshipRepository.findByApartmentAndRole(
      apartmentUnitCode,
      UserRole.PRIMARY_TENANT,
    )

    const activePrimaryTenants = primaryTenants.filter((rel) => rel.isActive)
    return activePrimaryTenants.length > 0 ? activePrimaryTenants[0] : null
  }

  async getSecondaryTenants(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
    const secondaryTenants = await this.relationshipRepository.findByApartmentAndRole(
      apartmentUnitCode,
      UserRole.SECONDARY_TENANT,
    )

    return secondaryTenants.filter((rel) => rel.isActive)
  }

  async getAllTenants(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
    const relationships = await this.relationshipRepository.findActiveByApartment(apartmentUnitCode)
    return relationships.filter((rel) => rel.role.isTenant)
  }

  async getEmergencyContacts(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
    const emergencyContacts = await this.relationshipRepository.findByApartmentAndRole(
      apartmentUnitCode,
      UserRole.EMERGENCY_CONTACT,
    )

    return emergencyContacts.filter((rel) => rel.isActive)
  }
}

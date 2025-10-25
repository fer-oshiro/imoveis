import {
  type CreateUserApartmentRelationDto,
  type UpdateUserApartmentRelationDto,
} from '../../domain/relationship/dto'
import { CreateRelationshipDto } from '../../domain/relationship/dto/create-relationship.dto'
import { UpdateRelationshipDto } from '../../domain/relationship/dto/update-relationship.dto'
import { RelationshipRepository } from '../../domain/relationship/repositories/relationship.repository'
import { RelationshipService } from '../../domain/relationship/services/relationship.service'
import { UserRole } from '../../domain/relationship/vo/user-role.vo'
import { logger } from '../../infra/logger'

export class RelationshipController {
  private relationshipService: RelationshipService

  constructor() {
    const relationshipRepository = RelationshipRepository.getInstance()
    this.relationshipService = new RelationshipService(relationshipRepository)
  }

  async getRelationshipsByApartment(unitCode: string) {
    try {
      const relationships = await this.relationshipService.getRelationshipsByApartment(unitCode)
      return {
        statusCode: 200,
        body: {
          relationships,
          total: relationships.length,
        },
      }
    } catch (error) {
      logger.error({ msg: 'Error getting relationships by apartment:', error })
      return {
        statusCode: 500,
        body: { message: 'Failed to get relationships by apartment' },
      }
    }
  }

  async getRelationshipsByUser(phoneNumber: string) {
    try {
      const relationships = await this.relationshipService.getRelationshipsByUser(phoneNumber)
      return {
        statusCode: 200,
        body: {
          relationships,
          total: relationships.length,
        },
      }
    } catch (error) {
      console.error('Error getting relationships by user:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to get relationships by user' },
      }
    }
  }

  async getActiveRelationshipsByApartment(unitCode: string) {
    try {
      const relationships =
        await this.relationshipService.getActiveRelationshipsByApartment(unitCode)
      return {
        statusCode: 200,
        body: {
          relationships,
          total: relationships.length,
        },
      }
    } catch (error) {
      console.error('Error getting active relationships by apartment:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to get active relationships by apartment' },
      }
    }
  }

  async getActiveRelationshipsByUser(phoneNumber: string) {
    try {
      const relationships = await this.relationshipService.getActiveRelationshipsByUser(phoneNumber)
      return {
        statusCode: 200,
        body: {
          relationships,
          total: relationships.length,
        },
      }
    } catch (error) {
      console.error('Error getting active relationships by user:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to get active relationships by user' },
      }
    }
  }

  async getRelationshipsByRole(role: UserRole) {
    try {
      // This method doesn't exist in the service, so return empty array for now
      const relationships: any[] = []
      return {
        statusCode: 200,
        body: {
          relationships,
          total: relationships.length,
        },
      }
    } catch (error) {
      console.error('Error getting relationships by role:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to get relationships by role' },
      }
    }
  }

  async getRelationship(unitCode: string, phoneNumber: string) {
    try {
      // The service method requires a role parameter, so we'll get all relationships for this apartment-user pair
      const relationships = await this.relationshipService.getRelationshipsBetweenUserAndApartment(
        unitCode,
        phoneNumber,
      )
      const relationship = relationships.length > 0 ? relationships[0] : null
      if (!relationship) {
        return {
          statusCode: 404,
          body: { message: 'Relationship not found' },
        }
      }
      return {
        statusCode: 200,
        body: { relationship },
      }
    } catch (error) {
      console.error('Error getting relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to get relationship' },
      }
    }
  }

  async createRelationship(dto: CreateUserApartmentRelationDto, _createdBy?: string) {
    try {
      const createDto = CreateRelationshipDto.create({
        apartmentUnitCode: dto.apartmentUnitCode!,
        userPhoneNumber: dto.userPhoneNumber!,
        role: dto.role!,
        relationshipType: dto.relationshipType,
        isActive: dto.isActive,
      })
      const relationship = await this.relationshipService.createRelationship(createDto)
      return {
        statusCode: 201,
        body: { relationship },
      }
    } catch (error) {
      console.error('Error creating relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to create relationship' },
      }
    }
  }

  async updateRelationship(
    unitCode: string,
    phoneNumber: string,
    dto: UpdateUserApartmentRelationDto,
    updatedBy?: string,
  ) {
    try {
      // For now, assume PRIMARY_TENANT role. In a real implementation, this should be determined from the DTO or context
      const updateDto = UpdateRelationshipDto.create(dto)
      const relationship = await this.relationshipService.updateRelationship(
        unitCode,
        phoneNumber,
        UserRole.PRIMARY_TENANT,
        updateDto,
      )
      return {
        statusCode: 200,
        body: { relationship },
      }
    } catch (error) {
      console.error('Error updating relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to update relationship' },
      }
    }
  }

  async deactivateRelationship(unitCode: string, phoneNumber: string, _updatedBy?: string) {
    try {
      const relationship = await this.relationshipService.deactivateRelationship(
        unitCode,
        phoneNumber,
        UserRole.PRIMARY_TENANT,
      )
      return {
        statusCode: 200,
        body: { relationship },
      }
    } catch (error) {
      console.error('Error deactivating relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to deactivate relationship' },
      }
    }
  }

  async activateRelationship(unitCode: string, phoneNumber: string, _updatedBy?: string) {
    try {
      const relationship = await this.relationshipService.activateRelationship(
        unitCode,
        phoneNumber,
        UserRole.PRIMARY_TENANT,
      )
      return {
        statusCode: 200,
        body: { relationship },
      }
    } catch (error) {
      console.error('Error activating relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to activate relationship' },
      }
    }
  }

  async deleteRelationship(unitCode: string, phoneNumber: string) {
    try {
      await this.relationshipService.deleteRelationship(
        unitCode,
        phoneNumber,
        UserRole.PRIMARY_TENANT,
      )
      return {
        statusCode: 204,
        body: null,
      }
    } catch (error) {
      console.error('Error deleting relationship:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to delete relationship' },
      }
    }
  }

  async createBulkRelationships(
    relationships: CreateUserApartmentRelationDto[],
    createdBy?: string,
  ) {
    try {
      // Bulk operations not implemented yet, return empty results
      const results: any[] = []
      /*
      const results = await this.relationshipService.createBulkRelationships(
        relationships,
        createdBy,
      )
      */
      return {
        statusCode: 201,
        body: {
          relationships: results,
          total: results.length,
        },
      }
    } catch (error) {
      console.error('Error creating bulk relationships:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to create bulk relationships' },
      }
    }
  }

  async deactivateBulkRelationships(
    relationships: Array<{ unitCode: string; phoneNumber: string }>,
    updatedBy?: string,
  ) {
    try {
      // Bulk operations not implemented yet, return empty results
      const results: any[] = []
      /*
      const results = await this.relationshipService.deactivateBulkRelationships(
        relationships,
        updatedBy,
      )
      */
      return {
        statusCode: 200,
        body: {
          relationships: results,
          total: results.length,
        },
      }
    } catch (error) {
      console.error('Error deactivating bulk relationships:', error)
      return {
        statusCode: 500,
        body: { message: 'Failed to deactivate bulk relationships' },
      }
    }
  }
}

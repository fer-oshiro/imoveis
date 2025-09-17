import { RelationshipService } from '../../domain/relationship/services/relationship.service'
import {
  CreateUserApartmentRelationDto,
  UpdateUserApartmentRelationDto,
} from '../../domain/relationship/dto'
import { UserRole } from '../../domain/relationship/vo/user-role.vo'

export class RelationshipController {
  private relationshipService: RelationshipService

  constructor() {
    this.relationshipService = new RelationshipService()
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
      console.error('Error getting relationships by apartment:', error)
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
      const relationships = await this.relationshipService.getRelationshipsByRole(role)
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
      const relationship = await this.relationshipService.getRelationship(unitCode, phoneNumber)
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

  async createRelationship(dto: CreateUserApartmentRelationDto, createdBy?: string) {
    try {
      const relationship = await this.relationshipService.createRelationship(dto, createdBy)
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
      const relationship = await this.relationshipService.updateRelationship(
        unitCode,
        phoneNumber,
        dto,
        updatedBy,
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

  async deactivateRelationship(unitCode: string, phoneNumber: string, updatedBy?: string) {
    try {
      const relationship = await this.relationshipService.deactivateRelationship(
        unitCode,
        phoneNumber,
        updatedBy,
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

  async activateRelationship(unitCode: string, phoneNumber: string, updatedBy?: string) {
    try {
      const relationship = await this.relationshipService.activateRelationship(
        unitCode,
        phoneNumber,
        updatedBy,
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
      await this.relationshipService.deleteRelationship(unitCode, phoneNumber)
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
      const results = await this.relationshipService.createBulkRelationships(
        relationships,
        createdBy,
      )
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
      const results = await this.relationshipService.deactivateBulkRelationships(
        relationships,
        updatedBy,
      )
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

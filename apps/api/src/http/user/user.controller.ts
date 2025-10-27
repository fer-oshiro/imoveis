import {
  DomainError,
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../domain/shared/errors/domain-error'
import { CreateUserDto, UpdateUserDto } from '../../domain/user/dto'
import { UserStatus } from '../../domain/user/entities/user.entity'
import { UserRepository } from '../../domain/user/repositories/user.repository'
import { UserService } from '../../domain/user/services/user.service'

export class UserController {
  private userService: UserService

  constructor() {
    const userRepository = UserRepository.getInstance()
    this.userService = new UserService(userRepository)
  }

  // Get user details with relationships and payment history
  async getUserDetails(phoneNumber: string) {
    try {
      return await this.userService.getUserDetails(phoneNumber)
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get user details', 'USER_QUERY_ERROR')
    }
  }

  // Get enhanced user details with aggregated data
  async getUserDetailsEnhanced(phoneNumber: string) {
    try {
      return await this.userService.getUserDetailsEnhanced(phoneNumber)
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get enhanced user details', 'USER_QUERY_ERROR')
    }
  }

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber: string) {
    try {
      return await this.userService.getUserByPhoneNumber(phoneNumber)
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get user', 'USER_QUERY_ERROR')
    }
  }

  // Get all users
  async getAllUsers() {
    try {
      return await this.userService.getAllUsers()
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get all users', 'USER_QUERY_ERROR')
    }
  }

  // Get users by status
  async getUsersByStatus(status: UserStatus) {
    try {
      return await this.userService.getUsersByStatus(status)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get users by status', 'USER_QUERY_ERROR')
    }
  }

  // Get users by apartment
  async getUsersByApartment(unitCode: string) {
    try {
      return await this.userService.getUsersByApartment(unitCode)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get users by apartment', 'USER_QUERY_ERROR')
    }
  }

  // Search users
  async searchUsers(criteria: { name?: string; status?: UserStatus }) {
    try {
      return await this.userService.searchUsers(criteria)
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to search users', 'USER_QUERY_ERROR')
    }
  }

  // Create new user
  async createUser(dto: CreateUserDto, createdBy?: string) {
    try {
      return await this.userService.createUser(dto, createdBy)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DomainError(error.message, 'USER_VALIDATION_ERROR', 400)
      }
      if (error instanceof BusinessRuleViolationError) {
        throw new DomainError(error.message, 'USER_BUSINESS_RULE_ERROR', 409)
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to create user', 'USER_CREATE_ERROR')
    }
  }

  // Update user
  async updateUser(phoneNumber: string, dto: UpdateUserDto, updatedBy?: string) {
    try {
      return await this.userService.updateUser(phoneNumber, dto, updatedBy)
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new DomainError(error.message, 'USER_VALIDATION_ERROR', 400)
      }
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to update user', 'USER_UPDATE_ERROR')
    }
  }

  // Activate user
  async activateUser(phoneNumber: string, updatedBy?: string) {
    try {
      const user = await this.userService.activateUser(phoneNumber, updatedBy)
      return { message: 'User activated successfully', user }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to activate user', 'USER_UPDATE_ERROR')
    }
  }

  // Deactivate user
  async deactivateUser(phoneNumber: string, updatedBy?: string) {
    try {
      const user = await this.userService.deactivateUser(phoneNumber, updatedBy)
      return { message: 'User deactivated successfully', user }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to deactivate user', 'USER_UPDATE_ERROR')
    }
  }

  // Suspend user
  async suspendUser(phoneNumber: string, updatedBy?: string) {
    try {
      const user = await this.userService.suspendUser(phoneNumber, updatedBy)
      return { message: 'User suspended successfully', user }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to suspend user', 'USER_UPDATE_ERROR')
    }
  }

  // Delete user
  async deleteUser(phoneNumber: string) {
    try {
      await this.userService.deleteUser(phoneNumber)
      return { message: 'User deleted successfully' }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof BusinessRuleViolationError) {
        throw new DomainError(error.message, 'USER_BUSINESS_RULE_ERROR', 409)
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to delete user', 'USER_DELETE_ERROR')
    }
  }

  // Validate user exists
  async validateUserExists(phoneNumber: string) {
    try {
      const exists = await this.userService.validateUserExists(phoneNumber)
      return { exists }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to validate user existence', 'USER_VALIDATION_ERROR')
    }
  }

  // Validate document uniqueness
  async validateDocumentUnique(document: string, excludePhoneNumber?: string) {
    try {
      const isUnique = await this.userService.validateDocumentUnique(document, excludePhoneNumber)
      return { isUnique }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to validate document uniqueness', 'USER_VALIDATION_ERROR')
    }
  }

  // Get user apartments (relationships)
  async getUserApartments(phoneNumber: string) {
    try {
      // This method doesn't exist in UserService yet, return empty array
      return []
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get user apartments', 'USER_QUERY_ERROR')
    }
  }

  // Get user contracts
  async getUserContracts(phoneNumber: string) {
    try {
      // This method doesn't exist in UserService yet, return empty array
      return []
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get user contracts', 'USER_QUERY_ERROR')
    }
  }

  // Get user payments
  async getUserPayments(phoneNumber: string) {
    try {
      // This method doesn't exist in UserService yet, return empty array
      return []
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new DomainError(
          `User with phone number ${phoneNumber} not found`,
          'USER_NOT_FOUND',
          404,
        )
      }
      if (error instanceof DomainError) {
        throw error
      }
      throw new DomainError('Failed to get user payments', 'USER_QUERY_ERROR')
    }
  }
}

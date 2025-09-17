import {
  EntityNotFoundError,
  ValidationError,
  BusinessRuleViolationError,
} from '../../shared/errors/domain-error'
import { User, UserStatus } from '../entities/user.entity'
import { IUserRepository } from '../repositories/user-repository.interface'
import {
  CreateUserDto,
  CreateUserDtoSchema,
  UpdateUserDto,
  UpdateUserDtoSchema,
  UserDetailsResponse,
  UserDetailsDto,
} from '../dto'
import { safeParseWithValidationError } from '../utils'

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(dto: CreateUserDto, createdBy?: string): Promise<User> {
    // Validate input using Zod schema
    const validatedDto = safeParseWithValidationError(CreateUserDtoSchema, dto, 'Create user')

    // Check if user already exists by phone number
    const existingUserByPhone = await this.userRepository.existsByPhoneNumber(
      validatedDto.phoneNumber,
    )
    if (existingUserByPhone) {
      throw new BusinessRuleViolationError('User with this phone number already exists')
    }

    // Check if user already exists by document (if provided)
    if (validatedDto.document) {
      const existingUserByDocument = await this.userRepository.existsByDocument(
        validatedDto.document,
      )
      if (existingUserByDocument) {
        throw new BusinessRuleViolationError('User with this document already exists')
      }
    }

    const user = User.create({
      phoneNumber: validatedDto.phoneNumber,
      name: validatedDto.name,
      document: validatedDto.document,
      email: validatedDto.email,
      status: validatedDto.status,
      createdBy,
    })

    return await this.userRepository.save(user)
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User> {
    const user = await this.userRepository.findByPhoneNumber(phoneNumber)
    if (!user) {
      throw new EntityNotFoundError('User', phoneNumber)
    }
    return user
  }

  async updateUser(phoneNumber: string, dto: UpdateUserDto, updatedBy?: string): Promise<User> {
    // Validate input using Zod schema
    const validatedDto = safeParseWithValidationError(UpdateUserDtoSchema, dto, 'Update user')

    const user = await this.getUserByPhoneNumber(phoneNumber)

    user.updateProfile({
      name: validatedDto.name,
      email: validatedDto.email,
      updatedBy,
    })

    return await this.userRepository.save(user)
  }

  async activateUser(phoneNumber: string, updatedBy?: string): Promise<User> {
    const user = await this.getUserByPhoneNumber(phoneNumber)
    user.activate(updatedBy)
    return await this.userRepository.save(user)
  }

  async deactivateUser(phoneNumber: string, updatedBy?: string): Promise<User> {
    const user = await this.getUserByPhoneNumber(phoneNumber)
    user.deactivate(updatedBy)
    return await this.userRepository.save(user)
  }

  async suspendUser(phoneNumber: string, updatedBy?: string): Promise<User> {
    const user = await this.getUserByPhoneNumber(phoneNumber)
    user.suspend(updatedBy)
    return await this.userRepository.save(user)
  }

  async deleteUser(phoneNumber: string): Promise<void> {
    const user = await this.getUserByPhoneNumber(phoneNumber)

    // Business rule: Only inactive users can be deleted
    if (user.status !== UserStatus.INACTIVE) {
      throw new BusinessRuleViolationError('Only inactive users can be deleted')
    }

    await this.userRepository.delete(phoneNumber)
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll()
  }

  async getUsersByStatus(status: UserStatus): Promise<User[]> {
    return await this.userRepository.findByStatus(status)
  }

  async getUsersByApartment(unitCode: string): Promise<User[]> {
    return await this.userRepository.findByApartment(unitCode)
  }

  async searchUsers(criteria: { name?: string; status?: UserStatus }): Promise<User[]> {
    return await this.userRepository.findBy(criteria)
  }

  async getUserDetails(phoneNumber: string): Promise<UserDetailsResponse> {
    const user = await this.getUserByPhoneNumber(phoneNumber)

    // For now, return basic user details
    // In future tasks, this will be enhanced with related users, apartments, and payment history
    const userDetails: UserDetailsDto = {
      phoneNumber: user.phoneNumber.formatted,
      name: user.name,
      document: user.document.formatted,
      documentType: user.document.type,
      email: user.email,
      status: user.status,
      isActive: user.isActive,
      createdAt: user.metadata.createdAt.toISOString(),
      updatedAt: user.metadata.updatedAt.toISOString(),
    }

    return {
      user: userDetails,
      relatedUsers: [], // Will be implemented in relationship domain task
      apartments: [], // Will be implemented in relationship domain task
      paymentHistory: [], // Will be implemented in payment domain task
    }
  }

  async validateUserExists(phoneNumber: string): Promise<boolean> {
    return await this.userRepository.existsByPhoneNumber(phoneNumber)
  }

  async validateDocumentUnique(document: string, excludePhoneNumber?: string): Promise<boolean> {
    const exists = await this.userRepository.existsByDocument(document)

    if (!exists) {
      return true
    }

    // If we're updating a user, check if the document belongs to the same user
    if (excludePhoneNumber) {
      const existingUser = await this.userRepository.findByPhoneNumber(excludePhoneNumber)
      return existingUser?.document.value === document.replace(/\D/g, '')
    }

    return false
  }

  // Keep for backward compatibility
  async validateCpfUnique(cpf: string, excludePhoneNumber?: string): Promise<boolean> {
    return this.validateDocumentUnique(cpf, excludePhoneNumber)
  }
}

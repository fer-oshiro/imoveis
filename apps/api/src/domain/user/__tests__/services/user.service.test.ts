import { vi } from 'vitest'

import { EntityNotFoundError } from '../../../shared'
import { ValidationError } from '../../../shared/errors/domain-error'
import { CreateUserDto, UpdateUserDto } from '../../dto'
import { User, UserStatus } from '../../entities/user.entity'
import { UserNotFoundError, UserAlreadyExistsError } from '../../errors'
import { IUserRepository } from '../../repositories/user-repository.interface'
import { UserService } from '../../services/user.service'

// Mock the repository
// @ts-ignore - Mock typing issue
const mockRepository: IUserRepository = {
  findAll: vi.fn(),
  findByPhoneNumber: vi.fn(),
  findByStatus: vi.fn(),
  findByDocument: vi.fn(),
  existsByPhoneNumber: vi.fn(),
  existsByDocument: vi.fn(),
  findByApartment: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('UserService', () => {
  let service: UserService
  let mockUser: User

  beforeEach(() => {
    service = new UserService(mockRepository)
    mockUser = User.create({
      phoneNumber: '11987654321',
      name: 'João Silva',
      document: '11144477735',
      email: 'joao@example.com',
    })
    vi.clearAllMocks()
  })

  describe('createUser', () => {
    const validDto: CreateUserDto = {
      phoneNumber: '11987654321',
      name: 'João Silva',
      document: '11144477735',
      email: 'joao@example.com',
    }

    it('should create user successfully', async () => {
      mockRepository.existsByPhoneNumber.mockResolvedValue(false) // No existing user
      mockRepository.existsByDocument.mockResolvedValue(false) // No existing document
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.createUser(validDto, 'creator')

      expect(mockRepository.existsByPhoneNumber).toHaveBeenCalledWith('11987654321')
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockUser)
    })

    it('should create user with minimal data', async () => {
      const minimalDto = {
        phoneNumber: '11987654321',
        name: 'João Silva',
      }
      mockRepository.findByPhoneNumber.mockResolvedValue(null)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.createUser(minimalDto, 'creator')

      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockUser)
    })

    it('should throw error if user already exists', async () => {
      mockRepository.existsByPhoneNumber.mockResolvedValue(true)
      mockRepository.existsByDocument.mockResolvedValue(false)

      await expect(service.createUser(validDto)).rejects.toThrow(
        'User with this phone number already exists',
      )
    })

    it('should validate duplicate document', async () => {
      mockRepository.existsByPhoneNumber.mockResolvedValue(false)
      mockRepository.existsByDocument.mockResolvedValue(true)

      await expect(service.createUser(validDto)).rejects.toThrow(
        'User with this document already exists',
      )
    })

    it('should handle repository errors', async () => {
      mockRepository.existsByPhoneNumber.mockResolvedValue(false)
      mockRepository.existsByDocument.mockResolvedValue(false)
      mockRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(service.createUser(validDto)).rejects.toThrow('Database error')
    })
  })

  describe('updateUser', () => {
    const updateDto: UpdateUserDto = {
      name: 'Maria Silva',
      email: 'maria@example.com',
    }

    it('should update user successfully', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.updateUser('+5511987654321', updateDto, 'updater')

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('+5511987654321')
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toBe(mockUser)
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.updateUser('+5511987654321', updateDto)).rejects.toThrow(
        EntityNotFoundError,
      )
    })

    it('should handle repository errors', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)
      mockRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(service.updateUser('+5511987654321', updateDto)).rejects.toThrow(
        'Database error',
      )
    })
  })

  describe('getUserByPhoneNumber', () => {
    it('should return user if found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)

      const result = await service.getUserByPhoneNumber('+5511987654321')

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('+5511987654321')
      expect(result).toBe(mockUser)
    })

    it('should throw error if not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.getUserByPhoneNumber('+5511987654321')).rejects.toThrow(
        EntityNotFoundError,
      )
    })

    it('should handle repository errors', async () => {
      mockRepository.findByPhoneNumber.mockRejectedValue(new Error('Database error'))

      await expect(service.getUserByPhoneNumber('+5511987654321')).rejects.toThrow('Database error')
    })
  })

  describe('getUserDetails', () => {
    it('should return user details with relationships', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)

      const result = await service.getUserDetails('+5511987654321')

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('+5511987654321')
      expect(result).toBeDefined()
      expect(result.user.phoneNumber).toBe(mockUser.phoneNumber.formatted)
      expect(result.user.name).toBe(mockUser.name)
      expect(result.user.document).toBe(mockUser.document.formatted)
      expect(result.user.email).toBe(mockUser.email)
      expect(result.user.status).toBe(mockUser.status)
      expect(result.relatedUsers).toEqual([])
      expect(result.apartments).toEqual([])
      expect(result.paymentHistory).toEqual([])
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.getUserDetails('+5511987654321')).rejects.toThrow(EntityNotFoundError)
    })
  })

  describe('activateUser', () => {
    it('should activate inactive user', async () => {
      const inactiveUser = User.create({
        phoneNumber: '11987654321',
        name: 'João Silva',
        status: UserStatus.INACTIVE,
      })
      mockRepository.findByPhoneNumber.mockResolvedValue(inactiveUser)
      mockRepository.save.mockResolvedValue(inactiveUser)

      const result = await service.activateUser('+5511987654321', 'activator')

      expect(inactiveUser.status).toBe(UserStatus.ACTIVE)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(inactiveUser)
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.activateUser('+5511987654321')).rejects.toThrow(EntityNotFoundError)
    })

    it('should throw error if user is already active', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser) // Already active

      await expect(service.activateUser('+5511987654321')).rejects.toThrow(ValidationError)
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate active user', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.deactivateUser('+5511987654321', 'deactivator')

      expect(mockUser.status).toBe(UserStatus.INACTIVE)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockUser)
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.deactivateUser('+5511987654321')).rejects.toThrow(EntityNotFoundError)
    })
  })

  describe('suspendUser', () => {
    it('should suspend active user', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await service.suspendUser('+5511987654321', 'suspender')

      expect(mockUser.status).toBe(UserStatus.SUSPENDED)
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockUser)
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.suspendUser('+5511987654321')).rejects.toThrow(EntityNotFoundError)
    })
  })

  describe('getUsersByStatus', () => {
    it('should return users by status', async () => {
      const users = [mockUser]
      mockRepository.findByStatus.mockResolvedValue(users)

      const result = await service.getUsersByStatus(UserStatus.ACTIVE)

      expect(mockRepository.findByStatus).toHaveBeenCalledWith(UserStatus.ACTIVE)
      expect(result).toBe(users)
    })

    it('should handle repository errors', async () => {
      mockRepository.findByStatus.mockRejectedValue(new Error('Database error'))

      await expect(service.getUsersByStatus(UserStatus.ACTIVE)).rejects.toThrow('Database error')
    })
  })

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [mockUser]
      mockRepository.findAll.mockResolvedValue(users)

      const result = await service.getAllUsers()

      expect(mockRepository.findAll).toHaveBeenCalled()
      expect(result).toBe(users)
    })

    it('should handle repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'))

      await expect(service.getAllUsers()).rejects.toThrow('Database error')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE }
      mockRepository.findByPhoneNumber.mockResolvedValue(inactiveUser)
      mockRepository.delete.mockResolvedValue()

      await service.deleteUser('+5511987654321', 'deleter')

      expect(mockRepository.findByPhoneNumber).toHaveBeenCalledWith('+5511987654321')
      expect(mockRepository.delete).toHaveBeenCalledWith('+5511987654321')
    })

    it('should throw error if user not found', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(null)

      await expect(service.deleteUser('+5511987654321')).rejects.toThrow(EntityNotFoundError)
    })

    it('should handle repository errors', async () => {
      mockRepository.findByPhoneNumber.mockResolvedValue(mockUser)
      mockRepository.delete.mockRejectedValue(new Error('Database error'))

      await expect(service.deleteUser('+5511987654321')).rejects.toThrow(
        'Only inactive users can be deleted',
      )
    })
  })

  describe('business rule validations', () => {
    it('should validate phone number format', async () => {
      const invalidDto = {
        phoneNumber: '123', // Invalid phone
        name: 'João Silva',
      }

      await expect(service.createUser(invalidDto)).rejects.toThrow(ValidationError)
    })

    it('should validate name format', async () => {
      const invalidDto = {
        phoneNumber: '11987654321',
        name: '', // Empty name
      }

      await expect(service.createUser(invalidDto)).rejects.toThrow(ValidationError)
    })

    it('should validate email format', async () => {
      const invalidDto = {
        phoneNumber: '11987654321',
        name: 'João Silva',
        email: 'invalid-email',
      }

      await expect(service.createUser(invalidDto)).rejects.toThrow(ValidationError)
    })

    it('should validate document format', async () => {
      const invalidDto = {
        phoneNumber: '11987654321',
        name: 'João Silva',
        document: '12345678901', // Invalid CPF
      }

      await expect(service.createUser(invalidDto)).rejects.toThrow(ValidationError)
    })
  })

  describe('legacy methods', () => {
    it('should support legacy getUsersByApartment method', async () => {
      const apartmentUsers = [mockUser]
      mockRepository.findByApartment.mockResolvedValue(apartmentUsers)

      const result = await service.getUsersByApartment('A101')

      expect(mockRepository.findByApartment).toHaveBeenCalledWith('A101')
      expect(result).toEqual(apartmentUsers)
    })
  })
})

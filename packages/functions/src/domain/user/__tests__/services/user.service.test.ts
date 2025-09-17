import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UserService } from '../../services/user.service'
import { IUserRepository } from '../../repositories/user-repository.interface'
import { User, UserStatus } from '../../entities/user.entity'
import {
  EntityNotFoundError,
  BusinessRuleViolationError,
  ValidationError,
} from '../../../shared/errors/domain-error'

// Mock repository
const mockUserRepository: IUserRepository = {
  findById: vi.fn(),
  findByPhoneNumber: vi.fn(),
  findAll: vi.fn(),
  findBy: vi.fn(),
  findByStatus: vi.fn(),
  findByApartment: vi.fn(),
  existsByPhoneNumber: vi.fn(),
  existsByDocument: vi.fn(),
  existsByCpf: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
}

describe('UserService', () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService(mockUserRepository)
    vi.clearAllMocks()
  })

  const validUserData = {
    phoneNumber: '+5511987654321',
    name: 'João Silva',
    document: '11144477735', // Valid CPF
    email: 'joao@example.com',
  }

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      vi.mocked(mockUserRepository.existsByPhoneNumber).mockResolvedValue(false)
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(false)

      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.save).mockResolvedValue(mockUser)

      const result = await userService.createUser(validUserData, 'admin')

      expect(mockUserRepository.existsByPhoneNumber).toHaveBeenCalledWith(validUserData.phoneNumber)
      expect(mockUserRepository.existsByDocument).toHaveBeenCalledWith(validUserData.document)
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw error if phone number already exists', async () => {
      vi.mocked(mockUserRepository.existsByPhoneNumber).mockResolvedValue(true)

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        BusinessRuleViolationError,
      )
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it('should throw error if document already exists', async () => {
      vi.mocked(mockUserRepository.existsByPhoneNumber).mockResolvedValue(false)
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(true)

      await expect(userService.createUser(validUserData)).rejects.toThrow(
        BusinessRuleViolationError,
      )
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })

    it('should throw ValidationError for invalid input data', async () => {
      const invalidData = {
        phoneNumber: 'invalid',
        name: 'A', // Too short
        document: 'invalid',
      }

      await expect(userService.createUser(invalidData as any)).rejects.toThrow()
    })

    it('should throw ValidationError for invalid input data', async () => {
      const invalidData = {
        phoneNumber: '', // Invalid: empty
        name: 'A', // Invalid: too short
        cpf: '123', // Invalid: too short
        email: 'invalid-email', // Invalid: bad format
      }

      await expect(userService.createUser(invalidData as any)).rejects.toThrow(ValidationError)
      expect(mockUserRepository.existsByPhoneNumber).not.toHaveBeenCalled()
      expect(mockUserRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('getUserByPhoneNumber', () => {
    it('should return user when found', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      const result = await userService.getUserByPhoneNumber(validUserData.phoneNumber)

      expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(validUserData.phoneNumber)
      expect(result).toEqual(mockUser)
    })

    it('should throw EntityNotFoundError when user not found', async () => {
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(null)

      await expect(userService.getUserByPhoneNumber(validUserData.phoneNumber)).rejects.toThrow(
        EntityNotFoundError,
      )
    })
  })

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = User.create(validUserData)
      const updateData = { name: 'Maria Silva', email: 'maria@example.com' }

      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.save).mockResolvedValue(mockUser)

      const result = await userService.updateUser(validUserData.phoneNumber, updateData, 'admin')

      expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(validUserData.phoneNumber)
      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw error when user not found', async () => {
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(null)

      await expect(
        userService.updateUser(validUserData.phoneNumber, { name: 'New Name' }),
      ).rejects.toThrow(EntityNotFoundError)
    })

    it('should throw ValidationError for invalid update data', async () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email',
      }

      await expect(userService.updateUser(validUserData.phoneNumber, invalidData)).rejects.toThrow()
    })

    it('should throw ValidationError for invalid update data', async () => {
      const invalidUpdateData = {
        name: 'A', // Invalid: too short
        email: 'invalid-email', // Invalid: bad format
      }

      await expect(
        userService.updateUser(validUserData.phoneNumber, invalidUpdateData as any),
      ).rejects.toThrow(ValidationError)
      expect(mockUserRepository.findByPhoneNumber).not.toHaveBeenCalled()
    })
  })

  describe('activateUser', () => {
    it('should activate inactive user', async () => {
      const mockUser = User.create({ ...validUserData, status: UserStatus.INACTIVE })
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.save).mockResolvedValue(mockUser)

      const result = await userService.activateUser(validUserData.phoneNumber, 'admin')

      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('deactivateUser', () => {
    it('should deactivate active user', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)
      vi.mocked(mockUserRepository.save).mockResolvedValue(mockUser)

      const result = await userService.deactivateUser(validUserData.phoneNumber, 'admin')

      expect(mockUserRepository.save).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })
  })

  describe('deleteUser', () => {
    it('should delete inactive user', async () => {
      const mockUser = User.create({ ...validUserData, status: UserStatus.INACTIVE })
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      await userService.deleteUser(validUserData.phoneNumber)

      expect(mockUserRepository.delete).toHaveBeenCalledWith(validUserData.phoneNumber)
    })

    it('should throw error when trying to delete active user', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      await expect(userService.deleteUser(validUserData.phoneNumber)).rejects.toThrow(
        BusinessRuleViolationError,
      )

      expect(mockUserRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('getUserDetails', () => {
    it('should return user details', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      const result = await userService.getUserDetails(validUserData.phoneNumber)

      expect(result.user.phoneNumber).toBe(mockUser.phoneNumber.formatted)
      expect(result.user.name).toBe(mockUser.name)
      expect(result.user.document).toBe(mockUser.document.formatted)
      expect(result.relatedUsers).toEqual([])
      expect(result.apartments).toEqual([])
      expect(result.paymentHistory).toEqual([])
    })
  })

  describe('validateDocumentUnique', () => {
    it('should return true for unique document', async () => {
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(false)

      const result = await userService.validateDocumentUnique('11144477735')

      expect(result).toBe(true)
    })

    it('should return false for existing document', async () => {
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(true)

      const result = await userService.validateDocumentUnique('11144477735')

      expect(result).toBe(false)
    })

    it('should return true when document belongs to the same user being updated', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(true)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      const result = await userService.validateDocumentUnique(
        '11144477735',
        validUserData.phoneNumber,
      )

      expect(result).toBe(true)
    })
  })

  describe('validateCpfUnique', () => {
    it('should return true for unique CPF', async () => {
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(false)

      const result = await userService.validateCpfUnique('11144477735')

      expect(result).toBe(true)
    })

    it('should return false for existing CPF', async () => {
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(true)

      const result = await userService.validateCpfUnique('11144477735')

      expect(result).toBe(false)
    })

    it('should return true when CPF belongs to the same user being updated', async () => {
      const mockUser = User.create(validUserData)
      vi.mocked(mockUserRepository.existsByDocument).mockResolvedValue(true)
      vi.mocked(mockUserRepository.findByPhoneNumber).mockResolvedValue(mockUser)

      const result = await userService.validateCpfUnique('11144477735', validUserData.phoneNumber)

      expect(result).toBe(true)
    })
  })
})

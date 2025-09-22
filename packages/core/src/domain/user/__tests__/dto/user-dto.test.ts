import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import {
  CreateUserDtoSchema,
  CreateUserRequestSchema,
  UpdateUserDtoSchema,
  UserDetailsDtoSchema,
} from '../../dto'
import { UserStatus } from '../../entities/user.entity'

describe('User DTOs Zod Validation', () => {
  describe('CreateUserDtoSchema', () => {
    const validData = {
      phoneNumber: '+5511987654321',
      name: 'João Silva',
      document: '11144477735',
      email: 'joao@example.com',
      status: UserStatus.ACTIVE,
    }

    it('should validate valid data', () => {
      const result = CreateUserDtoSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate data without optional fields', () => {
      const dataWithoutOptionals = {
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        document: '11144477735',
      }

      const result = CreateUserDtoSchema.parse(dataWithoutOptionals)
      expect(result.phoneNumber).toBe(dataWithoutOptionals.phoneNumber)
      expect(result.name).toBe(dataWithoutOptionals.name)
      expect(result.document).toBe(dataWithoutOptionals.document)
      expect(result.email).toBeUndefined()
      expect(result.status).toBeUndefined()
    })

    it('should trim name', () => {
      const dataWithSpaces = {
        ...validData,
        name: '  João Silva  ',
      }

      const result = CreateUserDtoSchema.parse(dataWithSpaces)
      expect(result.name).toBe('João Silva')
    })

    it('should throw error for empty phone number', () => {
      const invalidData = {
        ...validData,
        phoneNumber: '',
      }

      expect(() => CreateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should throw error for short name', () => {
      const invalidData = {
        ...validData,
        name: 'A',
      }

      expect(() => CreateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should throw error for invalid document', () => {
      const invalidData = {
        ...validData,
        document: '123456789',
      }

      expect(() => CreateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should throw error for invalid email', () => {
      const invalidData = {
        ...validData,
        email: 'invalid-email',
      }

      expect(() => CreateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should throw error for invalid status', () => {
      const invalidData = {
        ...validData,
        status: 'INVALID_STATUS' as any,
      }

      expect(() => CreateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('CreateUserRequestSchema', () => {
    const validData = {
      phoneNumber: '+5511987654321',
      name: 'João Silva',
      document: '11144477735',
      email: 'joao@example.com',
    }

    it('should validate valid request data', () => {
      const result = CreateUserRequestSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate request without email', () => {
      const dataWithoutEmail = {
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        document: '11144477735',
      }

      const result = CreateUserRequestSchema.parse(dataWithoutEmail)
      expect(result.email).toBeUndefined()
    })
  })

  describe('UpdateUserDtoSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        name: 'Maria Silva',
        email: 'maria@example.com',
      }

      const result = UpdateUserDtoSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate empty update data', () => {
      const result = UpdateUserDtoSchema.parse({})
      expect(result.name).toBeUndefined()
      expect(result.email).toBeUndefined()
    })

    it('should validate partial update data', () => {
      const nameOnlyData = { name: 'New Name' }
      const emailOnlyData = { email: 'new@example.com' }

      const nameResult = UpdateUserDtoSchema.parse(nameOnlyData)
      expect(nameResult.name).toBe('New Name')
      expect(nameResult.email).toBeUndefined()

      const emailResult = UpdateUserDtoSchema.parse(emailOnlyData)
      expect(emailResult.email).toBe('new@example.com')
      expect(emailResult.name).toBeUndefined()
    })

    it('should trim name in update', () => {
      const dataWithSpaces = { name: '  Trimmed Name  ' }
      const result = UpdateUserDtoSchema.parse(dataWithSpaces)
      expect(result.name).toBe('Trimmed Name')
    })

    it('should throw error for short name in update', () => {
      const invalidData = { name: 'A' }
      expect(() => UpdateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should throw error for invalid email in update', () => {
      const invalidData = { email: 'invalid-email' }
      expect(() => UpdateUserDtoSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('UserDetailsDtoSchema', () => {
    const validData = {
      phoneNumber: '+55 11 98765 4321',
      name: 'João Silva',
      document: '111.444.777-35',
      documentType: 'cpf',
      email: 'joao@example.com',
      status: UserStatus.ACTIVE,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    it('should validate valid user details', () => {
      const result = UserDetailsDtoSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate user details without email', () => {
      const { email, ...dataWithoutEmail } = validData

      const result = UserDetailsDtoSchema.parse(dataWithoutEmail)
      expect(result.email).toBeUndefined()
    })

    it('should throw error for missing required fields', () => {
      const incompleteData = {
        phoneNumber: '+55 11 98765 4321',
        name: 'João Silva',
        // Missing other required fields
      }

      expect(() => UserDetailsDtoSchema.parse(incompleteData)).toThrow(ZodError)
    })
  })
})

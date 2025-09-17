import { z } from 'zod'
import { UserStatus } from '../entities/user.entity'
import { phoneNumberValidator, documentValidator } from '../utils/validation.utils'

// Zod schemas for validation
export const CreateUserDtoSchema = z.object({
  phoneNumber: phoneNumberValidator,
  name: z.string().min(2, 'Name must have at least 2 characters').trim(),
  document: documentValidator,
  email: z.string().email('Invalid email format').optional(),
  status: z.nativeEnum(UserStatus).optional(),
})

export const CreateUserRequestSchema = z.object({
  phoneNumber: phoneNumberValidator,
  name: z.string().min(2, 'Name must have at least 2 characters').trim(),
  document: documentValidator,
  email: z.string().email('Invalid email format').optional(),
})

export const CreateUserResponseSchema = z.object({
  phoneNumber: z.string(),
  name: z.string(),
  document: z.string().optional(),
  documentType: z.string(),
  email: z.string().optional(),
  status: z.nativeEnum(UserStatus),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// TypeScript types inferred from Zod schemas
export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>

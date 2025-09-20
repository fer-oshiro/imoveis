import { z } from 'zod'

// Zod schemas for validation
export const UpdateUserDtoSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').trim().optional(),
  email: z.string().email('Invalid email format').optional(),
})

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(2, 'Name must have at least 2 characters').trim().optional(),
  email: z.string().email('Invalid email format').optional(),
})

export const UpdateUserResponseSchema = z.object({
  phoneNumber: z.string(),
  name: z.string(),
  document: z.string().optional(),
  documentType: z.string(),
  email: z.string().optional(),
  status: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// TypeScript types inferred from Zod schemas
export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>

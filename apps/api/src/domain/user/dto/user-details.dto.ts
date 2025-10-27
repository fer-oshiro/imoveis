import { z } from 'zod'

import { UserStatus } from '../entities/user.entity'

// Zod schemas for validation
export const UserDetailsDtoSchema = z.object({
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

export const UserWithRelationDtoSchema = z.object({
  user: UserDetailsDtoSchema,
  role: z.string(),
  relationshipType: z.string().optional(),
  isActive: z.boolean(),
})

export const ApartmentWithRelationDtoSchema = z.object({
  unitCode: z.string(),
  unitLabel: z.string(),
  address: z.string(),
  role: z.string(),
  relationshipType: z.string().optional(),
  isActive: z.boolean(),
})

export const PaymentHistoryDtoSchema = z.object({
  paymentId: z.string(),
  apartmentUnitCode: z.string(),
  amount: z.number().positive('Amount must be positive'),
  dueDate: z.string(),
  paymentDate: z.string().optional(),
  status: z.string(),
})

export const UserDetailsResponseSchema = z.object({
  user: UserDetailsDtoSchema,
  relatedUsers: z.array(UserWithRelationDtoSchema),
  apartments: z.array(ApartmentWithRelationDtoSchema),
  paymentHistory: z.array(PaymentHistoryDtoSchema),
})

// TypeScript types inferred from Zod schemas
export type UserDetailsDto = z.infer<typeof UserDetailsDtoSchema>
export type UserWithRelationDto = z.infer<typeof UserWithRelationDtoSchema>
export type ApartmentWithRelationDto = z.infer<typeof ApartmentWithRelationDtoSchema>
export type PaymentHistoryDto = z.infer<typeof PaymentHistoryDtoSchema>
export type UserDetailsResponse = z.infer<typeof UserDetailsResponseSchema>

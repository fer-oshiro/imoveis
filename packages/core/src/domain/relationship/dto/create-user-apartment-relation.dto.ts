import { z } from 'zod'
import { UserRole } from '../vo/user-role.vo'

export const CreateUserApartmentRelationDtoSchema = z.object({
  apartmentUnitCode: z.string().min(1, 'Apartment unit code is required'),
  userPhoneNumber: z.string().min(1, 'User phone number is required'),
  role: z.nativeEnum(UserRole),
  relationshipType: z.string().optional(),
  isActive: z.boolean().default(true),
})

export type CreateUserApartmentRelationDto = z.infer<typeof CreateUserApartmentRelationDtoSchema>

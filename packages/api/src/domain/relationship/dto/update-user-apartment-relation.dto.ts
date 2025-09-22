import { z } from 'zod'
import { UserRole } from '../vo/user-role.vo'

export const UpdateUserApartmentRelationDtoSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  relationshipType: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type UpdateUserApartmentRelationDto = z.infer<typeof UpdateUserApartmentRelationDtoSchema>

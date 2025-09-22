import { z } from 'zod'
import { APARTMENT_STATUS_VALUES, RENTAL_TYPE_VALUES } from '../vo/apartment-enums.vo'

export const apartmentQueryDto = z.object({
  status: z.enum(APARTMENT_STATUS_VALUES as [string, ...string[]]).optional(),
  rentalType: z.enum(RENTAL_TYPE_VALUES as [string, ...string[]]).optional(),
  isAvailable: z.boolean().optional(),
  minRent: z.number().min(0).optional(),
  maxRent: z.number().min(0).optional(),
  hasAmenity: z.string().optional(), // Specific amenity to filter by
  sortBy: z.enum(['unitCode', 'baseRent', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export type ApartmentQueryDto = z.infer<typeof apartmentQueryDto>

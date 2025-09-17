import { z } from 'zod'
import { ContactMethod } from '../../shared'
import { APARTMENT_STATUS_VALUES, RENTAL_TYPE_VALUES } from '../vo/apartment-enums.vo'

export const updateApartmentDto = z.object({
  unitLabel: z.string().min(1, 'Unit label is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  status: z.enum(APARTMENT_STATUS_VALUES as [string, ...string[]]).optional(),
  rentalType: z.enum(RENTAL_TYPE_VALUES as [string, ...string[]]).optional(),
  baseRent: z.number().min(0, 'Base rent must be non-negative').optional(),
  cleaningFee: z.number().min(0, 'Cleaning fee must be non-negative').optional(),
  images: z.array(z.string()).optional(),
  amenities: z
    .object({
      hasCleaningService: z.boolean().optional(),
      waterIncluded: z.boolean().optional(),
      electricityIncluded: z.boolean().optional(),
      hasWifi: z.boolean().optional(),
      hasAirConditioning: z.boolean().optional(),
      hasWashingMachine: z.boolean().optional(),
      hasKitchen: z.boolean().optional(),
      hasFurniture: z.boolean().optional(),
      hasParking: z.boolean().optional(),
      hasElevator: z.boolean().optional(),
      hasBalcony: z.boolean().optional(),
      petFriendly: z.boolean().optional(),
    })
    .optional(),
  contactPhone: z.string().min(1, 'Contact phone is required').optional(),
  contactMethod: z.nativeEnum(ContactMethod).optional(),
  airbnbLink: z.string().url('Invalid Airbnb URL').optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  availableFrom: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
})

export type UpdateApartmentDto = z.infer<typeof updateApartmentDto>

import { APARTMENT_STATUS } from '@imovel/core/domain/apartment'
import { z } from 'zod'

export const ApartmentDynamoSchema = z.object({
  PK: z.string(),
  SK: z.string(),
  status: z.nativeEnum(APARTMENT_STATUS),
  rentAmount: z.coerce.number().default(0),
  location: z.string().default(''),
  label: z.string().default(''),
  description: z.string().default(''),
  images: z.array(z.string()).default([]),
  airbnbLink: z.string().default(''),
  isOccupied: z.boolean().default(false),
  cleanCost: z.coerce.number().optional(),
  metadata: z.record(z.any()).default({}),
})

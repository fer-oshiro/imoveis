import { z } from 'zod'

import { APARTMENT_STATUS } from '../vo'

export const ApartmentResponse = z.object({
  id: z.string(),
  airbnbLink: z.string(),
  cleanCost: z.number(),
  description: z.string(),
  images: z.array(z.string()),
  label: z.string(),
  location: z.string(),
  rentAmount: z.number(),
  status: z.enum([
    APARTMENT_STATUS.AVAILABLE,
    APARTMENT_STATUS.OCCUPIED,
    APARTMENT_STATUS.MAINTENANCE,
  ]),
})

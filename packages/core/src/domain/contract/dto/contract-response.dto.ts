import { z } from 'zod'

import { MetadataSchema } from '../../common'
import { OptionSchema } from '../vo'

export const ContractResponse = z.object({
  id: z.string(),
  apartmentId: z.string(),
  balance: z.number(),
  document: z.string(),
  dueDate: z.string().optional().nullable().default(''),
  images: z.array(z.string()),
  lastPaymentDate: z.string().optional().nullable().default(''),
  lastPaymentId: z.string().optional().nullable().default(''),
  metadata: MetadataSchema,
  options: OptionSchema,
  rentAmount: z.number(),
  userId: z.string(),
  valid: z.boolean(),
})

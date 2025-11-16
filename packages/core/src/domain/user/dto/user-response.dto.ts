import { z } from 'zod'

import { MetadataSchema, StatusSchema } from '../../common'
import { RoleSchema } from '../vo'

export const UserResponse = z.object({
  docName: z.string(),
  document: z.string(),
  id: z.string(),
  metadata: MetadataSchema,
  name: z.string(),
  phone: z.string().optional(),
  role: z.array(RoleSchema),
  status: StatusSchema,
})

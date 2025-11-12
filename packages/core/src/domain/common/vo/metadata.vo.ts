import { z } from 'zod'

export const MetadataSchema = z.object({
  createdAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  updatedAt: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  deletedAt: z.string().datetime().optional(),
  createdBy: z.string().default('system'),
  updatedBy: z.string().default('system'),
})

export type Metadata = z.infer<typeof MetadataSchema>

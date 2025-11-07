import { z } from 'zod'

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export const StatusSchema = z
  .enum([Status.ACTIVE, Status.INACTIVE, Status.PENDING, Status.SUSPENDED])
  .default(Status.ACTIVE)

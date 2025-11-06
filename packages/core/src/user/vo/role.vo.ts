import { z } from 'zod'

export enum Role {
  ADMIN = 'admin',
  TENANT = 'tenant',
  RESIDENT = 'resident',
  CONTACT = 'contact',
}

export const RoleSchema = z
  .enum([Role.ADMIN, Role.TENANT, Role.RESIDENT, Role.CONTACT])
  .default(Role.RESIDENT)

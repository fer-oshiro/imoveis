import { z } from 'zod'

export enum APARTMENT_STATUS {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

export const ApartmentStatusSchema = z
  .enum([APARTMENT_STATUS.AVAILABLE, APARTMENT_STATUS.OCCUPIED, APARTMENT_STATUS.MAINTENANCE])
  .default(APARTMENT_STATUS.AVAILABLE)

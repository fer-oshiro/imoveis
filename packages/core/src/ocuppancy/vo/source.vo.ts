import { z } from 'zod'

export enum OccupancySource {
  AIRBNB = 'airbnb',
  CONTRACT = 'contract',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export const OccupancySourceSchema = z
  .enum([
    OccupancySource.AIRBNB,
    OccupancySource.CONTRACT,
    OccupancySource.MAINTENANCE,
    OccupancySource.OTHER,
  ])
  .default(OccupancySource.OTHER)

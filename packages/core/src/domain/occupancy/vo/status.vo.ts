import { z } from 'zod'

export enum OccupancyStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  BLOCKED = 'blocked',
}

export const OccupancyStatusSchema = z
  .enum([OccupancyStatus.AVAILABLE, OccupancyStatus.OCCUPIED, OccupancyStatus.BLOCKED])
  .default(OccupancyStatus.AVAILABLE)

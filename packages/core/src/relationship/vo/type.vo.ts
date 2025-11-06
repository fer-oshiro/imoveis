import { z } from 'zod'

export enum RELATIONSHIP_TYPE {
  FAMILY = 'family',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  OTHER = 'other',
}

export const RelationshipTypeSchema = z
  .enum([
    RELATIONSHIP_TYPE.FAMILY,
    RELATIONSHIP_TYPE.FRIEND,
    RELATIONSHIP_TYPE.COLLEAGUE,
    RELATIONSHIP_TYPE.OTHER,
  ])
  .default(RELATIONSHIP_TYPE.FAMILY)

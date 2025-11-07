import { z } from 'zod'
export enum Option {
  PARKING = 'parking',
  WATER = 'water',
  ELECTRICITY = 'electricity',
  INTERNET = 'internet',
  FURNISHED = 'furnished',
}

export const OptionSchema = z
  .array(z.enum([Option.PARKING, Option.WATER, Option.INTERNET, Option.FURNISHED]))
  .default([Option.FURNISHED])

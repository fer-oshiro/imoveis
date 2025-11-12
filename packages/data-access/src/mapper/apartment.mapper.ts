import { Apartment } from '@imovel/core/domain/apartment'

import { ApartmentDynamoSchema } from '../type'

const APARTMENT_PREFIX = 'APARTMENT#'

export function mapDynamoToApartment(item: unknown): Apartment {
  const parsed = ApartmentDynamoSchema.parse(item)

  const id = parsed.PK.startsWith(APARTMENT_PREFIX)
    ? parsed.PK.slice(APARTMENT_PREFIX.length)
    : parsed.PK

  return Apartment.create({
    id,
    label: parsed.label,
    rentAmount: parseFloat(parsed.rentAmount),
    status: parsed.status,
    location: parsed.location,
    description: parsed.description,
    images: parsed.images,
    airbnbLink: parsed.airbnbLink,
    cleanCost: parseFloat(parsed.cleanCost || '0'),
    metadata: parsed.metadata,
  })
}

export enum ApartmentStatus {
  OCCUPIED = 'occupied',
  VACANT = 'vacant',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
  AVAILABLE = 'available',
  RESERVED = 'reserved',
}

export enum RentalType {
  LONG_TERM = 'long_term',
  AIRBNB = 'airbnb',
  BOTH = 'both',
}

export const APARTMENT_STATUS_VALUES = Object.values(ApartmentStatus)
export const RENTAL_TYPE_VALUES = Object.values(RentalType)

import { ApartmentAmenitiesVO, ApartmentAmenities } from '../../vo/apartment-amenities.vo'
import {
  ApartmentStatus,
  RentalType,
  APARTMENT_STATUS_VALUES,
  RENTAL_TYPE_VALUES,
} from '../../vo/apartment-enums.vo'

import { ValidationError } from '../../../shared/errors/domain-error'

describe('Apartment Value Objects', () => {
  describe('ApartmentAmenitiesVO', () => {
    it('should create with default values', () => {
      const amenities = new ApartmentAmenitiesVO()

      expect(amenities.hasCleaningService).toBe(false)
      expect(amenities.waterIncluded).toBe(false)
      expect(amenities.electricityIncluded).toBe(false)
      expect(amenities.hasWifi).toBe(false)
      expect(amenities.hasAirConditioning).toBe(false)
      expect(amenities.hasWashingMachine).toBe(false)
      expect(amenities.hasKitchen).toBe(true) // Default true
      expect(amenities.hasFurniture).toBe(false)
      expect(amenities.hasParking).toBe(false)
      expect(amenities.hasElevator).toBe(false)
      expect(amenities.hasBalcony).toBe(false)
      expect(amenities.petFriendly).toBe(false)
    })

    it('should create with custom values', () => {
      const customAmenities: Partial<ApartmentAmenities> = {
        hasCleaningService: true,
        waterIncluded: true,
        electricityIncluded: true,
        hasWifi: true,
        hasAirConditioning: true,
        hasWashingMachine: true,
        hasKitchen: false,
        hasFurniture: true,
        hasParking: true,
        hasElevator: true,
        hasBalcony: true,
        petFriendly: true,
      }

      const amenities = new ApartmentAmenitiesVO(customAmenities)

      expect(amenities.hasCleaningService).toBe(true)
      expect(amenities.waterIncluded).toBe(true)
      expect(amenities.electricityIncluded).toBe(true)
      expect(amenities.hasWifi).toBe(true)
      expect(amenities.hasAirConditioning).toBe(true)
      expect(amenities.hasWashingMachine).toBe(true)
      expect(amenities.hasKitchen).toBe(false)
      expect(amenities.hasFurniture).toBe(true)
      expect(amenities.hasParking).toBe(true)
      expect(amenities.hasElevator).toBe(true)
      expect(amenities.hasBalcony).toBe(true)
      expect(amenities.petFriendly).toBe(true)
    })

    it('should create with partial values', () => {
      const partialAmenities: Partial<ApartmentAmenities> = {
        hasWifi: true,
        hasAirConditioning: true,
        petFriendly: true,
      }

      const amenities = new ApartmentAmenitiesVO(partialAmenities)

      expect(amenities.hasWifi).toBe(true)
      expect(amenities.hasAirConditioning).toBe(true)
      expect(amenities.petFriendly).toBe(true)
      expect(amenities.hasCleaningService).toBe(false) // Default
      expect(amenities.hasKitchen).toBe(true) // Default true
    })

    it('should create using static create method', () => {
      const amenities = ApartmentAmenitiesVO.create({
        hasWifi: true,
        hasParking: true,
      })

      expect(amenities).toBeInstanceOf(ApartmentAmenitiesVO)
      expect(amenities.hasWifi).toBe(true)
      expect(amenities.hasParking).toBe(true)
    })

    it('should serialize to JSON correctly', () => {
      const amenities = new ApartmentAmenitiesVO({
        hasWifi: true,
        hasAirConditioning: true,
        petFriendly: true,
      })

      const json = amenities.toJSON()

      expect(json).toEqual({
        hasCleaningService: false,
        waterIncluded: false,
        electricityIncluded: false,
        hasWifi: true,
        hasAirConditioning: true,
        hasWashingMachine: false,
        hasKitchen: true,
        hasFurniture: false,
        hasParking: false,
        hasElevator: false,
        hasBalcony: false,
        petFriendly: true,
      })
    })

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        hasCleaningService: true,
        waterIncluded: true,
        electricityIncluded: false,
        hasWifi: true,
        hasAirConditioning: true,
        hasWashingMachine: false,
        hasKitchen: true,
        hasFurniture: true,
        hasParking: false,
        hasElevator: true,
        hasBalcony: false,
        petFriendly: true,
      }

      const amenities = ApartmentAmenitiesVO.fromJSON(jsonData)

      expect(amenities).toBeInstanceOf(ApartmentAmenitiesVO)
      expect(amenities.hasCleaningService).toBe(true)
      expect(amenities.waterIncluded).toBe(true)
      expect(amenities.electricityIncluded).toBe(false)
      expect(amenities.hasWifi).toBe(true)
      expect(amenities.hasAirConditioning).toBe(true)
      expect(amenities.hasWashingMachine).toBe(false)
      expect(amenities.hasKitchen).toBe(true)
      expect(amenities.hasFurniture).toBe(true)
      expect(amenities.hasParking).toBe(false)
      expect(amenities.hasElevator).toBe(true)
      expect(amenities.hasBalcony).toBe(false)
      expect(amenities.petFriendly).toBe(true)
    })

    it('should handle missing properties in JSON', () => {
      const partialJson = {
        hasWifi: true,
        hasParking: true,
      }

      const amenities = ApartmentAmenitiesVO.fromJSON(partialJson)

      expect(amenities.hasWifi).toBe(true)
      expect(amenities.hasParking).toBe(true)
      expect(amenities.hasCleaningService).toBe(false) // Default
      expect(amenities.hasKitchen).toBe(true) // Default true
    })
  })

  describe('ApartmentStatus enum', () => {
    it('should have correct status values', () => {
      expect(ApartmentStatus.AVAILABLE).toBe('available')
      expect(ApartmentStatus.OCCUPIED).toBe('occupied')
      expect(ApartmentStatus.VACANT).toBe('vacant')
      expect(ApartmentStatus.RESERVED).toBe('reserved')
      expect(ApartmentStatus.MAINTENANCE).toBe('maintenance')
      expect(ApartmentStatus.INACTIVE).toBe('inactive')
    })

    it('should have correct status values array', () => {
      expect(APARTMENT_STATUS_VALUES).toContain('available')
      expect(APARTMENT_STATUS_VALUES).toContain('occupied')
      expect(APARTMENT_STATUS_VALUES).toContain('vacant')
      expect(APARTMENT_STATUS_VALUES).toContain('reserved')
      expect(APARTMENT_STATUS_VALUES).toContain('maintenance')
      expect(APARTMENT_STATUS_VALUES).toContain('inactive')
      expect(APARTMENT_STATUS_VALUES).toHaveLength(6)
    })
  })

  describe('RentalType enum', () => {
    it('should have correct rental type values', () => {
      expect(RentalType.LONG_TERM).toBe('long_term')
      expect(RentalType.AIRBNB).toBe('airbnb')
      expect(RentalType.BOTH).toBe('both')
    })

    it('should have correct rental type values array', () => {
      expect(RENTAL_TYPE_VALUES).toContain('long_term')
      expect(RENTAL_TYPE_VALUES).toContain('airbnb')
      expect(RENTAL_TYPE_VALUES).toContain('both')
      expect(RENTAL_TYPE_VALUES).toHaveLength(3)
    })
  })
})

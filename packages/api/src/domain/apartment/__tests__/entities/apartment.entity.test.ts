import { Apartment } from '../../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'
import { ContactMethod } from '../../../shared'
import { ValidationError } from '../../../shared/errors/domain-error'

describe('Apartment Entity', () => {
  const validData = {
    unitCode: 'A101',
    unitLabel: 'Apartment 101',
    address: '123 Main St, São Paulo, SP',
    baseRent: 2000,
    contactPhone: '11987654321',
    createdBy: 'test-user',
  }

  describe('create', () => {
    it('should create a valid apartment with default values', () => {
      const apartment = Apartment.create(validData)

      expect(apartment.unitCodeValue).toBe('A101')
      expect(apartment.unitLabelValue).toBe('Apartment 101')
      expect(apartment.addressValue).toBe('123 Main St, São Paulo, SP')
      expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
      expect(apartment.rentalTypeValue).toBe(RentalType.LONG_TERM)
      expect(apartment.baseRentValue).toBe(2000)
      expect(apartment.cleaningFeeValue).toBe(0)
      expect(apartment.imagesValue).toEqual([])
      expect(apartment.isAvailableValue).toBe(false)
      expect(apartment.airbnbLinkValue).toBeUndefined()
    })

    it('should create apartment with custom values', () => {
      const customData = {
        ...validData,
        status: ApartmentStatus.OCCUPIED,
        rentalType: RentalType.AIRBNB,
        cleaningFee: 150,
        images: ['image1.jpg', 'image2.jpg'],
        contactMethod: ContactMethod.CALL,
        airbnbLink: 'https://airbnb.com/rooms/123',
        isAvailable: true,
        availableFrom: new Date('2024-01-01'),
        amenities: {
          hasWifi: true,
          hasAirConditioning: true,
        },
      }

      const apartment = Apartment.create(customData)

      expect(apartment.statusValue).toBe(ApartmentStatus.OCCUPIED)
      expect(apartment.rentalTypeValue).toBe(RentalType.AIRBNB)
      expect(apartment.cleaningFeeValue).toBe(150)
      expect(apartment.imagesValue).toEqual(['image1.jpg', 'image2.jpg'])
      expect(apartment.airbnbLinkValue).toBe('https://airbnb.com/rooms/123')
      expect(apartment.isAvailableValue).toBe(true)
      expect(apartment.availableFromValue).toEqual(new Date('2024-01-01'))
      expect(apartment.amenitiesValue.hasWifi).toBe(true)
      expect(apartment.amenitiesValue.hasAirConditioning).toBe(true)
    })

    it('should create apartment with contact info', () => {
      const apartment = Apartment.create({
        ...validData,
        contactMethod: ContactMethod.WHATSAPP,
      })

      expect(apartment.contactInfoValue.phoneNumber).toBe('+5511987654321')
      expect(apartment.contactInfoValue.contactMethod).toBe(ContactMethod.WHATSAPP)
    })
  })

  describe('business logic methods', () => {
    let apartment: Apartment

    beforeEach(() => {
      apartment = Apartment.create(validData)
    })

    describe('markAsOccupied', () => {
      it('should mark apartment as occupied', () => {
        apartment.markAsOccupied('updater')

        expect(apartment.statusValue).toBe(ApartmentStatus.OCCUPIED)
        expect(apartment.isAvailableValue).toBe(false)
        expect(apartment.availableFromValue).toBeUndefined()
      })

      it('should update metadata when marking as occupied', () => {
        const originalVersion = apartment.metadataValue.version
        apartment.markAsOccupied('updater')

        expect(apartment.metadataValue.version).toBe(originalVersion + 1)
        expect(apartment.metadataValue.updatedBy).toBe('updater')
      })
    })

    describe('markAsAvailable', () => {
      it('should mark apartment as available', () => {
        const availableDate = new Date('2024-02-01')
        apartment.markAsAvailable(availableDate, 'updater')

        expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
        expect(apartment.isAvailableValue).toBe(true)
        expect(apartment.availableFromValue).toEqual(availableDate)
      })

      it('should mark as available without date', () => {
        apartment.markAsAvailable(undefined, 'updater')

        expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
        expect(apartment.isAvailableValue).toBe(true)
        expect(apartment.availableFromValue).toBeUndefined()
      })
    })

    describe('markAsInactive', () => {
      it('should mark apartment as inactive', () => {
        apartment.markAsInactive('updater')

        expect(apartment.statusValue).toBe(ApartmentStatus.INACTIVE)
        expect(apartment.isAvailableValue).toBe(false)
        expect(apartment.availableFromValue).toBeUndefined()
      })
    })

    describe('updateRentalType', () => {
      it('should update rental type', () => {
        apartment.updateRentalType(RentalType.BOTH, 'updater')

        expect(apartment.rentalTypeValue).toBe(RentalType.BOTH)
      })
    })

    describe('updateAirbnbLink', () => {
      it('should update Airbnb link', () => {
        const link = 'https://airbnb.com/rooms/456'
        apartment.updateAirbnbLink(link, 'updater')

        expect(apartment.airbnbLinkValue).toBe(link)
      })

      it('should clear Airbnb link', () => {
        apartment.updateAirbnbLink('https://airbnb.com/rooms/456')
        apartment.updateAirbnbLink(undefined, 'updater')

        expect(apartment.airbnbLinkValue).toBeUndefined()
      })
    })

    describe('image management', () => {
      it('should add image', () => {
        apartment.addImage('new-image.jpg', 'updater')

        expect(apartment.imagesValue).toContain('new-image.jpg')
      })

      it('should not add duplicate image', () => {
        apartment.addImage('image.jpg')
        apartment.addImage('image.jpg')

        expect(apartment.imagesValue.filter((img) => img === 'image.jpg')).toHaveLength(1)
      })

      it('should remove image', () => {
        apartment.addImage('image.jpg')
        apartment.removeImage('image.jpg', 'updater')

        expect(apartment.imagesValue).not.toContain('image.jpg')
      })

      it('should not fail when removing non-existent image', () => {
        expect(() => apartment.removeImage('non-existent.jpg')).not.toThrow()
      })
    })

    describe('updatePricing', () => {
      it('should update base rent only', () => {
        apartment.updatePricing(2500, undefined, 'updater')

        expect(apartment.baseRentValue).toBe(2500)
        expect(apartment.cleaningFeeValue).toBe(0) // Original value
      })

      it('should update both base rent and cleaning fee', () => {
        apartment.updatePricing(2500, 200, 'updater')

        expect(apartment.baseRentValue).toBe(2500)
        expect(apartment.cleaningFeeValue).toBe(200)
      })
    })

    describe('rental type checks', () => {
      it('should check if Airbnb is enabled', () => {
        apartment.updateRentalType(RentalType.AIRBNB)
        expect(apartment.isAirbnbEnabled()).toBe(true)

        apartment.updateRentalType(RentalType.BOTH)
        expect(apartment.isAirbnbEnabled()).toBe(true)

        apartment.updateRentalType(RentalType.LONG_TERM)
        expect(apartment.isAirbnbEnabled()).toBe(false)
      })

      it('should check if long term is enabled', () => {
        apartment.updateRentalType(RentalType.LONG_TERM)
        expect(apartment.isLongTermEnabled()).toBe(true)

        apartment.updateRentalType(RentalType.BOTH)
        expect(apartment.isLongTermEnabled()).toBe(true)

        apartment.updateRentalType(RentalType.AIRBNB)
        expect(apartment.isLongTermEnabled()).toBe(false)
      })
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const apartment = Apartment.create({
        ...validData,
        availableFrom: new Date('2024-01-01'),
      })
      const json = apartment.toJSON()

      expect(json.pk).toBe('APARTMENT#A101')
      expect(json.sk).toBe('INFO')
      expect(json.unitCode).toBe('A101')
      expect(json.unitLabel).toBe('Apartment 101')
      expect(json.address).toBe('123 Main St, São Paulo, SP')
      expect(json.status).toBe(ApartmentStatus.AVAILABLE)
      expect(json.rentalType).toBe(RentalType.LONG_TERM)
      expect(json.baseRent).toBe(2000)
      expect(json.cleaningFee).toBe(0)
      expect(json.images).toEqual([])
      expect(json.isAvailable).toBe(false)
      expect(json.availableFrom).toBe('2024-01-01T00:00:00.000Z')
      expect(json.amenities).toBeDefined()
      expect(json.contactInfo).toBeDefined()
      expect(json.createdAt).toBeDefined()
      expect(json.updatedAt).toBeDefined()
    })

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        pk: 'APARTMENT#A101',
        sk: 'INFO',
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St, São Paulo, SP',
        status: ApartmentStatus.AVAILABLE,
        rentalType: RentalType.LONG_TERM,
        baseRent: 2000,
        cleaningFee: 0,
        images: ['image1.jpg'],
        isAvailable: true,
        availableFrom: '2024-01-01T00:00:00.000Z',
        contactInfo: {
          phoneNumber: '+5511987654321',
          contactMethod: ContactMethod.WHATSAPP,
        },
        amenities: {
          hasWifi: true,
          hasAirConditioning: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }

      const apartment = Apartment.fromJSON(jsonData)

      expect(apartment.unitCodeValue).toBe('A101')
      expect(apartment.unitLabelValue).toBe('Apartment 101')
      expect(apartment.statusValue).toBe(ApartmentStatus.AVAILABLE)
      expect(apartment.rentalTypeValue).toBe(RentalType.LONG_TERM)
      expect(apartment.baseRentValue).toBe(2000)
      expect(apartment.imagesValue).toEqual(['image1.jpg'])
      expect(apartment.isAvailableValue).toBe(true)
      expect(apartment.availableFromValue).toEqual(new Date('2024-01-01'))
      expect(apartment.contactInfoValue.phoneNumber).toBe('+5511987654321')
      expect(apartment.amenitiesValue.hasWifi).toBe(true)
    })

    it('should handle legacy data format', () => {
      const legacyData = {
        pk: 'APARTMENT#A101',
        sk: 'INFO',
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St, São Paulo, SP',
        status: ApartmentStatus.AVAILABLE,
        baseRent: 2000,
        contactPhone: '11987654321',
        contactMethod: ContactMethod.WHATSAPP,
        hasCleaningService: true,
        waterIncluded: 'yes',
        electricityIncluded: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }

      const apartment = Apartment.fromJSON(legacyData)

      expect(apartment.unitCodeValue).toBe('A101')
      expect(apartment.contactInfoValue.phoneNumber).toBe('+5511987654321')
      expect(apartment.amenitiesValue.hasCleaningService).toBe(true)
      expect(apartment.amenitiesValue.waterIncluded).toBe(true)
      expect(apartment.amenitiesValue.electricityIncluded).toBe(false)
    })
  })
})

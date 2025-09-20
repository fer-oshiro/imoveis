import { createApartmentDto, CreateApartmentDto } from '../../dto/create-apartment.dto'
import { updateApartmentDto, UpdateApartmentDto } from '../../dto/update-apartment.dto'
import { apartmentQueryDto, ApartmentQueryDto } from '../../dto/apartment-query.dto'
import { ContactMethod } from '../../../shared'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'

describe('Apartment DTOs', () => {
  describe('CreateApartmentDto', () => {
    const validData = {
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: '123 Main St, São Paulo, SP',
      baseRent: 2000,
      contactPhone: '11987654321',
    }

    it('should validate valid data', () => {
      const result = createApartmentDto.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.unitCode).toBe('A101')
        expect(result.data.unitLabel).toBe('Apartment 101')
        expect(result.data.baseRent).toBe(2000)
        expect(result.data.contactPhone).toBe('11987654321')
      }
    })

    it('should validate with optional fields', () => {
      const dataWithOptionals = {
        ...validData,
        status: ApartmentStatus.AVAILABLE,
        rentalType: RentalType.LONG_TERM,
        cleaningFee: 150,
        images: ['image1.jpg', 'image2.jpg'],
        contactMethod: ContactMethod.WHATSAPP,
        airbnbLink: 'https://airbnb.com/rooms/123',
        isAvailable: true,
        availableFrom: '2024-01-01T00:00:00.000Z',
        amenities: {
          hasWifi: true,
          hasAirConditioning: true,
          hasCleaningService: false,
        },
      }

      const result = createApartmentDto.safeParse(dataWithOptionals)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(ApartmentStatus.AVAILABLE)
        expect(result.data.rentalType).toBe(RentalType.LONG_TERM)
        expect(result.data.cleaningFee).toBe(150)
        expect(result.data.images).toEqual(['image1.jpg', 'image2.jpg'])
        expect(result.data.contactMethod).toBe(ContactMethod.WHATSAPP)
        expect(result.data.airbnbLink).toBe('https://airbnb.com/rooms/123')
        expect(result.data.isAvailable).toBe(true)
        expect(result.data.availableFrom).toEqual(new Date('2024-01-01T00:00:00.000Z'))
        expect(result.data.amenities?.hasWifi).toBe(true)
      }
    })

    it('should fail validation for missing required fields', () => {
      const invalidData = {
        unitCode: 'A101',
        // Missing unitLabel, address, baseRent, contactPhone
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3) // 4 missing required fields
      }
    })

    it('should fail validation for empty strings', () => {
      const invalidData = {
        ...validData,
        unitCode: '',
        unitLabel: '',
        address: '',
        contactPhone: '',
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should fail validation for negative base rent', () => {
      const invalidData = {
        ...validData,
        baseRent: -100,
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Base rent must be non-negative')
      }
    })

    it('should fail validation for negative cleaning fee', () => {
      const invalidData = {
        ...validData,
        cleaningFee: -50,
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Cleaning fee must be non-negative')
      }
    })

    it('should fail validation for invalid Airbnb URL', () => {
      const invalidData = {
        ...validData,
        airbnbLink: 'not-a-url',
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid Airbnb URL')
      }
    })

    it('should fail validation for invalid status enum', () => {
      const invalidData = {
        ...validData,
        status: 'invalid-status',
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should fail validation for invalid rental type enum', () => {
      const invalidData = {
        ...validData,
        rentalType: 'invalid-rental-type',
      }

      const result = createApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should transform availableFrom string to Date', () => {
      const dataWithDate = {
        ...validData,
        availableFrom: '2024-01-01T00:00:00.000Z',
      }

      const result = createApartmentDto.safeParse(dataWithDate)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.availableFrom).toBeInstanceOf(Date)
        expect(result.data.availableFrom?.toISOString()).toBe('2024-01-01T00:00:00.000Z')
      }
    })
  })

  describe('UpdateApartmentDto', () => {
    it('should validate partial update data', () => {
      const updateData = {
        status: ApartmentStatus.OCCUPIED,
        baseRent: 2500,
      }

      const result = updateApartmentDto.safeParse(updateData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(ApartmentStatus.OCCUPIED)
        expect(result.data.baseRent).toBe(2500)
      }
    })

    it('should validate empty update data', () => {
      const result = updateApartmentDto.safeParse({})

      expect(result.success).toBe(true)
    })

    it('should fail validation for negative values', () => {
      const invalidData = {
        baseRent: -100,
        cleaningFee: -50,
      }

      const result = updateApartmentDto.safeParse(invalidData)

      expect(result.success).toBe(false)
    })

    it('should validate airbnb link update', () => {
      const updateData = {
        airbnbLink: 'https://airbnb.com/rooms/456',
      }

      const result = updateApartmentDto.safeParse(updateData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.airbnbLink).toBe('https://airbnb.com/rooms/456')
      }
    })

    it('should allow clearing airbnb link with empty string', () => {
      const updateData = {
        airbnbLink: '',
      }

      const result = updateApartmentDto.safeParse(updateData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.airbnbLink).toBe('')
      }
    })
  })

  describe('ApartmentQueryDto', () => {
    it('should validate empty query', () => {
      const result = apartmentQueryDto.safeParse({})

      expect(result.success).toBe(true)
    })

    it('should validate query with all filters', () => {
      const queryData = {
        status: ApartmentStatus.AVAILABLE,
        rentalType: RentalType.LONG_TERM,
        isAvailable: true,
        minRent: 1000,
        maxRent: 3000,
        sortBy: 'unitCode',
        sortOrder: 'asc',
        limit: 10,
        offset: 0,
      }

      const result = apartmentQueryDto.safeParse(queryData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(ApartmentStatus.AVAILABLE)
        expect(result.data.rentalType).toBe(RentalType.LONG_TERM)
        expect(result.data.isAvailable).toBe(true)
        expect(result.data.minRent).toBe(1000)
        expect(result.data.maxRent).toBe(3000)
        expect(result.data.sortBy).toBe('unitCode')
        expect(result.data.sortOrder).toBe('asc')
        expect(result.data.limit).toBe(10)
        expect(result.data.offset).toBe(0)
      }
    })

    it('should fail validation for negative rent values', () => {
      const invalidQuery = {
        minRent: -100,
        maxRent: -50,
      }

      const result = apartmentQueryDto.safeParse(invalidQuery)

      expect(result.success).toBe(false)
    })

    it('should fail validation for negative limit and offset', () => {
      const invalidQuery = {
        limit: -1,
        offset: -1,
      }

      const result = apartmentQueryDto.safeParse(invalidQuery)

      expect(result.success).toBe(false)
    })

    it('should fail validation for invalid sort fields', () => {
      const invalidQuery = {
        sortBy: 'invalidField',
      }

      const result = apartmentQueryDto.safeParse(invalidQuery)

      expect(result.success).toBe(false)
    })

    it('should fail validation for invalid sort order', () => {
      const invalidQuery = {
        sortOrder: 'invalid',
      }

      const result = apartmentQueryDto.safeParse(invalidQuery)

      expect(result.success).toBe(false)
    })

    it('should validate different sort fields', () => {
      const sortFields = ['unitCode', 'baseRent', 'createdAt', 'updatedAt']

      sortFields.forEach((sortBy) => {
        const query = { sortBy }
        const result = apartmentQueryDto.safeParse(query)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.sortBy).toBe(sortBy)
        }
      })
    })

    it('should validate both sort orders', () => {
      const sortOrders = ['asc', 'desc']

      sortOrders.forEach((sortOrder) => {
        const query = { sortOrder }
        const result = apartmentQueryDto.safeParse(query)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.sortOrder).toBe(sortOrder)
        }
      })
    })
  })
})

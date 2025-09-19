import { vi } from 'vitest'

// Mock SST Resource before importing anything else
vi.mock('sst', () => ({
  Resource: {
    table: {
      name: 'test-table',
    },
  },
}))

import ApartmentService from '../../services/apartment.service'
import { IApartmentRepository } from '../../repositories/apartment.repository'
import { Apartment } from '../../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'
import { CreateApartmentDto, UpdateApartmentDto } from '../../dto'
import { ContactMethod } from '../../../shared'
import {
  ApartmentNotFoundError,
  ApartmentAlreadyExistsError,
  ApartmentOccupiedError,
  InvalidApartmentStatusTransitionError,
  ApartmentCreateError,
  ApartmentUpdateError,
} from '../../errors'
import { BusinessRuleViolationError } from '../../../shared'

// Mock the repository
// @ts-ignore - Mock typing issue
const mockRepository: IApartmentRepository = {
  findAll: vi.fn(),
  findByUnitCode: vi.fn(),
  findByStatus: vi.fn(),
  findByRentalType: vi.fn(),
  findAvailable: vi.fn(),
  findAirbnbApartments: vi.fn(),
  findWithQuery: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('ApartmentService', () => {
  let service: ApartmentService
  let mockApartment: Apartment

  beforeEach(() => {
    service = new ApartmentService(mockRepository)
    mockApartment = Apartment.create({
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: '123 Main St',
      baseRent: 2000,
      contactPhone: '11987654321',
    })
    vi.clearAllMocks()
  })

  describe('getApartmentsWithLastPayment', () => {
    it('should return apartments with payment info', async () => {
      const apartments = [mockApartment]
      mockRepository.findAll.mockResolvedValue(apartments)

      const result = await service.getApartmentsWithLastPayment([])

      expect(mockRepository.findAll).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should handle repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'))

      await expect(service.getApartmentsWithLastPayment()).rejects.toThrow(
        'Failed to get apartments with payment info',
      )
    })
  })

  describe('getAvailableApartments', () => {
    it('should return available long-term apartments', async () => {
      const availableApartment = Apartment.create({
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        rentalType: RentalType.LONG_TERM,
        isAvailable: true,
      })
      mockRepository.findAvailable.mockResolvedValue([availableApartment])

      const result = await service.getAvailableApartments()

      expect(mockRepository.findAvailable).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should filter out Airbnb-only apartments', async () => {
      const airbnbApartment = Apartment.create({
        unitCode: 'A102',
        unitLabel: 'Apartment 102',
        address: '124 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        rentalType: RentalType.AIRBNB,
        isAvailable: true,
      })
      mockRepository.findAvailable.mockResolvedValue([airbnbApartment])

      const result = await service.getAvailableApartments()

      expect(result).toHaveLength(0)
    })
  })

  describe('getAirbnbApartments', () => {
    it('should return Airbnb apartments', async () => {
      const airbnbApartment = Apartment.create({
        unitCode: 'A102',
        unitLabel: 'Apartment 102',
        address: '124 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        rentalType: RentalType.AIRBNB,
        airbnbLink: 'https://airbnb.com/rooms/123',
      })
      mockRepository.findAirbnbApartments.mockResolvedValue([airbnbApartment])

      const result = await service.getAirbnbApartments()

      expect(mockRepository.findAirbnbApartments).toHaveBeenCalled()
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('createApartment', () => {
    const validDto: CreateApartmentDto = {
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: '123 Main St',
      baseRent: 2000,
      contactPhone: '11987654321',
      contactMethod: ContactMethod.WHATSAPP,
    }

    it('should create apartment successfully', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(null) // No existing apartment
      mockRepository.save.mockResolvedValue(mockApartment)

      const result = await service.createApartment(validDto, 'creator')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockApartment)
    })

    it('should throw error if apartment already exists', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(mockApartment)

      await expect(service.createApartment(validDto)).rejects.toThrow(ApartmentAlreadyExistsError)
    })

    it('should validate rental amount', async () => {
      const invalidDto = { ...validDto, baseRent: -100 }
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.createApartment(invalidDto)).rejects.toThrow(BusinessRuleViolationError)
    })

    it('should validate rental amount minimum', async () => {
      const invalidDto = { ...validDto, baseRent: 100 }
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.createApartment(invalidDto)).rejects.toThrow('Rental amount is too low')
    })

    it('should validate rental amount maximum', async () => {
      const invalidDto = { ...validDto, baseRent: 15000 }
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.createApartment(invalidDto)).rejects.toThrow('Rental amount is too high')
    })

    it('should validate Airbnb link', async () => {
      const invalidDto = { ...validDto, airbnbLink: 'https://invalid.com/rooms/123' }
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.createApartment(invalidDto)).rejects.toThrow(
        'Invalid Airbnb link format',
      )
    })

    it('should validate availability date', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const invalidDto = { ...validDto, isAvailable: true, availableFrom: pastDate }
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.createApartment(invalidDto)).rejects.toThrow(
        'Availability date cannot be in the past',
      )
    })

    it('should handle repository errors', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(null)
      mockRepository.save.mockRejectedValue(new Error('Database error'))

      await expect(service.createApartment(validDto)).rejects.toThrow(ApartmentCreateError)
    })
  })

  describe('updateApartment', () => {
    const updateDto: UpdateApartmentDto = {
      status: ApartmentStatus.OCCUPIED,
      baseRent: 2500,
    }

    it('should update apartment successfully', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(mockApartment)
      mockRepository.update.mockResolvedValue(mockApartment)

      const result = await service.updateApartment('A101', updateDto, 'updater')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(mockRepository.update).toHaveBeenCalledWith('A101', mockApartment)
      expect(result).toBe(mockApartment)
    })

    it('should throw error if apartment not found', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.updateApartment('A101', updateDto)).rejects.toThrow(
        ApartmentNotFoundError,
      )
    })

    it('should validate status transitions', async () => {
      const occupiedApartment = Apartment.create({
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        status: ApartmentStatus.OCCUPIED,
      })
      mockRepository.findByUnitCode.mockResolvedValue(occupiedApartment)

      const invalidDto = { status: ApartmentStatus.MAINTENANCE }

      // This should be valid transition, let's test an invalid one
      const invalidTransitionDto = { status: ApartmentStatus.RESERVED }

      await expect(service.updateApartment('A101', invalidTransitionDto)).rejects.toThrow(
        InvalidApartmentStatusTransitionError,
      )
    })

    it('should handle repository errors', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(mockApartment)
      mockRepository.update.mockRejectedValue(new Error('Database error'))

      await expect(service.updateApartment('A101', updateDto)).rejects.toThrow(ApartmentUpdateError)
    })
  })

  describe('deactivateApartment', () => {
    it('should deactivate apartment successfully', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(mockApartment)
      mockRepository.update.mockResolvedValue(mockApartment)

      await service.deactivateApartment('A101', 'deactivator')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(mockRepository.update).toHaveBeenCalledWith('A101', mockApartment)
      expect(mockApartment.statusValue).toBe(ApartmentStatus.INACTIVE)
    })

    it('should throw error if apartment not found', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(null)

      await expect(service.deactivateApartment('A101')).rejects.toThrow(
        'Apartment with unit code A101 not found',
      )
    })
  })

  describe('getApartmentByUnitCode', () => {
    it('should return apartment if found', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(mockApartment)

      const result = await service.getApartmentByUnitCode('A101')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(result).toBe(mockApartment)
    })

    it('should return null if not found', async () => {
      mockRepository.findByUnitCode.mockResolvedValue(null)

      const result = await service.getApartmentByUnitCode('A101')

      expect(result).toBeNull()
    })
  })

  describe('getApartmentsByStatus', () => {
    it('should return apartments by status', async () => {
      const apartments = [mockApartment]
      mockRepository.findByStatus.mockResolvedValue(apartments)

      const result = await service.getApartmentsByStatus(ApartmentStatus.AVAILABLE)

      expect(mockRepository.findByStatus).toHaveBeenCalledWith(ApartmentStatus.AVAILABLE)
      expect(result).toBe(apartments)
    })
  })

  describe('getApartmentsByRentalType', () => {
    it('should return apartments by rental type', async () => {
      const apartments = [mockApartment]
      mockRepository.findByRentalType.mockResolvedValue(apartments)

      const result = await service.getApartmentsByRentalType(RentalType.LONG_TERM)

      expect(mockRepository.findByRentalType).toHaveBeenCalledWith(RentalType.LONG_TERM)
      expect(result).toBe(apartments)
    })
  })

  describe('business rule validations', () => {
    beforeEach(() => {
      mockRepository.findByUnitCode.mockResolvedValue(null)
    })

    it('should validate invalid Airbnb link format', async () => {
      const dto = {
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        airbnbLink: 'invalid-url',
      }

      await expect(service.createApartment(dto)).rejects.toThrow('Invalid Airbnb link format')
    })

    it('should validate availability date too far in future', async () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 2)

      const dto = {
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 2000,
        contactPhone: '11987654321',
        isAvailable: true,
        availableFrom: futureDate,
      }

      await expect(service.createApartment(dto)).rejects.toThrow(
        'Availability date cannot be more than 1 year in the future',
      )
    })
  })
})

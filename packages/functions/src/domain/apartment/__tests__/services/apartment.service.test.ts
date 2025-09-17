import { describe, it, expect, vi, beforeEach } from 'vitest'
import ApartmentService from '../../services/apartment.service'
import { IApartmentRepository } from '../../repositories/apartment.repository'
import { Apartment } from '../../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'
import { DomainError } from '../../../shared'

describe('ApartmentService', () => {
  let apartmentService: ApartmentService
  let mockRepository: IApartmentRepository

  const mockApartment = Apartment.create({
    unitCode: 'A101',
    unitLabel: 'Apartment 101',
    address: '123 Main St',
    baseRent: 1500,
    contactPhone: '+5511999999999',
    status: ApartmentStatus.AVAILABLE,
    isAvailable: true,
  })

  beforeEach(() => {
    mockRepository = {
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

    apartmentService = new ApartmentService(mockRepository)
  })

  describe('getAvailableApartments', () => {
    it('should return available apartments for long term rental', async () => {
      const availableApartments = [mockApartment]
      vi.mocked(mockRepository.findAvailable).mockResolvedValue(availableApartments)

      const result = await apartmentService.getAvailableApartments()

      expect(mockRepository.findAvailable).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0].apartment).toBe(mockApartment)
      expect(result[0].isAvailable).toBe(true)
      expect(result[0].priceRange.min).toBe(1500)
      expect(result[0].priceRange.max).toBe(1500)
    })

    it('should filter out Airbnb-only apartments', async () => {
      const airbnbApartment = Apartment.create({
        unitCode: 'A102',
        unitLabel: 'Apartment 102',
        address: '124 Main St',
        baseRent: 2000,
        contactPhone: '+5511999999999',
        rentalType: RentalType.AIRBNB,
        isAvailable: true,
      })

      const availableApartments = [mockApartment, airbnbApartment]
      vi.mocked(mockRepository.findAvailable).mockResolvedValue(availableApartments)

      const result = await apartmentService.getAvailableApartments()

      expect(result).toHaveLength(1)
      expect(result[0].apartment.unitCodeValue).toBe('A101')
    })
  })

  describe('getAirbnbApartments', () => {
    it('should return Airbnb apartments', async () => {
      const airbnbApartment = Apartment.create({
        unitCode: 'A102',
        unitLabel: 'Apartment 102',
        address: '124 Main St',
        baseRent: 2000,
        contactPhone: '+5511999999999',
        rentalType: RentalType.AIRBNB,
        airbnbLink: 'https://airbnb.com/rooms/123',
        isAvailable: true,
      })

      vi.mocked(mockRepository.findAirbnbApartments).mockResolvedValue([airbnbApartment])

      const result = await apartmentService.getAirbnbApartments()

      expect(mockRepository.findAirbnbApartments).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0].apartment).toBe(airbnbApartment)
      expect(result[0].airbnbLink).toBe('https://airbnb.com/rooms/123')
    })
  })

  describe('createApartment', () => {
    it('should create a new apartment', async () => {
      const createDto = {
        unitCode: 'A103',
        unitLabel: 'Apartment 103',
        address: '125 Main St',
        baseRent: 1800,
        contactPhone: '+5511999999999',
      }

      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(null)
      vi.mocked(mockRepository.save).mockResolvedValue(mockApartment)

      const result = await apartmentService.createApartment(createDto, 'admin')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A103')
      expect(mockRepository.save).toHaveBeenCalled()
      expect(result).toBe(mockApartment)
    })

    it('should throw error if apartment already exists', async () => {
      const createDto = {
        unitCode: 'A101',
        unitLabel: 'Apartment 101',
        address: '123 Main St',
        baseRent: 1500,
        contactPhone: '+5511999999999',
      }

      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(mockApartment)

      await expect(apartmentService.createApartment(createDto, 'admin')).rejects.toThrow(
        DomainError,
      )
    })
  })

  describe('getApartmentDetails', () => {
    it('should return apartment details', async () => {
      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(mockApartment)

      const result = await apartmentService.getApartmentDetails('A101')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(result.apartment).toBe(mockApartment)
      expect(result.users).toEqual([])
      expect(result.contractHistory).toEqual([])
    })

    it('should throw error if apartment not found', async () => {
      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(null)

      await expect(apartmentService.getApartmentDetails('A999')).rejects.toThrow(DomainError)
    })
  })

  describe('updateApartment', () => {
    it('should update apartment status', async () => {
      const updateDto = {
        status: ApartmentStatus.OCCUPIED,
      }

      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(mockApartment)
      vi.mocked(mockRepository.update).mockResolvedValue(mockApartment)

      const result = await apartmentService.updateApartment('A101', updateDto, 'admin')

      expect(mockRepository.findByUnitCode).toHaveBeenCalledWith('A101')
      expect(mockRepository.update).toHaveBeenCalledWith('A101', mockApartment)
      expect(result).toBe(mockApartment)
    })

    it('should throw error if apartment not found', async () => {
      const updateDto = {
        status: ApartmentStatus.OCCUPIED,
      }

      vi.mocked(mockRepository.findByUnitCode).mockResolvedValue(null)

      await expect(apartmentService.updateApartment('A999', updateDto, 'admin')).rejects.toThrow(
        DomainError,
      )
    })
  })
})

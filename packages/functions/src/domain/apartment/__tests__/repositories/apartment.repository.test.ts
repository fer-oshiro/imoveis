import { vi } from 'vitest'

// Mock SST Resource BEFORE importing anything else
vi.mock('sst', () => ({
  Resource: {
    table: {
      name: 'test-table',
    },
  },
}))

// Mock the database module
vi.mock('../../../../infra/database', () => ({
  docClient: {
    send: vi.fn(),
  },
}))

import ApartmentRepository, { IApartmentRepository } from '../../repositories/apartment.repository'
import { Apartment } from '../../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../../vo/apartment-enums.vo'
import { DomainError } from '../../../shared'
import { docClient } from '../../../../infra/database'

// Get the mocked docClient with proper typing
// @ts-ignore - Mock typing issue
const mockDocClient = vi.mocked(docClient)

describe('ApartmentRepository', () => {
  let repository: IApartmentRepository
  let mockApartment: Apartment

  beforeEach(() => {
    repository = ApartmentRepository.getInstance()
    mockApartment = Apartment.create({
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: '123 Main St',
      baseRent: 2000,
      contactPhone: '11987654321',
    })
    vi.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return all apartments', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const result = await repository.findAll()

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
            ExpressionAttributeValues: {
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
            },
          }),
        }),
      )
      expect(result).toHaveLength(1)
      expect(result[0].unitCodeValue).toBe('A101')
    })

    it('should return empty array when no items found', async () => {
      mockDocClient.send.mockResolvedValue({ Items: [] })

      const result = await repository.findAll()

      expect(result).toEqual([])
    })

    it('should handle undefined Items', async () => {
      mockDocClient.send.mockResolvedValue({})

      const result = await repository.findAll()

      expect(result).toEqual([])
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.findAll()).rejects.toThrow(DomainError)
      await expect(repository.findAll()).rejects.toThrow('Failed to find apartments')
    })
  })

  describe('findByUnitCode', () => {
    it('should return apartment when found', async () => {
      mockDocClient.send.mockResolvedValue({ Item: mockApartment.toJSON() })

      const result = await repository.findByUnitCode('A101')

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            Key: {
              PK: 'APARTMENT#A101',
              SK: 'METADATA',
            },
          }),
        }),
      )
      expect(result).not.toBeNull()
      expect(result?.unitCodeValue).toBe('A101')
    })

    it('should return null when not found', async () => {
      mockDocClient.send.mockResolvedValue({})

      const result = await repository.findByUnitCode('A999')

      expect(result).toBeNull()
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.findByUnitCode('A101')).rejects.toThrow(DomainError)
      await expect(repository.findByUnitCode('A101')).rejects.toThrow(
        'Failed to find apartment by unit code',
      )
    })
  })

  describe('findByStatus', () => {
    it('should return apartments with specific status', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const result = await repository.findByStatus(ApartmentStatus.AVAILABLE)

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND #status = :status',
            ExpressionAttributeNames: {
              '#status': 'status',
            },
            ExpressionAttributeValues: {
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
              ':status': ApartmentStatus.AVAILABLE,
            },
          }),
        }),
      )
      expect(result).toHaveLength(1)
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.findByStatus(ApartmentStatus.AVAILABLE)).rejects.toThrow(DomainError)
    })
  })

  describe('findByRentalType', () => {
    it('should return apartments with specific rental type', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const result = await repository.findByRentalType(RentalType.LONG_TERM)

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression:
              'begins_with(PK, :pk) AND SK = :sk AND (rentalType = :rentalType OR rentalType = :both)',
            ExpressionAttributeValues: {
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
              ':rentalType': RentalType.LONG_TERM,
              ':both': RentalType.BOTH,
            },
          }),
        }),
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('findAvailable', () => {
    it('should return available apartments', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const result = await repository.findAvailable()

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND isAvailable = :available',
            ExpressionAttributeValues: {
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
              ':available': true,
            },
          }),
        }),
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('findAirbnbApartments', () => {
    it('should return Airbnb apartments', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const result = await repository.findAirbnbApartments()

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression:
              'begins_with(PK, :pk) AND SK = :sk AND (rentalType = :airbnb OR rentalType = :both) AND attribute_exists(airbnbLink)',
            ExpressionAttributeValues: {
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
              ':airbnb': RentalType.AIRBNB,
              ':both': RentalType.BOTH,
            },
          }),
        }),
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('findWithQuery', () => {
    it('should query apartments with filters', async () => {
      const mockItems = [mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const query = {
        status: ApartmentStatus.AVAILABLE,
        rentalType: RentalType.LONG_TERM,
        isAvailable: true,
        minRent: 1000,
        maxRent: 3000,
        limit: 10,
        sortBy: 'unitCode' as const,
        sortOrder: 'asc' as const,
        offset: 0,
      }

      const result = await repository.findWithQuery(query)

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            FilterExpression: expect.stringContaining('begins_with(PK, :pk) AND SK = :sk'),
            ExpressionAttributeValues: expect.objectContaining({
              ':pk': 'APARTMENT#',
              ':sk': 'METADATA',
              ':status': ApartmentStatus.AVAILABLE,
              ':rentalType': RentalType.LONG_TERM,
              ':both': RentalType.BOTH,
              ':available': true,
              ':minRent': 1000,
              ':maxRent': 3000,
            }),
            Limit: 10,
          }),
        }),
      )
      expect(result).toHaveLength(1)
    })

    it('should handle sorting by different fields', async () => {
      const mockItems = [
        { ...mockApartment.toJSON(), unitCode: 'A102', baseRent: 1500 },
        { ...mockApartment.toJSON(), unitCode: 'A101', baseRent: 2000 },
      ]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const query = { sortBy: 'baseRent' as const, sortOrder: 'desc' as const }
      const result = await repository.findWithQuery(query)

      expect(result[0].baseRentValue).toBe(2000)
      expect(result[1].baseRentValue).toBe(1500)
    })

    it('should handle offset', async () => {
      const mockItems = [mockApartment.toJSON(), mockApartment.toJSON()]
      mockDocClient.send.mockResolvedValue({ Items: mockItems })

      const query = { offset: 1 }
      const result = await repository.findWithQuery(query)

      expect(result).toHaveLength(1)
    })
  })

  describe('save', () => {
    it('should save apartment successfully', async () => {
      mockDocClient.send.mockResolvedValue({})

      const result = await repository.save(mockApartment)

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            Item: mockApartment.toJSON(),
          }),
        }),
      )
      expect(result).toBe(mockApartment)
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.save(mockApartment)).rejects.toThrow(DomainError)
      await expect(repository.save(mockApartment)).rejects.toThrow('Failed to save apartment')
    })
  })

  describe('update', () => {
    it('should update apartment successfully', async () => {
      mockDocClient.send.mockResolvedValue({})

      const result = await repository.update('A101', mockApartment)

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            Item: mockApartment.toJSON(),
            ConditionExpression: 'attribute_exists(PK)',
          }),
        }),
      )
      expect(result).toBe(mockApartment)
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.update('A101', mockApartment)).rejects.toThrow(DomainError)
      await expect(repository.update('A101', mockApartment)).rejects.toThrow(
        'Failed to update apartment',
      )
    })
  })

  describe('delete', () => {
    it('should delete apartment successfully', async () => {
      mockDocClient.send.mockResolvedValue({})

      await repository.delete('A101')

      expect(mockDocClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: 'test-table',
            Key: {
              PK: 'APARTMENT#A101',
              SK: 'METADATA',
            },
          }),
        }),
      )
    })

    it('should throw DomainError on database error', async () => {
      mockDocClient.send.mockRejectedValue(new Error('Database error'))

      await expect(repository.delete('A101')).rejects.toThrow(DomainError)
      await expect(repository.delete('A101')).rejects.toThrow('Failed to delete apartment')
    })
  })

  describe('singleton pattern', () => {
    it('should return same instance', () => {
      const instance1 = ApartmentRepository.getInstance()
      const instance2 = ApartmentRepository.getInstance()

      expect(instance1).toBe(instance2)
    })
  })
})

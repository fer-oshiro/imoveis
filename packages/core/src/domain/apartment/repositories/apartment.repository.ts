import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'

import { docClient } from '../../../infra/database'
import { logger } from '../../../infra/logger'
import { DomainError } from '../../shared'
import { type ApartmentQueryDto } from '../dto'
import { Apartment } from '../entities/apartment.entity'
import { ApartmentStatus, RentalType } from '../vo/apartment-enums.vo'

const TABLE_NAME = Resource.table.name || 'imovel-oshiro-table'

export interface IApartmentRepository {
  findAll(): Promise<Apartment[]>
  findByUnitCode(unitCode: string): Promise<Apartment | null>
  findUserByDocAndName(doc: string, name: string): Promise<Apartment | null>
  findUserByDoc(doc: string): Promise<Apartment | null>
  findByStatus(status: ApartmentStatus): Promise<Apartment[]>
  findByRentalType(rentalType: RentalType): Promise<Apartment[]>
  findAvailable(): Promise<Apartment[]>
  findAirbnbApartments(): Promise<Apartment[]>
  findWithQuery(query: ApartmentQueryDto): Promise<Apartment[]>
  save(apartment: Apartment): Promise<Apartment>
  update(unitCode: string, apartment: Apartment): Promise<Apartment>
  delete(unitCode: string): Promise<void>
}

export class ApartmentRepository implements IApartmentRepository {
  private static instance: ApartmentRepository

  private constructor() {}

  public static getInstance(): ApartmentRepository {
    if (!ApartmentRepository.instance) {
      ApartmentRepository.instance = new ApartmentRepository()
    }
    return ApartmentRepository.instance
  }

  public async findAll(): Promise<Apartment[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :pk) AND SK = :sk',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
          },
        }),
      )
      return response.Items?.map((item) => Apartment.fromJSON(item)) || []
    } catch (error) {
      throw new DomainError('Failed to find apartments', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findByUnitCode(unitCode: string): Promise<Apartment | null> {
    try {
      const response = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `APARTMENT#${unitCode}`,
            SK: 'METADATA',
          },
        }),
      )

      return response.Item ? Apartment.fromJSON(response.Item) : null
    } catch (error) {
      console.error('Error in findByUnitCode:', error)
      throw new DomainError('Failed to find apartment by unit code', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findUserByDocAndName(doc: string, name: string): Promise<any | null> {
    try {
      console.log('Finding user by doc and name:', { doc, name }) // Debug log
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression:
            'begins_with(PK, :pk) AND SK = :sk AND contactDocument = :doc AND begins_with(contactName, :name)',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':doc': doc,
            ':name': name,
          },
        }),
      )

      return response.Items && response.Items.length > 0
        ? Apartment.fromJSON(response.Items[0])
        : null
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to find user by doc and name', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findUserByDoc(doc: string): Promise<any | null> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND contactDocument = :doc',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':doc': doc,
          },
        }),
      )

      return response.Items && response.Items.length > 0
        ? Apartment.fromJSON(response.Items[0])
        : null
    } catch (error) {
      logger.error(error)
      throw new DomainError('Failed to find user by doc', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findByStatus(status: ApartmentStatus): Promise<Apartment[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status',
          },
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':status': status,
          },
        }),
      )

      return response.Items?.map((item) => Apartment.fromJSON(item)) || []
    } catch (error) {
      console.error('Error in findByStatus:', error)
      throw new DomainError('Failed to find apartments by status', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findByRentalType(rentalType: RentalType): Promise<Apartment[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression:
            'begins_with(PK, :pk) AND SK = :sk AND (rentalType = :rentalType OR rentalType = :both)',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':rentalType': rentalType,
            ':both': RentalType.BOTH,
          },
        }),
      )

      return response.Items?.map((item) => Apartment.fromJSON(item)) || []
    } catch (error) {
      console.error('Error in findByRentalType:', error)
      throw new DomainError(
        'Failed to find apartments by rental type',
        'APARTMENT_REPOSITORY_ERROR',
      )
    }
  }

  public async findAvailable(): Promise<Apartment[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'begins_with(PK, :pk) AND SK = :sk AND isAvailable = :available',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':available': true,
          },
        }),
      )

      return response.Items?.map((item) => Apartment.fromJSON(item)) || []
    } catch (error) {
      console.error('Error in findAvailable:', error)
      throw new DomainError('Failed to find available apartments', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findAirbnbApartments(): Promise<Apartment[]> {
    try {
      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression:
            'begins_with(PK, :pk) AND SK = :sk AND (rentalType = :airbnb OR rentalType = :both) AND attribute_exists(airbnbLink)',
          ExpressionAttributeValues: {
            ':pk': 'APARTMENT#',
            ':sk': 'METADATA',
            ':airbnb': RentalType.AIRBNB,
            ':both': RentalType.BOTH,
          },
        }),
      )

      return response.Items?.map((item) => Apartment.fromJSON(item)) || []
    } catch (error) {
      console.error('Error in findAirbnbApartments:', error)
      throw new DomainError('Failed to find Airbnb apartments', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async findWithQuery(query: ApartmentQueryDto): Promise<Apartment[]> {
    try {
      let filterExpression = 'begins_with(PK, :pk) AND SK = :sk'
      const expressionAttributeValues: Record<string, any> = {
        ':pk': 'APARTMENT#',
        ':sk': 'METADATA',
      }
      const expressionAttributeNames: Record<string, string> = {}

      if (query.status) {
        filterExpression += ' AND #status = :status'
        expressionAttributeNames['#status'] = 'status'
        expressionAttributeValues[':status'] = query.status
      }

      if (query.rentalType) {
        filterExpression += ' AND (rentalType = :rentalType OR rentalType = :both)'
        expressionAttributeValues[':rentalType'] = query.rentalType
        expressionAttributeValues[':both'] = RentalType.BOTH
      }

      if (query.isAvailable !== undefined) {
        filterExpression += ' AND isAvailable = :available'
        expressionAttributeValues[':available'] = query.isAvailable
      }

      if (query.minRent !== undefined) {
        filterExpression += ' AND baseRent >= :minRent'
        expressionAttributeValues[':minRent'] = query.minRent
      }

      if (query.maxRent !== undefined) {
        filterExpression += ' AND baseRent <= :maxRent'
        expressionAttributeValues[':maxRent'] = query.maxRent
      }

      const response = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: filterExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ...(Object.keys(expressionAttributeNames).length > 0 && {
            ExpressionAttributeNames: expressionAttributeNames,
          }),
          ...(query.limit && { Limit: query.limit }),
        }),
      )

      let apartments = response.Items?.map((item) => Apartment.fromJSON(item)) || []

      // Apply sorting
      if (query.sortBy) {
        apartments.sort((a, b) => {
          let aValue: any
          let bValue: any

          switch (query.sortBy) {
            case 'unitCode':
              aValue = a.unitCodeValue
              bValue = b.unitCodeValue
              break
            case 'baseRent':
              aValue = a.baseRentValue
              bValue = b.baseRentValue
              break
            case 'createdAt':
              aValue = a.metadataValue.createdAt
              bValue = b.metadataValue.createdAt
              break
            case 'updatedAt':
              aValue = a.metadataValue.updatedAt
              bValue = b.metadataValue.updatedAt
              break
            default:
              return 0
          }

          if (query.sortOrder === 'desc') {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          } else {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          }
        })
      }

      // Apply offset
      if (query.offset) {
        apartments = apartments.slice(query.offset)
      }

      return apartments
    } catch (error) {
      console.error('Error in findWithQuery:', error)
      throw new DomainError('Failed to query apartments', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async save(apartment: Apartment): Promise<Apartment> {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: omitUndefined(apartment.toJSON()),
        }),
      )

      return apartment
    } catch (error) {
      console.error('Error in save:', error)
      throw new DomainError('Failed to save apartment', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async update(_unitCode: string, apartment: Apartment): Promise<Apartment> {
    try {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: apartment.toJSON(),
          ConditionExpression: 'attribute_exists(PK)',
        }),
      )

      return apartment
    } catch (error) {
      console.error('Error in update:', error)
      throw new DomainError('Failed to update apartment', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  public async delete(unitCode: string): Promise<void> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `APARTMENT#${unitCode}`,
            SK: 'METADATA',
          },
        }),
      )
    } catch (error) {
      console.error('Error in delete:', error)
      throw new DomainError('Failed to delete apartment', 'APARTMENT_REPOSITORY_ERROR')
    }
  }

  // Legacy method for backward compatibility
  public async getApartments(): Promise<Apartment[]> {
    return this.findAll()
  }

  // Legacy method for backward compatibility
  public async createApartment(apartment: Apartment): Promise<Apartment> {
    return this.save(apartment)
  }
}

function omitUndefined<T extends Record<string, any>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>
}

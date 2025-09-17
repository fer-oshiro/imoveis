import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { BaseRepository, PhoneNumberVO } from '../../shared'
import { DatabaseError, EntityNotFoundError } from '../../shared/errors/domain-error'
import { User, UserStatus } from '../entities/user.entity'
import { IUserRepository } from './user-repository.interface'

export class UserRepository extends BaseRepository<User, string> implements IUserRepository {
  constructor(tableName: string, dynamoClient: DynamoDBDocumentClient) {
    super(tableName, dynamoClient)
  }

  async findById(phoneNumber: string): Promise<User | null> {
    return this.findByPhoneNumber(phoneNumber)
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      const phoneNumberVO = PhoneNumberVO.create(phoneNumber)
      const pk = `USER#${phoneNumberVO.value}`
      const sk = 'PROFILE'

      const command = new GetCommand({
        TableName: this.tableName,
        Key: { pk, sk },
      })

      const result = await this.dynamoClient.send(command)

      if (!result.Item) {
        return null
      }

      return this.mapToEntity(result.Item)
    } catch (error) {
      if (error instanceof Error && error.name !== 'ValidationError') {
        throw new DatabaseError(`Failed to find user by phone number: ${error.message}`, error)
      }
      throw error
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(pk, :userPrefix) AND sk = :sk',
        ExpressionAttributeValues: {
          ':userPrefix': 'USER#',
          ':sk': 'PROFILE',
        },
      })

      const result = await this.dynamoClient.send(command)

      if (!result.Items) {
        return []
      }

      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new DatabaseError(
        `Failed to find all users: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async findBy(criteria: Record<string, any>): Promise<User[]> {
    try {
      let filterExpression = 'begins_with(pk, :userPrefix) AND sk = :sk'
      const expressionAttributeValues: Record<string, any> = {
        ':userPrefix': 'USER#',
        ':sk': 'PROFILE',
      }

      if (criteria.status) {
        filterExpression += ' AND #status = :status'
        expressionAttributeValues[':status'] = criteria.status
      }

      if (criteria.name) {
        filterExpression += ' AND contains(#name, :name)'
        expressionAttributeValues[':name'] = criteria.name
      }

      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: {
          '#status': 'status',
          '#name': 'name',
        },
      })

      const result = await this.dynamoClient.send(command)

      if (!result.Items) {
        return []
      }

      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new DatabaseError(
        `Failed to find users by criteria: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    return this.findBy({ status })
  }

  async findByApartment(unitCode: string): Promise<User[]> {
    try {
      // Query for user-apartment relationships
      const command = new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `APARTMENT#${unitCode}`,
          ':skPrefix': 'USER#',
        },
      })

      const result = await this.dynamoClient.send(command)

      if (!result.Items) {
        return []
      }

      // Extract phone numbers from the relationships and fetch user details
      const phoneNumbers = result.Items.map(
        (item) => item.sk.replace('USER#', '').split('#')[0],
      ).filter((phone, index, arr) => arr.indexOf(phone) === index) // Remove duplicates

      const users: User[] = []
      for (const phoneNumber of phoneNumbers) {
        const user = await this.findByPhoneNumber(phoneNumber)
        if (user) {
          users.push(user)
        }
      }

      return users
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new DatabaseError(
        `Failed to find users by apartment: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async existsByPhoneNumber(phoneNumber: string): Promise<boolean> {
    const user = await this.findByPhoneNumber(phoneNumber)
    return user !== null
  }

  async existsByDocument(document: string): Promise<boolean> {
    try {
      const normalizedDocument = document.replace(/\D/g, '')
      const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression:
          'begins_with(pk, :userPrefix) AND sk = :sk AND (#document = :document OR cpf = :document)',
        ExpressionAttributeValues: {
          ':userPrefix': 'USER#',
          ':sk': 'PROFILE',
          ':document': normalizedDocument,
        },
        ExpressionAttributeNames: {
          '#document': 'document',
        },
      })

      const result = await this.dynamoClient.send(command)
      return (result.Items?.length || 0) > 0
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new DatabaseError(
        `Failed to check document existence: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  // Keep for backward compatibility
  async existsByCpf(cpf: string): Promise<boolean> {
    return this.existsByDocument(cpf)
  }

  async save(user: User): Promise<User> {
    try {
      const item = this.mapFromEntity(user)

      const command = new PutCommand({
        TableName: this.tableName,
        Item: item,
      })

      await this.dynamoClient.send(command)
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new DatabaseError(
        `Failed to save user: ${errorMessage}`,
        error instanceof Error ? error : undefined,
      )
    }
  }

  async delete(phoneNumber: string): Promise<void> {
    try {
      const phoneNumberVO = PhoneNumberVO.create(phoneNumber)
      const pk = `USER#${phoneNumberVO.value}`
      const sk = 'PROFILE'

      const command = new DeleteCommand({
        TableName: this.tableName,
        Key: { pk, sk },
      })

      await this.dynamoClient.send(command)
    } catch (error) {
      if (error instanceof Error && error.name !== 'ValidationError') {
        throw new DatabaseError(`Failed to delete user: ${error.message}`, error)
      }
      throw error
    }
  }

  protected mapToEntity(item: Record<string, any>): User {
    return User.fromDynamoItem(item)
  }

  protected mapFromEntity(user: User): Record<string, any> {
    return user.toDynamoItem()
  }
}

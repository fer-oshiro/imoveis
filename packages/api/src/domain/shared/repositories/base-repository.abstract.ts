import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { IBaseRepository } from '../interfaces/base-repository.interface'

export abstract class BaseRepository<T, K> implements IBaseRepository<T, K> {
  protected readonly tableName: string
  protected readonly dynamoClient: DynamoDBDocumentClient

  constructor(tableName: string, dynamoClient: DynamoDBDocumentClient) {
    this.tableName = tableName
    this.dynamoClient = dynamoClient
  }

  abstract findById(id: K): Promise<T | null>
  abstract save(entity: T): Promise<T>
  abstract delete(id: K): Promise<void>

  protected abstract mapToEntity(item: Record<string, any>): T
  protected abstract mapFromEntity(entity: T): Record<string, any>
}

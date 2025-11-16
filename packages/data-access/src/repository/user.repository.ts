import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { User } from '@imovel/core/domain/user'
import { UserRepository } from '@imovel/core/ports'

import { logger } from '../../../../apps/api/src/infra/logger'
import { docClient, TABLE_NAME } from '../dynamo-client'
import { mapDynamoToUser, mapUserToDynamo } from '../mapper'

export class UserRepositoryDynamo implements UserRepository {
  private dbClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.dbClient = docClient
    this.tableName = TABLE_NAME
  }

  async findAll(): Promise<User[]> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: {
          ':sk': 'PROFILE',
        },
      }),
    )

    if (!result.Items) return []

    return result.Items.map((item) => mapDynamoToUser(item))
  }

  async findManyByIds(ids: string[]): Promise<User[]> {
    const keys = ids.map((id) => ({ PK: `USER#${id}`, SK: 'PROFILE' }))
    const result = await this.dbClient.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: keys,
          },
        },
      }),
    )

    if (!result.Responses || !result.Responses[this.tableName]) return []

    return result.Responses[this.tableName].map((item) => mapDynamoToUser(item))
  }

  async findById(id: string): Promise<User | null> {
    logger.info({ userId: id, message: 'Find user by ID called' })
    throw new Error('Method not implemented.')
  }

  async findByDocument(document: string, name: string): Promise<User | null> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: '#document = :document AND #sk = :sk AND begins_with(#name, :name)',
        ExpressionAttributeValues: {
          ':document': document,
          ':sk': 'PROFILE',
          ':name': name,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
          '#document': 'document',
          '#sk': 'SK',
        },
      }),
    )

    if (!result.Items || result.Items.length === 0) return null

    return mapDynamoToUser(result.Items[0])
  }

  async save(user: User): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: mapUserToDynamo(user),
      }),
    )
  }

  delete(user: User): Promise<void> {
    logger.info({ userId: user.id, message: 'Delete user called' })
    throw new Error('Method not implemented.')
  }
}

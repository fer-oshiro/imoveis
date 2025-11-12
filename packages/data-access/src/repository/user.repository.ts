import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
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

  findById(id: string): Promise<User | null> {
    logger.info({ userId: id, message: 'Find user by ID called' })
    throw new Error('Method not implemented.')
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

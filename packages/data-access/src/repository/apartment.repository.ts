import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { Apartment } from '@imovel/core/domain/apartment'
import { ApartmentRepository } from '@imovel/core/ports'

import { docClient, TABLE_NAME } from '../dynamo-client'
import { mapDynamoToApartment } from '../mapper'

export class ApartmentRepositoryDynamo implements ApartmentRepository {
  private dbClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.dbClient = docClient
    this.tableName = TABLE_NAME
  }

  async findById(id: string): Promise<Apartment | null> {
    const result = await this.dbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `APARTMENT#${id}`, SK: `METADATA` },
      }),
    )

    if (!result.Item) return null
    return mapDynamoToApartment(result.Item)
  }

  async findAll(): Promise<Apartment[]> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: {
          ':sk': 'METADATA',
        },
      }),
    )

    if (!result.Items) return []

    return result.Items.map((item) => mapDynamoToApartment(item))
  }

  async save(apartment: Apartment): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `APARTMENT#${apartment.id}`,
          SK: `METADATA`,
          ...apartment.toJSON(),
        },
      }),
    )
  }

  async delete(apartment: Apartment): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `APARTMENT#${apartment.id}`,
          SK: `METADATA`,
          ...apartment.toJSON(),
          metadata: { ...apartment.metadata, deletedAt: new Date().toISOString() },
        },
      }),
    )
  }
}

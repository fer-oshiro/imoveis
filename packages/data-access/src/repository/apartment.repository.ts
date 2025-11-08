import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { Apartment } from '@imovel/core/domain/apartment'
import { ApartmentRepository } from '@imovel/core/ports'

export class ApartmentRepositoryDynamo implements ApartmentRepository {
  constructor(
    private readonly dbClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async findById(id: string): Promise<Apartment | null> {
    const result = await this.dbClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `APARTMENT#${id}`, SK: `METADATA` },
      }),
    )

    if (!result.Item) return null
    return Apartment.create({
      id: result.Item.id,
      rentAmount: result.Item.rentAmount,
      status: result.Item.status,
      location: result.Item.location,
      description: result.Item.description,
      images: result.Item.images,
      airbnbLink: result.Item.airbnbLink,
      isOccupied: result.Item.isOccupied,
      cleanCost: result.Item.cleanCost,
      metadata: result.Item.metadata,
    })
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

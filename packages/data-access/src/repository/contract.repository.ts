import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { Contract } from '@imovel/core/domain/contract'
import { ContractRepository } from '@imovel/core/ports'

import { docClient, TABLE_NAME } from '../dynamo-client'
import { mapContractToDynamo, mapDynamoToContract } from '../mapper/contract.mapper'

export class ContractRepositoryDynamo implements ContractRepository {
  private dbClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.dbClient = docClient
    this.tableName = TABLE_NAME
  }

  async findAll(): Promise<Contract[]> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':sk': 'CONTRACT#',
        },
      }),
    )

    if (!result.Items) return []

    return result.Items.map((item) => mapDynamoToContract(item))
  }

  async findById(id: string): Promise<Contract | null> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: {
          ':sk': `CONTRACT#${id}`,
        },
      }),
    )

    return result.Items && result.Items.length > 0 ? mapDynamoToContract(result.Items[0]) : null
  }

  async save(contract: Contract): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: mapContractToDynamo(contract),
      }),
    )
  }

  async delete(contract: Contract): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { ...mapContractToDynamo(contract), valid: false },
      }),
    )
  }
}

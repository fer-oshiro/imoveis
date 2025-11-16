import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { ChargeEntry, InvoiceEntry, LedgerEntry } from '@imovel/core/domain/ledger-entry'
import { PaymentRepository } from '@imovel/core/ports'

import { docClient, TABLE_NAME } from '../dynamo-client'
import { mapDynamoToPayment, mapPaymentToDynamo } from '../mapper/payment.mapper'

export class PaymentRepositoryDynamo implements PaymentRepository {
  private dbClient: DynamoDBDocumentClient
  private tableName: string

  constructor() {
    this.dbClient = docClient
    this.tableName = TABLE_NAME
  }

  async findAll(): Promise<any[]> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':sk': 'PAYMENT#',
        },
      }),
    )

    if (!result.Items) return []

    return result.Items
  }

  async findById(id: string): Promise<LedgerEntry | null> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'SK = :sk',
        ExpressionAttributeValues: {
          ':sk': `CONTRACT#${id}`,
        },
      }),
    )

    return result.Items && result.Items.length > 0 ? mapDynamoToPayment(result.Items[0]) : null
  }

  async findByContractId(contractId: string): Promise<LedgerEntry[]> {
    const result = await this.dbClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'contractId = :contractId',
        ExpressionAttributeValues: {
          ':contractId': contractId,
        },
      }),
    )

    if (!result.Items) return []

    return result.Items.map((item) => mapDynamoToPayment(item))
  }

  async save(payment: LedgerEntry): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: mapPaymentToDynamo(payment),
      }),
    )
  }

  async delete(contract: ChargeEntry | InvoiceEntry): Promise<void> {
    await this.dbClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: { ...mapPaymentToDynamo(contract), valid: false },
      }),
    )
  }
}

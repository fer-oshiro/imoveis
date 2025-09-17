import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'

import { docClient } from '../../../infra/database'

export default class PaymentRepository {
  private static instance: PaymentRepository

  private constructor() {}

  public static getInstance(): PaymentRepository {
    if (!PaymentRepository.instance) {
      PaymentRepository.instance = new PaymentRepository()
    }
    return PaymentRepository.instance
  }

  public async getLastPayments(pk: string): Promise<any> {
    const response = await docClient.send(
      new QueryCommand({
        TableName: Resource.table.name,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': pk,
          ':skPrefix': 'COMPROVANTE#',
        },
        ScanIndexForward: false,
        Limit: 1,
      }),
    )
    if (response.Items && response.Items.length > 0) {
      return response.Items[0]
    }
    return null
  }
}

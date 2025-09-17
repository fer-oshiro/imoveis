import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { BaseRepository, IBaseRepository } from '../../shared'
import { Payment } from '../entities/payment.entity'
import { PaymentStatus, PaymentType } from '../vo/payment-enums.vo'

export interface IPaymentRepository extends IBaseRepository<Payment, string> {
  findByApartment(apartmentUnitCode: string): Promise<Payment[]>
  findByUser(userPhoneNumber: string): Promise<Payment[]>
  findLastByApartment(apartmentUnitCode: string): Promise<Payment | null>
  findByStatus(status: PaymentStatus): Promise<Payment[]>
  findByContract(contractId: string): Promise<Payment[]>
  findOverduePayments(): Promise<Payment[]>
  findPendingPayments(): Promise<Payment[]>
  findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]>
  findByApartmentAndDateRange(
    apartmentUnitCode: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]>
}

export class PaymentRepository
  extends BaseRepository<Payment, string>
  implements IPaymentRepository
{
  constructor(tableName: string, dynamoClient: DynamoDBDocumentClient) {
    super(tableName, dynamoClient)
  }

  async findById(paymentId: string): Promise<Payment | null> {
    // We need to scan to find the payment by ID since we don't know the apartment unit code
    // In a real implementation, you might want to use a GSI for this
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'paymentId = :paymentId',
      ExpressionAttributeValues: {
        ':paymentId': paymentId,
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items || result.Items.length === 0) {
        return null
      }
      return this.mapToEntity(result.Items[0])
    } catch (error) {
      console.error('Error finding payment by ID:', error)
      throw error
    }
  }

  async findByApartment(apartmentUnitCode: string): Promise<Payment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `APARTMENT#${apartmentUnitCode}`,
        ':sk': 'PAYMENT#',
      },
      ScanIndexForward: false, // Get most recent payments first
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by apartment:', error)
      throw error
    }
  }

  async findLastByApartment(apartmentUnitCode: string): Promise<Payment | null> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `APARTMENT#${apartmentUnitCode}`,
        ':sk': 'PAYMENT#',
      },
      ScanIndexForward: false, // Get most recent first
      Limit: 1,
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items || result.Items.length === 0) {
        return null
      }
      return this.mapToEntity(result.Items[0])
    } catch (error) {
      console.error('Error finding last payment by apartment:', error)
      throw error
    }
  }

  async findByUser(userPhoneNumber: string): Promise<Payment[]> {
    // This would require a GSI on userPhoneNumber
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1', // Assuming we have a GSI for user queries
      KeyConditionExpression: 'userPhoneNumber = :phoneNumber',
      ExpressionAttributeValues: {
        ':phoneNumber': userPhoneNumber,
      },
      ScanIndexForward: false, // Get most recent payments first
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by user:', error)
      throw error
    }
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    // This would require a GSI on status
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI2', // Assuming we have a GSI for status queries
      KeyConditionExpression: 'paymentStatus = :status',
      ExpressionAttributeValues: {
        ':status': status,
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by status:', error)
      throw error
    }
  }

  async findByContract(contractId: string): Promise<Payment[]> {
    // This would require a GSI on contractId
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI3', // Assuming we have a GSI for contract queries
      KeyConditionExpression: 'contractId = :contractId',
      ExpressionAttributeValues: {
        ':contractId': contractId,
      },
      ScanIndexForward: false, // Get most recent payments first
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by contract:', error)
      throw error
    }
  }

  async findOverduePayments(): Promise<Payment[]> {
    return this.findByStatus(PaymentStatus.OVERDUE)
  }

  async findPendingPayments(): Promise<Payment[]> {
    return this.findByStatus(PaymentStatus.PENDING)
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    // This would require scanning with a filter expression
    const command = new ScanCommand({
      TableName: this.tableName,
      FilterExpression: 'dueDate BETWEEN :startDate AND :endDate',
      ExpressionAttributeValues: {
        ':startDate': startDate.toISOString(),
        ':endDate': endDate.toISOString(),
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by date range:', error)
      throw error
    }
  }

  async findByApartmentAndDateRange(
    apartmentUnitCode: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Payment[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      FilterExpression: 'dueDate BETWEEN :startDate AND :endDate',
      ExpressionAttributeValues: {
        ':pk': `APARTMENT#${apartmentUnitCode}`,
        ':sk': 'PAYMENT#',
        ':startDate': startDate.toISOString(),
        ':endDate': endDate.toISOString(),
      },
      ScanIndexForward: false,
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      console.error('Error finding payments by apartment and date range:', error)
      throw error
    }
  }

  async save(payment: Payment): Promise<Payment> {
    const item = this.mapFromEntity(payment)

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    try {
      await this.dynamoClient.send(command)
      return payment
    } catch (error) {
      console.error('Error saving payment:', error)
      throw error
    }
  }

  async delete(paymentId: string): Promise<void> {
    // First find the payment to get the full key
    const payment = await this.findById(paymentId)
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        pk: payment.pkValue,
        sk: payment.skValue,
      },
    })

    try {
      await this.dynamoClient.send(command)
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  }

  protected mapToEntity(item: Record<string, any>): Payment {
    return Payment.fromJSON(item)
  }

  protected mapFromEntity(payment: Payment): Record<string, any> {
    return payment.toJSON()
  }
}

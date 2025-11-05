import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { Resource } from 'sst'

import { docClient } from '../../../infra/database'
import { logger } from '../../../infra/logger'
import { BaseRepository, type IBaseRepository } from '../../shared'
import { Contract } from '../entities/contract.entity'
import { ContractStatus } from '../vo/contract-enums.vo'

export interface IContractRepository extends IBaseRepository<Contract, string> {
  findByApartment(apartmentUnitCode: string): Promise<Contract[]>
  findActiveByApartment(apartmentUnitCode: string): Promise<Contract | null>
  findByTenant(tenantPhoneNumber: string): Promise<Contract[]>
  findByStatus(status: ContractStatus): Promise<Contract[]>
  findExpiring(daysFromNow: number): Promise<Contract[]>
}

export class ContractRepository
  extends BaseRepository<Contract, string>
  implements IContractRepository
{
  private static instance: ContractRepository

  constructor(tableName: string, dynamoClient: DynamoDBDocumentClient) {
    super(tableName, dynamoClient)
  }

  public static getInstance(): ContractRepository {
    if (!ContractRepository.instance) {
      // Import dynamoClient from infra
      const tableName = Resource.table.name || 'imovel-oshiro-table'
      ContractRepository.instance = new ContractRepository(tableName, docClient)
    }
    return ContractRepository.instance
  }

  async findById(contractId: string): Promise<Contract | null> {
    // We need to find the contract by scanning since we don't know the apartment unit code
    // In a real implementation, you might want to use a GSI for this
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1', // Assuming we have a GSI for contract queries
      KeyConditionExpression: 'sk = :sk',
      ExpressionAttributeValues: {
        ':sk': `CONTRACT#${contractId}`,
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items || result.Items.length === 0) {
        return null
      }
      return this.mapToEntity(result.Items[0])
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  async findByApartment(apartmentUnitCode: string): Promise<Contract[]> {
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: {
        ':pk': `APARTMENT#${apartmentUnitCode}`,
        ':sk': 'CONTRACT#',
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  async findActiveByApartment(apartmentUnitCode: string): Promise<Contract | null> {
    const contracts = await this.findByApartment(apartmentUnitCode)
    const activeContract = contracts.find(
      (contract) => contract.statusValue === ContractStatus.ACTIVE,
    )
    return activeContract || null
  }

  async findByTenant(tenantPhoneNumber: string): Promise<Contract[]> {
    // This would require a GSI on tenantPhoneNumber
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI2', // Assuming we have a GSI for tenant queries
      KeyConditionExpression: 'tenantPhoneNumber = :phoneNumber',
      ExpressionAttributeValues: {
        ':phoneNumber': tenantPhoneNumber,
      },
    })

    try {
      const result = await this.dynamoClient.send(command)
      if (!result.Items) {
        return []
      }
      return result.Items.map((item) => this.mapToEntity(item))
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  async findByStatus(status: ContractStatus): Promise<Contract[]> {
    // This would require a GSI on status
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI3', // Assuming we have a GSI for status queries
      KeyConditionExpression: 'contractStatus = :status',
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
      logger.error(error)
      throw error
    }
  }

  async findExpiring(daysFromNow: number): Promise<Contract[]> {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + daysFromNow)

    // This would require scanning or a GSI on endDate
    // For now, we'll get all active contracts and filter in memory
    const activeContracts = await this.findByStatus(ContractStatus.ACTIVE)

    return activeContracts.filter((contract) => {
      const endDate = contract.endDateValue
      return endDate <= targetDate && endDate >= new Date()
    })
  }

  async save(contract: Contract): Promise<Contract> {
    const item = this.mapFromEntity(contract)

    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    })

    try {
      await this.dynamoClient.send(command)
      return contract
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  async delete(contractId: string): Promise<void> {
    // First find the contract to get the full key
    const contract = await this.findById(contractId)
    if (!contract) {
      throw new Error(`Contract with ID ${contractId} not found`)
    }

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        pk: contract.pkValue,
        sk: contract.skValue,
      },
    })

    try {
      await this.dynamoClient.send(command)
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  protected mapToEntity(item: Record<string, any>): Contract {
    return Contract.fromJSON(item)
  }

  protected mapFromEntity(contract: Contract): Record<string, any> {
    return contract.toJSON()
  }
}

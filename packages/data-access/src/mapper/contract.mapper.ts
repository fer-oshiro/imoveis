import { Contract } from '@imovel/core/domain/contract'

export const mapContractToDynamo = (contract: Contract) => {
  return {
    PK: `APARTMENT#${contract.apartmentId}`,
    SK: `CONTRACT#${contract.id}`,
    userId: `USER#${contract.userId}`,
    valid: contract.valid,
    dueDate: contract.dueDate ? contract.dueDate.toISOString() : null,
    document: contract.document,
    images: contract.images,
    rentAmount: contract.rentAmount,
    options: contract.options,
    balance: contract.balance,
    metadata: contract.metadata,
  }
}

export const mapDynamoToContract = (item: any): Contract => {
  return Contract.create({
    id: item.PK.replace('CONTRACT#', ''),
    userId: item.userId.replace('USER#', ''),
    apartmentId: item.PK.replace('APARTMENT#', ''),
    document: item.document,
    valid: item.valid,
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
    images: item.images || [],
    rentAmount: item.rentAmount || 0,
    options: item.options || ['FURNISHED'],
    balance: item.balance || 0,
    metadata: item.metadata,
  })
}

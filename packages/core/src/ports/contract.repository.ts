import { Contract } from '@imovel/core/domain/contract'

export interface ContractRepository {
  findById(id: string): Promise<Contract | null>
  findAll(): Promise<Contract[]>
  save(contract: Contract): Promise<void>
  delete(contract: Contract): Promise<void>
}

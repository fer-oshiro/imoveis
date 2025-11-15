import { LedgerEntry } from '@imovel/core/domain/ledger-entry'

export interface PaymentRepository {
  findById(id: string): Promise<LedgerEntry | null>
  findByContractId(contractId: string): Promise<LedgerEntry[]>
  findAll(): Promise<LedgerEntry[]>
  save(contract: LedgerEntry): Promise<void>
  delete(contract: LedgerEntry): Promise<void>
}

import { Metadata } from '@imovel/core/domain/common'

export abstract class LedgerEntry {
  constructor(
    readonly id: string,
    readonly contractId: string,
    readonly amount: number,
    readonly date: Date,
    readonly metadata: Metadata,
  ) {}
}

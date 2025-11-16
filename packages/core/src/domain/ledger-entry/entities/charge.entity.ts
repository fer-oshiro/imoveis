import { randomUUID } from 'node:crypto'

import { Metadata } from '@imovel/core/domain/common'

import { LedgerEntry } from './ledger-entry.entity'

export class ChargeEntry extends LedgerEntry {
  constructor(
    readonly id: string,
    readonly contractId: string,
    readonly amount: number,
    readonly date: Date,
    readonly metadata: Metadata,
    readonly description?: string,
  ) {
    super(id, contractId, amount, date, metadata)
  }

  static create(
    contractId: string,
    amount: number,
    date: Date,
    metadata: Metadata,
    id?: string,
    description?: string,
  ): ChargeEntry {
    return new ChargeEntry(id ?? randomUUID(), contractId, amount, date, metadata, description)
  }

  toJson() {
    return {
      id: this.id,
      contractId: this.contractId,
      amount: this.amount,
      date: this.date.toISOString(),
      metadata: this.metadata,
      description: this.description,
    }
  }
}

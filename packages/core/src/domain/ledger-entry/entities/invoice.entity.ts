import { randomUUID } from 'node:crypto'

import { Metadata, MetadataSchema } from '@imovel/core/domain/common'

import { LedgerEntry } from './ledger-entry.entity'

export class InvoiceEntry extends LedgerEntry {
  constructor(
    readonly id: string,
    readonly contractId: string,
    readonly amount: number,
    readonly payerId: string,
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
    payerId: string,
    metadata?: Metadata,
    id?: string,
    description?: string,
  ): InvoiceEntry {
    if (!payerId) {
      throw new Error('Payer ID is required for InvoiceEntry')
    }
    return new InvoiceEntry(
      id ?? randomUUID(),
      contractId,
      amount,
      payerId,
      date,
      metadata ?? MetadataSchema.parse({}),
      description ?? '',
    )
  }

  toJson() {
    return {
      id: this.id,
      contractId: this.contractId,
      amount: this.amount,
      payerId: this.payerId,
      date: this.date.toISOString(),
      metadata: this.metadata,
      description: this.description,
    }
  }
}

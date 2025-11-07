import { Metadata } from '@imovel/core/domain/common'

export class InvoiceEntry {
  constructor(
    readonly id: string,
    readonly contractId: string,
    readonly amount: number,
    readonly date: Date,
    readonly description: string,
    readonly metadata: Metadata,
  ) {}
}

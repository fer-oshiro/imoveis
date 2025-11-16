import { ChargeEntry, InvoiceEntry, LedgerEntry } from '@imovel/core/domain/ledger-entry'

export function mapPaymentToDynamo(payment: InvoiceEntry | ChargeEntry): any {
  return {
    PK: `CONTRACT#${payment.contractId}`,
    SK: `PAYMENT#${payment.id}`,
    type: payment instanceof InvoiceEntry ? 'INVOICE' : 'CHARGE',
    ...payment,
  }
}

export function mapDynamoToPayment(item: any): InvoiceEntry | LedgerEntry {
  if (item.type === 'INVOICE') {
    return InvoiceEntry.create(
      item.contractId,
      item.amount,
      new Date(item.date),
      item.payerId,
      item.metadata,
      item.description,
    )
  }

  return ChargeEntry.create(item.contractId, item.amount, new Date(item.date), item.metadata)
}

import { ChargeEntry, InvoiceEntry, LedgerEntry } from '@imovel/core/domain/ledger-entry'

export function mapPaymentToDynamo(payment: InvoiceEntry | ChargeEntry): any {
  return {
    PK: `PAYMENT#${payment.id}`,
    SK: `PAYMENT#${payment.id}`,
    type: payment instanceof InvoiceEntry ? 'INVOICE' : 'CHARGE',
    ...payment,
  }
}

export function mapDynamoToPayment(item: any): InvoiceEntry | LedgerEntry {
  if (item.type === 'INVOICE') {
    return InvoiceEntry.create(
      item.PK.replace('PAYMENT#', ''),
      item.contractId,
      item.amount,
      new Date(item.date),
      item.metadata,
      item.payerId,
      item.description,
    )
  }

  return ChargeEntry.create(
    item.PK.replace('PAYMENT#', ''),
    item.contractId,
    item.amount,
    new Date(item.date),
    item.metadata,
    item.description,
  )
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

export enum PaymentType {
  RENT = 'rent',
  CLEANING_FEE = 'cleaning_fee',
  DEPOSIT = 'deposit',
  UTILITIES = 'utilities',
  OTHER = 'other',
}

export const PAYMENT_STATUS_VALUES = Object.values(PaymentStatus)
export const PAYMENT_TYPE_VALUES = Object.values(PaymentType)

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

import { PaymentStatus, PaymentType } from '../vo/payment-enums.vo'

export interface CreatePaymentDto {
  apartmentUnitCode: string
  userPhoneNumber: string
  amount: number
  dueDate: string // ISO string
  contractId: string
  type?: PaymentType
  description?: string
  createdBy?: string
}

export interface SubmitPaymentProofDto {
  paymentId: string
  proofDocumentKey: string
  paymentDate: string // ISO string
  updatedBy?: string
}

export interface ValidatePaymentDto {
  paymentId: string
  validatedBy: string
  action: 'validate' | 'reject'
}

export interface UpdatePaymentDto {
  amount?: number
  dueDate?: string // ISO string
  description?: string
  updatedBy?: string
}

export interface PaymentResponseDto {
  paymentId: string
  apartmentUnitCode: string
  userPhoneNumber: string
  amount: number
  dueDate: string
  status: PaymentStatus
  type: PaymentType
  contractId: string
  paymentDate?: string
  proofDocumentKey?: string
  validatedBy?: string
  validatedAt?: string
  description?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  updatedBy?: string
  version: number
}

// Validation utilities
export class CreatePaymentDtoValidator {
  static validate(dto: CreatePaymentDto): void {
    if (!dto.apartmentUnitCode?.trim()) {
      throw new Error('Apartment unit code is required')
    }
    if (!dto.userPhoneNumber?.trim()) {
      throw new Error('User phone number is required')
    }
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Amount must be greater than zero')
    }
    if (!dto.dueDate) {
      throw new Error('Due date is required')
    }
    if (!dto.contractId?.trim()) {
      throw new Error('Contract ID is required')
    }

    // Validate date format
    const dueDate = new Date(dto.dueDate)
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due date format')
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    if (!phoneRegex.test(dto.userPhoneNumber)) {
      throw new Error('Invalid phone number format')
    }
  }

  static sanitize(dto: CreatePaymentDto): CreatePaymentDto {
    return {
      ...dto,
      apartmentUnitCode: dto.apartmentUnitCode.trim().toUpperCase(),
      userPhoneNumber: dto.userPhoneNumber.trim(),
      contractId: dto.contractId.trim(),
      description: dto.description?.trim(),
      createdBy: dto.createdBy?.trim(),
    }
  }
}

export class SubmitPaymentProofDtoValidator {
  static validate(dto: SubmitPaymentProofDto): void {
    if (!dto.paymentId?.trim()) {
      throw new Error('Payment ID is required')
    }
    if (!dto.proofDocumentKey?.trim()) {
      throw new Error('Proof document key is required')
    }
    if (!dto.paymentDate) {
      throw new Error('Payment date is required')
    }

    // Validate date format
    const paymentDate = new Date(dto.paymentDate)
    if (isNaN(paymentDate.getTime())) {
      throw new Error('Invalid payment date format')
    }

    // Payment date should not be in the future
    if (paymentDate > new Date()) {
      throw new Error('Payment date cannot be in the future')
    }
  }

  static sanitize(dto: SubmitPaymentProofDto): SubmitPaymentProofDto {
    return {
      ...dto,
      paymentId: dto.paymentId.trim(),
      proofDocumentKey: dto.proofDocumentKey.trim(),
      updatedBy: dto.updatedBy?.trim(),
    }
  }
}

export class ValidatePaymentDtoValidator {
  static validate(dto: ValidatePaymentDto): void {
    if (!dto.paymentId?.trim()) {
      throw new Error('Payment ID is required')
    }
    if (!dto.validatedBy?.trim()) {
      throw new Error('Validator ID is required')
    }
    if (!['validate', 'reject'].includes(dto.action)) {
      throw new Error('Action must be either "validate" or "reject"')
    }
  }

  static sanitize(dto: ValidatePaymentDto): ValidatePaymentDto {
    return {
      ...dto,
      paymentId: dto.paymentId.trim(),
      validatedBy: dto.validatedBy.trim(),
    }
  }
}

export class UpdatePaymentDtoValidator {
  static validate(dto: UpdatePaymentDto): void {
    if (dto.amount !== undefined && dto.amount <= 0) {
      throw new Error('Amount must be greater than zero')
    }
    if (dto.dueDate) {
      const dueDate = new Date(dto.dueDate)
      if (isNaN(dueDate.getTime())) {
        throw new Error('Invalid due date format')
      }
    }
  }

  static sanitize(dto: UpdatePaymentDto): UpdatePaymentDto {
    return {
      ...dto,
      description: dto.description?.trim(),
      updatedBy: dto.updatedBy?.trim(),
    }
  }
}

// Response DTO mapper
export class PaymentResponseDtoMapper {
  static fromEntity(payment: any): PaymentResponseDto {
    return {
      paymentId: payment.paymentIdValue,
      apartmentUnitCode: payment.apartmentUnitCodeValue,
      userPhoneNumber: payment.userPhoneNumberValue,
      amount: payment.amountValue,
      dueDate: payment.dueDateValue.toISOString(),
      status: payment.statusValue,
      type: payment.typeValue,
      contractId: payment.contractIdValue,
      paymentDate: payment.paymentDateValue?.toISOString(),
      proofDocumentKey: payment.proofDocumentKeyValue,
      validatedBy: payment.validatedByValue,
      validatedAt: payment.validatedAtValue?.toISOString(),
      description: payment.descriptionValue,
      createdAt: payment.metadataValue.createdAt.toISOString(),
      updatedAt: payment.metadataValue.updatedAt.toISOString(),
      createdBy: payment.metadataValue.createdBy,
      updatedBy: payment.metadataValue.updatedBy,
      version: payment.metadataValue.version,
    }
  }

  static fromEntities(payments: any[]): PaymentResponseDto[] {
    return payments.map((payment) => this.fromEntity(payment))
  }
}

import { z } from 'zod'

import { PAYMENT_TYPE_VALUES, PaymentStatus, PaymentType } from '../vo/payment-enums.vo'

// Zod schemas for validation
const base = {
  name: z.string().min(1, 'Name is required').trim(),
  amount: z.number().positive('Amount must be greater than zero'),
  dueDate: z
    .string()
    .datetime('Invalid due date format')
    .transform((v) => new Date(v)),
  contractId: z.string().min(1, 'Contract ID is required').trim(),
  type: z.enum(PAYMENT_TYPE_VALUES as [string, ...string[]]).optional(),
  description: z.string().trim().optional(),
}
export const createPaymentDtoByApSchema = z.object({
  ...base,
  apartmentUnitCode: z.string().min(1, 'Apartment unit code is required').trim().toUpperCase(),
})
const DOC_RE =
  /^(?:[\dx]{3}\.[\dx]{3}\.[\dx]{3}-[\dx]{2}|[\dx]{2}\.[\dx]{3}\.[\dx]{3}\/[\dx]{4}-[\dx]{2}|[\dx.\-\/]{8,})$/i

export const createPaymentDtoByDocSchema = z.object({
  ...base,
  doc: z.string().regex(DOC_RE, 'Invalid CPF/CNPJ'),
})

export const createPaymentDtoSchema = z.union([
  createPaymentDtoByApSchema,
  createPaymentDtoByDocSchema,
])

export type CreatePaymentDto = z.infer<typeof createPaymentDtoSchema>

export const submitPaymentProofDtoSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required').trim(),
  proofDocumentKey: z.string().min(1, 'Proof document key is required').trim(),
  paymentDate: z
    .string()
    .datetime('Invalid payment date format')
    .transform((val) => new Date(val))
    .refine((date) => date <= new Date(), 'Payment date cannot be in the future'),
  updatedBy: z.string().trim().optional(),
})

export type SubmitPaymentProofDto = z.infer<typeof submitPaymentProofDtoSchema>

export const validatePaymentDtoSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required').trim(),
  validatedBy: z.string().min(1, 'Validator ID is required').trim(),
  action: z.enum(['validate', 'reject'], {
    errorMap: () => ({ message: 'Action must be either "validate" or "reject"' }),
  }),
})

export type ValidatePaymentDto = z.infer<typeof validatePaymentDtoSchema>

export const updatePaymentDtoSchema = z.object({
  amount: z.number().positive('Amount must be greater than zero').optional(),
  dueDate: z
    .string()
    .datetime('Invalid due date format')
    .transform((val) => new Date(val))
    .optional(),
  description: z.string().trim().optional(),
  updatedBy: z.string().trim().optional(),
})

export type UpdatePaymentDto = z.infer<typeof updatePaymentDtoSchema>

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

// Validation utilities using Zod
export function validateCreatePaymentDto(data: unknown): CreatePaymentDto {
  return createPaymentDtoSchema.parse(data)
}

export function validateSubmitPaymentProofDto(data: unknown): SubmitPaymentProofDto {
  return submitPaymentProofDtoSchema.parse(data)
}

export function validateValidatePaymentDto(data: unknown): ValidatePaymentDto {
  return validatePaymentDtoSchema.parse(data)
}

export function validateUpdatePaymentDto(data: unknown): UpdatePaymentDto {
  return updatePaymentDtoSchema.parse(data)
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

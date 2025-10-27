import { z } from 'zod'

import { PhoneNumberVO, DocumentVO, DocumentType } from '../../shared'
import { ValidationError } from '../../shared/errors/domain-error'

// Zod parsing utility
export function safeParseWithValidationError<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: string,
): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ')
    throw new ValidationError(`${context} validation failed: ${errors}`)
  }

  return result.data
}

// Custom Zod validators
export const phoneNumberValidator = z.string().refine(
  (value) => {
    try {
      PhoneNumberVO.create(value)
      return true
    } catch {
      return false
    }
  },
  { message: 'Invalid phone number format' },
)

export const documentValidator = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true // Optional document
      try {
        DocumentVO.create(value)
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid document format (must be CPF or CNPJ)' },
  )

export const cpfValidator = z.string().refine(
  (value) => {
    try {
      DocumentVO.createCPF(value)
      return true
    } catch {
      return false
    }
  },
  { message: 'Invalid CPF format' },
)

export const cnpjValidator = z.string().refine(
  (value) => {
    try {
      DocumentVO.createCNPJ(value)
      return true
    } catch {
      return false
    }
  },
  { message: 'Invalid CNPJ format' },
)

// Utility functions
export function validatePhoneNumber(phoneNumber: string): PhoneNumberVO {
  try {
    return PhoneNumberVO.create(phoneNumber)
  } catch (error) {
    throw new ValidationError('Invalid phone number format', 'phoneNumber')
  }
}

export function validateDocument(document?: string): DocumentVO {
  try {
    return DocumentVO.create(document)
  } catch (error) {
    throw new ValidationError('Invalid document format', 'document')
  }
}

export function validateEmail(email?: string): boolean {
  if (!email) return true // Optional email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateName(name: string): void {
  if (!name || name.trim().length === 0) {
    throw new ValidationError('Name is required', 'name')
  }
  if (name.trim().length < 2) {
    throw new ValidationError('Name must have at least 2 characters', 'name')
  }
}

// Document type detection
export function detectDocumentType(document: string): DocumentType {
  const cleanDocument = document.replace(/\D/g, '')

  if (cleanDocument.length === 11) {
    return DocumentType.CPF
  } else if (cleanDocument.length === 14) {
    return DocumentType.CNPJ
  } else {
    throw new ValidationError('Document must be a valid CPF (11 digits) or CNPJ (14 digits)')
  }
}

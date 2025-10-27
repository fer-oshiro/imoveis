import { z } from 'zod'

import { ValidationError } from '../errors/domain-error'

/**
 * Safely parse data with a Zod schema and throw ValidationError on failure
 */
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

/**
 * Validate required string field
 */
export function validateRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required and must be a non-empty string`, fieldName)
  }
  return value.trim()
}

/**
 * Validate required number field
 */
export function validateRequiredNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`, fieldName)
  }
  return value
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): number {
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive number`, fieldName)
  }
  return value
}

/**
 * Validate non-negative number
 */
export function validateNonNegativeNumber(value: number, fieldName: string): number {
  if (value < 0) {
    throw new ValidationError(`${fieldName} must be non-negative`, fieldName)
  }
  return value
}

/**
 * Validate date string and convert to Date
 */
export function validateDateString(value: unknown, fieldName: string): Date {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a valid date string`, fieldName)
  }

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date string`, fieldName)
  }

  return date
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName: string = 'email'): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format: ${email}`, fieldName)
  }
  return email
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string = 'url'): string {
  try {
    new URL(url)
    return url
  } catch {
    throw new ValidationError(`Invalid URL format: ${url}`, fieldName)
  }
}

/**
 * Validate array field
 */
export function validateArray<T>(value: unknown, fieldName: string): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`, fieldName)
  }
  return value as T[]
}

/**
 * Validate enum value
 */
export function validateEnum<T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
  fieldName: string,
): T[keyof T] {
  const validValues = Object.values(enumObject)
  if (!validValues.includes(value as string)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${validValues.join(', ')}. Got: ${value}`,
      fieldName,
    )
  }
  return value as T[keyof T]
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string,
): string {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
      fieldName,
    )
  }
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be at most ${maxLength} characters long`,
      fieldName,
    )
  }
  return value
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date,
  fieldName: string = 'dateRange',
): void {
  if (startDate >= endDate) {
    throw new ValidationError(`Start date must be before end date`, fieldName)
  }
}

/**
 * Validate future date
 */
export function validateFutureDate(date: Date, fieldName: string): Date {
  const now = new Date()
  if (date <= now) {
    throw new ValidationError(`${fieldName} must be in the future`, fieldName)
  }
  return date
}

/**
 * Validate past date
 */
export function validatePastDate(date: Date, fieldName: string): Date {
  const now = new Date()
  if (date >= now) {
    throw new ValidationError(`${fieldName} must be in the past`, fieldName)
  }
  return date
}

/**
 * Sanitize string input
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/**
 * Validate and sanitize phone number format
 */
export function validatePhoneNumberFormat(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Brazilian phone numbers should have 10 or 11 digits
  if (cleaned.length < 10 || cleaned.length > 11) {
    throw new ValidationError('Phone number must have 10 or 11 digits', 'phoneNumber')
  }

  return cleaned
}

/**
 * Validate Brazilian CPF format
 */
export function validateCPFFormat(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) {
    throw new ValidationError('CPF must have 11 digits', 'cpf')
  }

  // Check for invalid sequences (all same digits)
  if (/^(\d)\1{10}$/.test(cleaned)) {
    throw new ValidationError('Invalid CPF format', 'cpf')
  }

  return cleaned
}

/**
 * Validate Brazilian CNPJ format
 */
export function validateCNPJFormat(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) {
    throw new ValidationError('CNPJ must have 14 digits', 'cnpj')
  }

  // Check for invalid sequences (all same digits)
  if (/^(\d)\1{13}$/.test(cleaned)) {
    throw new ValidationError('Invalid CNPJ format', 'cnpj')
  }

  return cleaned
}

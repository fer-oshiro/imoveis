import { parsePhoneNumberFromString, isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import { ValidationError } from '../errors/domain-error'

export class PhoneNumberVO {
  public readonly value: string // E.164 format (e.g., +5511987654321)
  public readonly formatted: string // International format
  public readonly country: string // Country code (e.g., 'BR')

  constructor(phoneNumber: string, defaultCountry: CountryCode = 'BR') {
    const parsed = this.parseAndValidate(phoneNumber, defaultCountry)
    this.value = parsed.number
    this.formatted = parsed.formatInternational
    this.country = parsed.country || defaultCountry
  }

  private parseAndValidate(
    phoneNumber: string,
    defaultCountry: CountryCode,
  ): {
    number: string
    formatInternational: string
    country: string | undefined
  } {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new ValidationError('Phone number is required')
    }

    try {
      // First try to parse with default country
      let parsed = parsePhoneNumberFromString(phoneNumber, defaultCountry)

      // If parsing fails with default country, try without country
      if (!parsed?.isValid()) {
        parsed = parsePhoneNumberFromString(phoneNumber)
      }

      // If still invalid, throw error
      if (!parsed?.isValid()) {
        throw new ValidationError('Invalid phone number format')
      }

      return {
        number: parsed.number, // E.164 format
        formatInternational: parsed.formatInternational(),
        country: parsed.country,
      }
    } catch (error) {
      throw new ValidationError('Invalid phone number format')
    }
  }

  static create(phoneNumber: string, defaultCountry: CountryCode = 'BR'): PhoneNumberVO {
    return new PhoneNumberVO(phoneNumber, defaultCountry)
  }

  static isValid(phoneNumber: string, defaultCountry: CountryCode = 'BR'): boolean {
    try {
      return isValidPhoneNumber(phoneNumber, defaultCountry) || isValidPhoneNumber(phoneNumber)
    } catch {
      return false
    }
  }

  equals(other: PhoneNumberVO): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.formatted
  }

  toJSON(): string {
    return this.value
  }

  static fromJSON(data: string): PhoneNumberVO {
    return new PhoneNumberVO(data)
  }
}

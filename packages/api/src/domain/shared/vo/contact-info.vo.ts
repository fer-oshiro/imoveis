import { type CountryCode } from 'libphonenumber-js'
import { ValidationError } from '../errors/domain-error'
import { PhoneNumberVO } from './phone-number.vo'

export enum ContactMethod {
  WHATSAPP = 'whatsapp',
  CALL = 'call',
  EMAIL = 'email',
}

export interface ContactInfo {
  contactName?: string
  phoneNumber: string
  contactMethod: ContactMethod
  contactDocument?: string
  preferredLanguage?: string
  defaultCountry?: CountryCode
}

export class ContactInfoVO implements ContactInfo {
  public readonly contactName?: string
  public readonly phoneNumber: string // E.164 format
  public readonly contactMethod: ContactMethod
  public readonly contactDocument?: string
  public readonly preferredLanguage?: string
  public readonly defaultCountry?: CountryCode
  private readonly _phoneNumberVO: PhoneNumberVO

  constructor(data: ContactInfo) {
    this.contactName = data.contactName
    this._phoneNumberVO = this.validateAndParsePhoneNumber(data.phoneNumber, data.defaultCountry)
    this.phoneNumber = this._phoneNumberVO.value
    this.contactMethod = data.contactMethod
    this.contactDocument = data.contactDocument
    this.preferredLanguage = data.preferredLanguage
    this.defaultCountry = data.defaultCountry || 'BR'
  }

  private validateAndParsePhoneNumber(
    phoneNumber: string,
    defaultCountry?: CountryCode,
  ): PhoneNumberVO {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new ValidationError('Phone number is required', 'phoneNumber')
    }

    try {
      return new PhoneNumberVO(phoneNumber, defaultCountry || 'BR')
    } catch (error) {
      throw new ValidationError('Invalid phone number format', 'phoneNumber')
    }
  }

  get formattedPhoneNumber(): string {
    return this._phoneNumberVO.formatted
  }

  get phoneCountry(): string {
    return this._phoneNumberVO.country
  }

  static create(
    contactName?: string,
    phoneNumber?: string,
    contactMethod?: ContactMethod,
    contactDocument?: string,
    preferredLanguage?: string,
    defaultCountry?: CountryCode,
  ): ContactInfoVO | null {
    if (!phoneNumber || !contactMethod) return null
    return new ContactInfoVO({
      contactName,
      phoneNumber,
      contactMethod,
      contactDocument,
      preferredLanguage,
      defaultCountry,
    })
  }

  toJSON(): Record<string, any> {
    return {
      contactName: this.contactName,
      phoneNumber: this.phoneNumber,
      contactMethod: this.contactMethod,
      contactDocument: this.contactDocument,
      preferredLanguage: this.preferredLanguage,
      defaultCountry: this.defaultCountry,
    }
  }

  static fromJSON(data: Record<string, any>): ContactInfoVO | null {
    if (!data.phoneNumber || !data.contactMethod) return null
    return new ContactInfoVO({
      contactName: data.contactName,
      phoneNumber: data.phoneNumber,
      contactMethod: data.contactMethod,
      contactDocument: data.contactDocument,
      preferredLanguage: data.preferredLanguage,
      defaultCountry: data.defaultCountry,
    })
  }
}

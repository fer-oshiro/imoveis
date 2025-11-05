import { type CountryCode } from 'libphonenumber-js'

import { PhoneNumberVO } from './phone-number.vo'
import { logger } from '../../../infra/logger'
import { ValidationError } from '../errors/domain-error'

export enum ContactMethod {
  WHATSAPP = 'whatsapp',
  CALL = 'call',
  EMAIL = 'email',
}

export interface ContactInfo {
  contactName?: string
  contactPhone?: string
  contactMethod?: ContactMethod
  contactDocument?: string
  preferredLanguage?: string
  defaultCountry?: CountryCode
}

export class ContactInfoVO implements ContactInfo {
  public readonly contactName?: string
  public readonly contactPhone?: string // E.164 format
  public readonly contactMethod?: ContactMethod
  public readonly contactDocument?: string
  public readonly preferredLanguage?: string
  public readonly defaultCountry?: CountryCode
  private readonly _phoneNumberVO: PhoneNumberVO | null

  constructor(data: ContactInfo) {
    this.contactName = data.contactName
    this._phoneNumberVO = data.contactPhone
      ? this.validateAndParsePhoneNumber(data.contactPhone, data.defaultCountry)
      : null
    this.contactPhone = data.contactPhone
    this.contactMethod = data.contactMethod
    this.contactDocument = data.contactDocument
    this.preferredLanguage = data.preferredLanguage
    this.defaultCountry = data.defaultCountry || 'BR'
  }

  private validateAndParsePhoneNumber(
    contactPhone: string,
    defaultCountry?: CountryCode,
  ): PhoneNumberVO {
    if (!contactPhone || contactPhone.trim().length === 0) {
      throw new ValidationError('Phone number is required', 'contactPhone')
    }

    try {
      return new PhoneNumberVO(contactPhone, defaultCountry || 'BR')
    } catch (error) {
      logger.error(error)
      throw new ValidationError('Invalid phone number format', 'contactPhone')
    }
  }

  get formattedPhoneNumber(): string {
    return this._phoneNumberVO?.formatted || ''
  }

  get phoneCountry(): string {
    return this._phoneNumberVO?.country || ''
  }

  static create(
    contactName?: string,
    contactPhone?: string,
    contactMethod?: ContactMethod,
    contactDocument?: string,
    preferredLanguage?: string,
    defaultCountry?: CountryCode,
  ): ContactInfoVO | null {
    if (!contactPhone || !contactMethod) return null
    return new ContactInfoVO({
      contactName,
      contactPhone,
      contactMethod,
      contactDocument,
      preferredLanguage,
      defaultCountry,
    })
  }

  toJSON(): Record<string, any> {
    return {
      contactName: this.contactName,
      contactPhone: this.contactPhone,
      contactMethod: this.contactMethod,
      contactDocument: this.contactDocument,
      preferredLanguage: this.preferredLanguage,
      defaultCountry: this.defaultCountry,
    }
  }

  static fromJSON(data: Record<string, any>): ContactInfoVO | null {
    if (!data.contactPhone || !data.contactMethod) return null
    return new ContactInfoVO({
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactMethod: data.contactMethod,
      contactDocument: data.contactDocument,
      preferredLanguage: data.preferredLanguage,
      defaultCountry: data.defaultCountry,
    })
  }
}

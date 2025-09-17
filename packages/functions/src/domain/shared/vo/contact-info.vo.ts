import { CountryCode } from 'libphonenumber-js';
import { ValidationError } from '../errors/domain-error';
import { PhoneNumberVO } from './phone-number.vo';

export enum ContactMethod {
  WHATSAPP = 'whatsapp',
  CALL = 'call',
  EMAIL = 'email',
}

export interface ContactInfo {
  phoneNumber: string;
  contactMethod: ContactMethod;
  preferredLanguage?: string;
  defaultCountry?: CountryCode;
}

export class ContactInfoVO implements ContactInfo {
  public readonly phoneNumber: string; // E.164 format
  public readonly contactMethod: ContactMethod;
  public readonly preferredLanguage?: string;
  public readonly defaultCountry?: CountryCode;
  private readonly _phoneNumberVO: PhoneNumberVO;

  constructor(data: ContactInfo) {
    this._phoneNumberVO = this.validateAndParsePhoneNumber(data.phoneNumber, data.defaultCountry);
    this.phoneNumber = this._phoneNumberVO.value;
    this.contactMethod = data.contactMethod;
    this.preferredLanguage = data.preferredLanguage;
    this.defaultCountry = data.defaultCountry || 'BR';
  }

  private validateAndParsePhoneNumber(phoneNumber: string, defaultCountry?: CountryCode): PhoneNumberVO {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      throw new ValidationError('Phone number is required', 'phoneNumber');
    }

    try {
      return new PhoneNumberVO(phoneNumber, defaultCountry || 'BR');
    } catch (error) {
      throw new ValidationError('Invalid phone number format', 'phoneNumber');
    }
  }

  get formattedPhoneNumber(): string {
    return this._phoneNumberVO.formatted;
  }

  get phoneCountry(): string {
    return this._phoneNumberVO.country;
  }

  static create(
    phoneNumber: string,
    contactMethod: ContactMethod,
    preferredLanguage?: string,
    defaultCountry?: CountryCode
  ): ContactInfoVO {
    return new ContactInfoVO({
      phoneNumber,
      contactMethod,
      preferredLanguage,
      defaultCountry,
    });
  }

  toJSON(): Record<string, any> {
    return {
      phoneNumber: this.phoneNumber,
      contactMethod: this.contactMethod,
      preferredLanguage: this.preferredLanguage,
      defaultCountry: this.defaultCountry,
    };
  }

  static fromJSON(data: Record<string, any>): ContactInfoVO {
    return new ContactInfoVO({
      phoneNumber: data.phoneNumber,
      contactMethod: data.contactMethod,
      preferredLanguage: data.preferredLanguage,
      defaultCountry: data.defaultCountry,
    });
  }
}
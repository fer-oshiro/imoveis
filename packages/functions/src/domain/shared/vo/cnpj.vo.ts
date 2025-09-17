import { ValidationError } from '../errors/domain-error'

export class CNPJVO {
  public readonly value: string
  public readonly formatted: string

  constructor(cnpj: string) {
    this.validate(cnpj)
    this.value = this.normalize(cnpj)
    this.formatted = this.format(this.value)
  }

  private validate(cnpj: string): void {
    if (!cnpj || cnpj.trim().length === 0) {
      throw new ValidationError('CNPJ is required')
    }

    const cleanCnpj = cnpj.replace(/\D/g, '')

    if (cleanCnpj.length !== 14) {
      throw new ValidationError('CNPJ must have 14 digits')
    }

    // Check for known invalid CNPJs (all same digits)
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      throw new ValidationError('Invalid CNPJ format')
    }

    // Validate CNPJ check digits
    if (!this.isValidCNPJ(cleanCnpj)) {
      throw new ValidationError('Invalid CNPJ')
    }
  }

  private isValidCNPJ(cnpj: string): boolean {
    // Calculate first check digit
    let sum = 0
    let weight = 5
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight
      weight = weight === 2 ? 9 : weight - 1
    }
    let remainder = sum % 11
    const firstDigit = remainder < 2 ? 0 : 11 - remainder

    if (parseInt(cnpj.charAt(12)) !== firstDigit) {
      return false
    }

    // Calculate second check digit
    sum = 0
    weight = 6
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weight
      weight = weight === 2 ? 9 : weight - 1
    }
    remainder = sum % 11
    const secondDigit = remainder < 2 ? 0 : 11 - remainder

    return parseInt(cnpj.charAt(13)) === secondDigit
  }

  private normalize(cnpj: string): string {
    return cnpj.replace(/\D/g, '')
  }

  private format(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  static create(cnpj: string): CNPJVO {
    return new CNPJVO(cnpj)
  }

  equals(other: CNPJVO): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.formatted
  }

  toJSON(): string {
    return this.value
  }

  static fromJSON(data: string): CNPJVO {
    return new CNPJVO(data)
  }
}

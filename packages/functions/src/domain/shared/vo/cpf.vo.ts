import { ValidationError } from '../errors/domain-error';

export class CPFVO {
  public readonly value: string;
  public readonly formatted: string;

  constructor(cpf: string) {
    this.validate(cpf);
    this.value = this.normalize(cpf);
    this.formatted = this.format(this.value);
  }

  private validate(cpf: string): void {
    if (!cpf || cpf.trim().length === 0) {
      throw new ValidationError('CPF is required');
    }

    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) {
      throw new ValidationError('CPF must have 11 digits');
    }

    // Check for known invalid CPFs (all same digits)
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      throw new ValidationError('Invalid CPF format');
    }

    // Validate CPF check digits
    if (!this.isValidCPF(cleanCpf)) {
      throw new ValidationError('Invalid CPF');
    }
  }

  private isValidCPF(cpf: string): boolean {
    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cpf.charAt(9)) !== firstDigit) {
      return false;
    }

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf.charAt(10)) === secondDigit;
  }

  private normalize(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  private format(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static create(cpf: string): CPFVO {
    return new CPFVO(cpf);
  }

  equals(other: CPFVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.formatted;
  }

  toJSON(): string {
    return this.value;
  }

  static fromJSON(data: string): CPFVO {
    return new CPFVO(data);
  }
}
import { CNPJVO } from './cnpj.vo'
import { CPFVO } from './cpf.vo'
import { ValidationError } from '../errors/domain-error'

export enum DocumentType {
  CPF = 'cpf',
  CNPJ = 'cnpj',
  NONE = 'none',
}

export class DocumentVO {
  public readonly type: DocumentType
  public readonly value?: string
  public readonly formatted?: string
  private readonly _cpf?: CPFVO
  private readonly _cnpj?: CNPJVO

  constructor(document?: string, type?: DocumentType) {
    // Initialize all properties to satisfy TypeScript
    this.type = DocumentType.NONE
    this.value = undefined
    this.formatted = undefined

    if (!document || document.trim().length === 0) {
      return
    }

    const cleanDocument = document.replace(/\D/g, '')

    if (type) {
      // Explicit type provided
      const result = this.validateAndSetDocument(document, type)
      Object.assign(this, { type, ...result })
    } else {
      // Auto-detect type based on length
      if (cleanDocument.length === 11) {
        const cpf = CPFVO.create(document)
        Object.assign(this, {
          type: DocumentType.CPF,
          value: cpf.value,
          formatted: cpf.formatted,
          _cpf: cpf,
        })
      } else if (cleanDocument.length === 14) {
        const cnpj = CNPJVO.create(document)
        Object.assign(this, {
          type: DocumentType.CNPJ,
          value: cnpj.value,
          formatted: cnpj.formatted,
          _cnpj: cnpj,
        })
      } else {
        throw new ValidationError('Document must be a valid CPF (11 digits) or CNPJ (14 digits)')
      }
    }
  }

  private validateAndSetDocument(
    document: string,
    type: DocumentType,
  ): { value?: string; formatted?: string; _cpf?: CPFVO; _cnpj?: CNPJVO } {
    switch (type) {
      case DocumentType.CPF: {
        const cpf = CPFVO.create(document)
        return { value: cpf.value, formatted: cpf.formatted, _cpf: cpf }
      }
      case DocumentType.CNPJ: {
        const cnpj = CNPJVO.create(document)
        return { value: cnpj.value, formatted: cnpj.formatted, _cnpj: cnpj }
      }
      case DocumentType.NONE:
        return { value: undefined, formatted: undefined }
      default:
        throw new ValidationError('Invalid document type')
    }
  }

  get cpf(): CPFVO | undefined {
    return this._cpf
  }

  get cnpj(): CNPJVO | undefined {
    return this._cnpj
  }

  get isCPF(): boolean {
    return this.type === DocumentType.CPF
  }

  get isCNPJ(): boolean {
    return this.type === DocumentType.CNPJ
  }

  get hasDocument(): boolean {
    return this.type !== DocumentType.NONE
  }

  static create(document?: string, type?: DocumentType): DocumentVO {
    return new DocumentVO(document, type)
  }

  static createCPF(cpf: string): DocumentVO {
    return new DocumentVO(cpf, DocumentType.CPF)
  }

  static createCNPJ(cnpj: string): DocumentVO {
    return new DocumentVO(cnpj, DocumentType.CNPJ)
  }

  static createEmpty(): DocumentVO {
    return new DocumentVO()
  }

  equals(other: DocumentVO): boolean {
    return this.type === other.type && this.value === other.value
  }

  toString(): string {
    return this.formatted || ''
  }

  toJSON(): Record<string, any> {
    return {
      type: this.type,
      value: this.value,
      formatted: this.formatted,
    }
  }

  static fromJSON(data: Record<string, any>): DocumentVO {
    if (!data || data.type === DocumentType.NONE) {
      return DocumentVO.createEmpty()
    }
    return new DocumentVO(data.value, data.type as DocumentType)
  }
}

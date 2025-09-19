import { DocumentVO, DocumentType } from '../../vo/document.vo'
import { CNPJVO } from '../../vo/cnpj.vo'
import { ValidationError } from '../../errors/domain-error'

describe('Shared Value Objects', () => {
  describe('DocumentVO', () => {
    describe('CPF documents', () => {
      it('should create valid CPF document', () => {
        const doc = DocumentVO.create('11144477735')

        expect(doc.value).toBe('11144477735')
        expect(doc.type).toBe(DocumentType.CPF)
        expect(doc.formatted).toBe('111.444.777-35')
        expect(doc.hasDocument).toBe(true)
      })

      it('should create CPF with formatting', () => {
        const doc = DocumentVO.create('111.444.777-35')

        expect(doc.value).toBe('11144477735')
        expect(doc.type).toBe(DocumentType.CPF)
        expect(doc.formatted).toBe('111.444.777-35')
      })

      it('should throw error for invalid CPF', () => {
        expect(() => DocumentVO.create('12345678901')).toThrow(ValidationError)
        expect(() => DocumentVO.create('11111111111')).toThrow(ValidationError)
      })
    })

    describe('CNPJ documents', () => {
      it('should create valid CNPJ document', () => {
        const doc = DocumentVO.create('11222333000181')

        expect(doc.value).toBe('11222333000181')
        expect(doc.type).toBe(DocumentType.CNPJ)
        expect(doc.formatted).toBe('11.222.333/0001-81')
        expect(doc.hasDocument).toBe(true)
      })

      it('should create CNPJ with formatting', () => {
        const doc = DocumentVO.create('11.222.333/0001-81')

        expect(doc.value).toBe('11222333000181')
        expect(doc.type).toBe(DocumentType.CNPJ)
        expect(doc.formatted).toBe('11.222.333/0001-81')
      })

      it('should throw error for invalid CNPJ', () => {
        expect(() => DocumentVO.create('12345678901234')).toThrow(ValidationError)
        expect(() => DocumentVO.create('11111111111111')).toThrow(ValidationError)
      })
    })

    describe('empty documents', () => {
      it('should create empty document', () => {
        const doc = DocumentVO.create('')

        expect(doc.value).toBeUndefined()
        expect(doc.type).toBe(DocumentType.NONE)
        expect(doc.formatted).toBeUndefined()
        expect(doc.hasDocument).toBe(false)
      })

      it('should create empty document from undefined', () => {
        const doc = DocumentVO.create(undefined)

        expect(doc.value).toBeUndefined()
        expect(doc.type).toBe(DocumentType.NONE)
        expect(doc.formatted).toBeUndefined()
      })
    })

    describe('serialization', () => {
      it('should serialize to JSON', () => {
        const doc = DocumentVO.create('11144477735')
        const json = doc.toJSON()

        expect(json).toEqual({
          value: '11144477735',
          type: DocumentType.CPF,
          formatted: '111.444.777-35',
        })
      })

      it('should deserialize from JSON', () => {
        const json = {
          value: '11144477735',
          type: DocumentType.CPF,
          formatted: '111.444.777-35',
          isValid: true,
        }

        const doc = DocumentVO.fromJSON(json)

        expect(doc.value).toBe('11144477735')
        expect(doc.type).toBe(DocumentType.CPF)
        expect(doc.formatted).toBe('111.444.777-35')
      })

      it('should handle legacy string format', () => {
        const doc = DocumentVO.create('11144477735')

        expect(doc.value).toBe('11144477735')
        expect(doc.type).toBe(DocumentType.CPF)
      })
    })
  })

  describe('CNPJVO', () => {
    it('should create valid CNPJ', () => {
      const cnpj = new CNPJVO('11222333000181')

      expect(cnpj.value).toBe('11222333000181')
      expect(cnpj.formatted).toBe('11.222.333/0001-81')
    })

    it('should create CNPJ with formatting', () => {
      const cnpj = new CNPJVO('11.222.333/0001-81')

      expect(cnpj.value).toBe('11222333000181')
      expect(cnpj.formatted).toBe('11.222.333/0001-81')
    })

    it('should throw error for invalid CNPJ', () => {
      expect(() => new CNPJVO('12345678901234')).toThrow(ValidationError)
      expect(() => new CNPJVO('11111111111111')).toThrow(ValidationError)
      expect(() => new CNPJVO('')).toThrow(ValidationError)
    })

    it('should serialize to JSON', () => {
      const cnpj = new CNPJVO('11222333000181')
      const json = cnpj.toJSON()

      expect(json).toBe('11222333000181')
    })

    it('should deserialize from JSON', () => {
      const cnpj = CNPJVO.fromJSON('11222333000181')

      expect(cnpj.value).toBe('11222333000181')
      expect(cnpj.formatted).toBe('11.222.333/0001-81')
    })

    it('should handle legacy string format', () => {
      const cnpj = CNPJVO.fromJSON('11222333000181')

      expect(cnpj.value).toBe('11222333000181')
      expect(cnpj.formatted).toBe('11.222.333/0001-81')
    })
  })

  describe('DocumentType enum', () => {
    it('should have correct document type values', () => {
      expect(DocumentType.CPF).toBe('cpf')
      expect(DocumentType.CNPJ).toBe('cnpj')
      expect(DocumentType.NONE).toBe('none')
    })
  })
})

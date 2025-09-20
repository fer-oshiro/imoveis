import { ContractTermsVO } from '../../vo/contract-terms.vo'

describe('ContractTermsVO', () => {
  const validTermsData = {
    monthlyRent: 1500,
    paymentDueDay: 5,
    securityDeposit: 3000,
    utilitiesIncluded: true,
    cleaningServiceIncluded: false,
    internetIncluded: true,
    additionalTerms: 'No pets allowed',
    renewalTerms: 'Automatic renewal unless 30 days notice',
  }

  describe('constructor', () => {
    it('should create contract terms with valid data', () => {
      const terms = new ContractTermsVO(validTermsData)

      expect(terms.monthlyRent).toBe(1500)
      expect(terms.paymentDueDay).toBe(5)
      expect(terms.securityDeposit).toBe(3000)
      expect(terms.utilitiesIncluded).toBe(true)
      expect(terms.cleaningServiceIncluded).toBe(false)
      expect(terms.internetIncluded).toBe(true)
      expect(terms.additionalTerms).toBe('No pets allowed')
      expect(terms.renewalTerms).toBe('Automatic renewal unless 30 days notice')
    })

    it('should work without optional fields', () => {
      const minimalTerms = {
        monthlyRent: 1200,
        paymentDueDay: 10,
        utilitiesIncluded: false,
        cleaningServiceIncluded: false,
        internetIncluded: false,
      }

      const terms = new ContractTermsVO(minimalTerms)

      expect(terms.monthlyRent).toBe(1200)
      expect(terms.paymentDueDay).toBe(10)
      expect(terms.securityDeposit).toBeUndefined()
      expect(terms.additionalTerms).toBeUndefined()
      expect(terms.renewalTerms).toBeUndefined()
    })
  })

  describe('validation', () => {
    it('should throw error for zero or negative monthly rent', () => {
      expect(() => new ContractTermsVO({ ...validTermsData, monthlyRent: 0 })).toThrow(
        'Monthly rent must be greater than 0',
      )

      expect(() => new ContractTermsVO({ ...validTermsData, monthlyRent: -100 })).toThrow(
        'Monthly rent must be greater than 0',
      )
    })

    it('should throw error for invalid payment due day', () => {
      expect(() => new ContractTermsVO({ ...validTermsData, paymentDueDay: 0 })).toThrow(
        'Payment due day must be between 1 and 31',
      )

      expect(() => new ContractTermsVO({ ...validTermsData, paymentDueDay: 32 })).toThrow(
        'Payment due day must be between 1 and 31',
      )
    })

    it('should throw error for negative security deposit', () => {
      expect(() => new ContractTermsVO({ ...validTermsData, securityDeposit: -100 })).toThrow(
        'Security deposit cannot be negative',
      )
    })

    it('should allow zero security deposit', () => {
      expect(() => new ContractTermsVO({ ...validTermsData, securityDeposit: 0 })).not.toThrow()
    })
  })

  describe('static methods', () => {
    it('should create instance using static create method', () => {
      const terms = ContractTermsVO.create(validTermsData)
      expect(terms).toBeInstanceOf(ContractTermsVO)
      expect(terms.monthlyRent).toBe(1500)
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const terms = new ContractTermsVO(validTermsData)
      const json = terms.toJSON()

      expect(json.monthlyRent).toBe(1500)
      expect(json.paymentDueDay).toBe(5)
      expect(json.securityDeposit).toBe(3000)
      expect(json.utilitiesIncluded).toBe(true)
      expect(json.cleaningServiceIncluded).toBe(false)
      expect(json.internetIncluded).toBe(true)
      expect(json.additionalTerms).toBe('No pets allowed')
      expect(json.renewalTerms).toBe('Automatic renewal unless 30 days notice')
    })

    it('should deserialize from JSON correctly', () => {
      const originalTerms = new ContractTermsVO(validTermsData)
      const json = originalTerms.toJSON()
      const deserializedTerms = ContractTermsVO.fromJSON(json)

      expect(deserializedTerms.monthlyRent).toBe(originalTerms.monthlyRent)
      expect(deserializedTerms.paymentDueDay).toBe(originalTerms.paymentDueDay)
      expect(deserializedTerms.securityDeposit).toBe(originalTerms.securityDeposit)
      expect(deserializedTerms.utilitiesIncluded).toBe(originalTerms.utilitiesIncluded)
      expect(deserializedTerms.cleaningServiceIncluded).toBe(originalTerms.cleaningServiceIncluded)
      expect(deserializedTerms.internetIncluded).toBe(originalTerms.internetIncluded)
      expect(deserializedTerms.additionalTerms).toBe(originalTerms.additionalTerms)
      expect(deserializedTerms.renewalTerms).toBe(originalTerms.renewalTerms)
    })

    it('should handle missing optional fields in JSON', () => {
      const minimalJson = {
        monthlyRent: 1000,
        paymentDueDay: 15,
        utilitiesIncluded: true,
        cleaningServiceIncluded: true,
        internetIncluded: false,
      }

      const terms = ContractTermsVO.fromJSON(minimalJson)

      expect(terms.monthlyRent).toBe(1000)
      expect(terms.paymentDueDay).toBe(15)
      expect(terms.securityDeposit).toBeUndefined()
      expect(terms.additionalTerms).toBeUndefined()
      expect(terms.renewalTerms).toBeUndefined()
    })

    it('should handle type conversion from JSON', () => {
      const jsonWithStrings = {
        monthlyRent: '1500',
        paymentDueDay: '5',
        securityDeposit: '3000',
        utilitiesIncluded: true,
        cleaningServiceIncluded: false,
        internetIncluded: true,
      }

      const terms = ContractTermsVO.fromJSON(jsonWithStrings)

      expect(terms.monthlyRent).toBe(1500)
      expect(terms.paymentDueDay).toBe(5)
      expect(terms.securityDeposit).toBe(3000)
    })
  })
})

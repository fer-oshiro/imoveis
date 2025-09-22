import { Contract } from '../../entities/contract.entity'
import { ContractStatus } from '../../vo/contract-enums.vo'
import { ValidationError } from '../../../shared/errors/domain-error'

// @ts-ignore - Test file with potential typing issues

describe('Contract Entity', () => {
  const validData = {
    contractId: 'CON_123',
    apartmentUnitCode: 'A101',
    tenantPhoneNumber: '+5511987654321',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    terms: {
      monthlyRent: 2000,
      paymentDueDay: 15,
      utilitiesIncluded: false,
      cleaningServiceIncluded: false,
      internetIncluded: false,
    },
    createdBy: 'test-user',
  }

  describe('create', () => {
    it('should create a valid contract', () => {
      const contract = Contract.create(validData)

      expect(contract.apartmentUnitCodeValue).toBe('A101')
      expect(contract.tenantPhoneNumberValue).toBe('+5511987654321')
      expect(contract.startDateValue).toEqual(new Date('2024-01-01'))
      expect(contract.endDateValue).toEqual(new Date('2025-12-31'))
      expect(contract.termsValue.monthlyRent).toBe(2000)
      expect(contract.termsValue.paymentDueDay).toBe(15)
      expect(contract.statusValue).toBe(ContractStatus.PENDING)
    })

    it('should generate correct DynamoDB keys', () => {
      const contract = Contract.create(validData)

      expect(contract.pkValue).toBe('APARTMENT#A101')
      expect(contract.skValue).toBe('CONTRACT#CON_123')
      expect(contract.contractIdValue).toBe('CON_123')
    })

    it('should create contract with custom status', () => {
      const dataWithStatus = {
        ...validData,
        status: ContractStatus.ACTIVE,
      }

      const contract = Contract.create(dataWithStatus)

      expect(contract.statusValue).toBe(ContractStatus.ACTIVE)
    })

    it('should create contract with terms', () => {
      const dataWithTerms = {
        ...validData,
        terms: {
          monthlyRent: 2000,
          paymentDueDay: 15,
          securityDeposit: 2000,
          utilitiesIncluded: true,
          cleaningServiceIncluded: true,
          internetIncluded: false,
          additionalTerms: 'No parties after 10 PM',
        },
      }

      const contract = Contract.create(dataWithTerms)

      expect(contract.termsValue.securityDeposit).toBe(2000)
      expect(contract.termsValue.utilitiesIncluded).toBe(true)
      expect(contract.termsValue.cleaningServiceIncluded).toBe(true)
      expect(contract.termsValue.additionalTerms).toBe('No parties after 10 PM')
    })

    it('should throw error for negative monthly rent', () => {
      const invalidData = {
        ...validData,
        terms: {
          ...validData.terms,
          monthlyRent: -100,
        },
      }

      expect(() => Contract.create(invalidData)).toThrow('Monthly rent must be greater than 0')
    })

    it('should throw error for invalid payment due day', () => {
      const invalidData = {
        ...validData,
        terms: {
          ...validData.terms,
          paymentDueDay: 32, // Invalid day
        },
      }

      expect(() => Contract.create(invalidData)).toThrow('Payment due day must be between 1 and 31')
    })

    it('should throw error for zero payment due day', () => {
      const invalidData = {
        ...validData,
        terms: {
          ...validData.terms,
          paymentDueDay: 0,
        },
      }

      expect(() => Contract.create(invalidData)).toThrow('Payment due day must be between 1 and 31')
    })
  })

  describe('business logic methods', () => {
    let contract: Contract

    beforeEach(() => {
      contract = Contract.create({
        ...validData,
        status: ContractStatus.ACTIVE, // Start with active contract for most tests
      })
    })

    describe('activate', () => {
      it('should activate pending contract', () => {
        const pendingContract = Contract.create(validData) // Default is PENDING
        pendingContract.activate('activator')

        expect(pendingContract.statusValue).toBe(ContractStatus.ACTIVE)
      })

      it('should throw error if contract is not pending', () => {
        expect(() => contract.activate()).toThrow('Only pending contracts can be activated')
      })
    })

    describe('extend', () => {
      it('should extend contract with new end date', () => {
        const newEndDate = new Date('2026-12-31')
        contract.extend(newEndDate, 'extender')

        expect(contract.endDateValue).toEqual(newEndDate)
        expect(contract.statusValue).toBe(ContractStatus.ACTIVE)
      })

      it('should update metadata when extending', () => {
        const originalVersion = contract.metadataValue.version
        contract.extend(new Date('2026-12-31'), 'extender')

        expect(contract.metadataValue.version).toBe(originalVersion + 1)
        expect(contract.metadataValue.updatedBy).toBe('extender')
      })

      it('should throw error if new end date is before current end date', () => {
        const pastDate = new Date('2024-06-01')
        expect(() => contract.extend(pastDate)).toThrow(
          'New end date must be after current end date',
        )
      })

      it('should throw error if contract is not active', () => {
        contract.terminate('terminator')
        expect(() => contract.extend(new Date('2025-12-31'))).toThrow(
          'Only active contracts can be extended',
        )
      })
    })

    describe('terminate', () => {
      it('should terminate active contract', () => {
        contract.terminate('terminator')

        expect(contract.statusValue).toBe(ContractStatus.TERMINATED)
      })

      it('should update metadata when terminating', () => {
        const originalVersion = contract.metadataValue.version
        contract.terminate('terminator')

        expect(contract.metadataValue.version).toBe(originalVersion + 1)
        expect(contract.metadataValue.updatedBy).toBe('terminator')
      })

      it('should throw error if not active', () => {
        contract.terminate('terminator1')
        expect(() => contract.terminate('terminator2')).toThrow(
          'Only active contracts can be terminated',
        )
      })
    })

    describe('expire', () => {
      it('should expire active contract', () => {
        contract.expire('system')

        expect(contract.statusValue).toBe(ContractStatus.EXPIRED)
      })

      it('should update metadata when expiring', () => {
        const originalVersion = contract.metadataValue.version
        contract.expire('system')

        expect(contract.metadataValue.version).toBe(originalVersion + 1)
        expect(contract.metadataValue.updatedBy).toBe('system')
      })

      it('should throw error if not active', () => {
        contract.expire('system')
        expect(() => contract.expire('system')).toThrow('Only active contracts can expire')
      })

      it('should throw error if terminated', () => {
        contract.terminate('terminator')
        expect(() => contract.expire('system')).toThrow('Only active contracts can expire')
      })
    })

    describe('updateTerms', () => {
      it('should update contract terms', () => {
        const newTerms = {
          monthlyRent: 2200,
          paymentDueDay: 20,
          utilitiesIncluded: true,
          cleaningServiceIncluded: true,
          internetIncluded: true,
        }
        contract.updateTerms(newTerms, 'updater')

        expect(contract.termsValue.monthlyRent).toBe(2200)
        expect(contract.termsValue.paymentDueDay).toBe(20)
        expect(contract.termsValue.utilitiesIncluded).toBe(true)
      })

      it('should update metadata when updating terms', () => {
        const originalVersion = contract.metadataValue.version
        const newTerms = {
          monthlyRent: 2200,
          paymentDueDay: 15,
          utilitiesIncluded: false,
          cleaningServiceIncluded: false,
          internetIncluded: false,
        }
        contract.updateTerms(newTerms, 'updater')

        expect(contract.metadataValue.version).toBe(originalVersion + 1)
        expect(contract.metadataValue.updatedBy).toBe('updater')
      })
    })

    describe('status checks', () => {
      it('should check if contract is active', () => {
        expect(contract.isActive()).toBe(true)

        contract.terminate('terminator')
        expect(contract.isActive()).toBe(false)
      })

      it('should check if contract is terminated', () => {
        expect(contract.isTerminated()).toBe(false)

        contract.terminate('terminator')
        expect(contract.isTerminated()).toBe(true)
      })

      it('should check if contract is expired', () => {
        expect(contract.isExpired()).toBe(false)

        contract.expire('system')
        expect(contract.isExpired()).toBe(true)
      })

      it('should check if contract is pending', () => {
        const pendingContract = Contract.create(validData) // Default is PENDING

        expect(pendingContract.isPending()).toBe(true)
        expect(contract.isPending()).toBe(false)
      })
    })

    describe('date calculations', () => {
      it('should calculate remaining days', () => {
        const futureEndDate = new Date()
        futureEndDate.setDate(futureEndDate.getDate() + 30)

        const futureContract = Contract.create({
          ...validData,
          endDate: futureEndDate,
        })

        expect(futureContract.getRemainingDays()).toBe(30)
      })

      it('should return 0 for expired contracts', () => {
        const pastEndDate = new Date()
        pastEndDate.setDate(pastEndDate.getDate() - 10)

        const expiredContract = Contract.create({
          ...validData,
          endDate: pastEndDate,
        })

        expect(expiredContract.getRemainingDays()).toBe(0)
      })

      it('should check if contract has expired', () => {
        const pastEndDate = new Date()
        pastEndDate.setDate(pastEndDate.getDate() - 1)

        const expiredContract = Contract.create({
          ...validData,
          endDate: pastEndDate,
        })

        expect(expiredContract.isExpired()).toBe(true)
        expect(contract.isExpired()).toBe(false)
      })

      it('should get contract duration in months', () => {
        expect(contract.getDurationInMonths()).toBe(25) // Jan 1 2024 to Dec 31 2025 (using 30-day approximation)
      })
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const contract = Contract.create(validData)
      const json = contract.toJSON()

      expect(json.contractId).toBe('CON_123')
      expect(json.apartmentUnitCode).toBe('A101')
      expect(json.tenantPhoneNumber).toBe('+5511987654321')
      expect(json.startDate).toBe('2024-01-01T00:00:00.000Z')
      expect(json.endDate).toBe('2025-12-31T00:00:00.000Z')
      expect(json.status).toBe(ContractStatus.PENDING)
      expect(json.terms).toBeDefined()
      expect(json.createdAt).toBeDefined()
      expect(json.updatedAt).toBeDefined()
    })

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        pk: 'APARTMENT#A101',
        sk: 'CONTRACT#CON_123',
        contractId: 'CON_123',
        apartmentUnitCode: 'A101',
        tenantPhoneNumber: '+5511987654321',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2025-12-31T00:00:00.000Z',
        status: ContractStatus.ACTIVE,
        terms: {
          monthlyRent: 2000,
          paymentDueDay: 15,
          utilitiesIncluded: false,
          cleaningServiceIncluded: false,
          internetIncluded: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      }

      const contract = Contract.fromJSON(jsonData)

      expect(contract.contractIdValue).toBe('CON_123')
      expect(contract.apartmentUnitCodeValue).toBe('A101')
      expect(contract.tenantPhoneNumberValue).toBe('+5511987654321')
      expect(contract.startDateValue).toEqual(new Date('2024-01-01'))
      expect(contract.endDateValue).toEqual(new Date('2025-12-31'))
      expect(contract.statusValue).toBe(ContractStatus.ACTIVE)
      expect(contract.termsValue.monthlyRent).toBe(2000)
      expect(contract.termsValue.paymentDueDay).toBe(15)
    })
  })
})

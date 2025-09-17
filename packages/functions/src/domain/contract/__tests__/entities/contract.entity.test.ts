import { Contract } from '../../entities/contract.entity'
import { ContractStatus } from '../../vo/contract-enums.vo'
import { ContractTerms } from '../../vo/contract-terms.vo'

describe('Contract Entity', () => {
  const mockTerms: ContractTerms = {
    monthlyRent: 1500,
    paymentDueDay: 5,
    securityDeposit: 3000,
    utilitiesIncluded: true,
    cleaningServiceIncluded: false,
    internetIncluded: true,
    additionalTerms: 'No pets allowed',
  }

  const mockContractData = {
    contractId: 'TEST-001',
    apartmentUnitCode: 'APT-101',
    tenantPhoneNumber: '+5511999999999',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    terms: mockTerms,
    createdBy: 'admin',
  }

  describe('create', () => {
    it('should create a contract with valid data', () => {
      const contract = Contract.create(mockContractData)

      expect(contract.contractIdValue).toBe('TEST-001')
      expect(contract.apartmentUnitCodeValue).toBe('APT-101')
      expect(contract.tenantPhoneNumberValue).toBe('+5511999999999')
      expect(contract.statusValue).toBe(ContractStatus.PENDING)
      expect(contract.termsValue.monthlyRent).toBe(1500)
    })

    it('should set default status to PENDING', () => {
      const contract = Contract.create(mockContractData)
      expect(contract.statusValue).toBe(ContractStatus.PENDING)
    })

    it('should use provided status', () => {
      const contract = Contract.create({
        ...mockContractData,
        status: ContractStatus.ACTIVE,
      })
      expect(contract.statusValue).toBe(ContractStatus.ACTIVE)
    })
  })

  describe('business methods', () => {
    let contract: Contract

    beforeEach(() => {
      contract = Contract.create(mockContractData)
    })

    describe('activate', () => {
      it('should activate a pending contract', () => {
        contract.activate('admin')
        expect(contract.statusValue).toBe(ContractStatus.ACTIVE)
      })

      it('should throw error if contract is not pending', () => {
        contract.activate('admin')
        expect(() => contract.activate('admin')).toThrow('Only pending contracts can be activated')
      })
    })

    describe('terminate', () => {
      it('should terminate an active contract', () => {
        contract.activate('admin')
        contract.terminate('admin')
        expect(contract.statusValue).toBe(ContractStatus.TERMINATED)
      })

      it('should throw error if contract is not active', () => {
        expect(() => contract.terminate('admin')).toThrow('Only active contracts can be terminated')
      })
    })

    describe('extend', () => {
      it('should extend an active contract', () => {
        contract.activate('admin')
        const newEndDate = new Date('2025-06-30')
        contract.extend(newEndDate, 'admin')
        expect(contract.endDateValue).toEqual(newEndDate)
      })

      it('should throw error if new end date is not after current end date', () => {
        contract.activate('admin')
        const pastDate = new Date('2023-12-31')
        expect(() => contract.extend(pastDate, 'admin')).toThrow(
          'New end date must be after current end date',
        )
      })

      it('should throw error if contract is not active', () => {
        const newEndDate = new Date('2025-06-30')
        expect(() => contract.extend(newEndDate, 'admin')).toThrow(
          'Only active contracts can be extended',
        )
      })
    })
  })

  describe('utility methods', () => {
    let contract: Contract

    beforeEach(() => {
      contract = Contract.create(mockContractData)
    })

    describe('getDurationInMonths', () => {
      it('should calculate duration in months', () => {
        const duration = contract.getDurationInMonths()
        expect(duration).toBe(13) // From Jan 1 to Dec 31 (365 days / 30 = ~12.17, rounded up to 13)
      })
    })

    describe('getRemainingDays', () => {
      it('should return 0 for expired contracts', () => {
        const expiredContract = Contract.create({
          ...mockContractData,
          endDate: new Date('2020-12-31'),
        })
        expect(expiredContract.getRemainingDays()).toBe(0)
      })

      it('should calculate remaining days for future contracts', () => {
        const futureEndDate = new Date()
        futureEndDate.setDate(futureEndDate.getDate() + 30)

        const futureContract = Contract.create({
          ...mockContractData,
          endDate: futureEndDate,
        })

        expect(futureContract.getRemainingDays()).toBe(30)
      })
    })

    describe('status checks', () => {
      it('should correctly identify pending contracts', () => {
        expect(contract.isPending()).toBe(true)
        expect(contract.isActive()).toBe(false)
      })

      it('should correctly identify active contracts', () => {
        contract.activate('admin')
        expect(contract.isActive()).toBe(true)
        expect(contract.isPending()).toBe(false)
      })

      it('should correctly identify terminated contracts', () => {
        contract.activate('admin')
        contract.terminate('admin')
        expect(contract.isTerminated()).toBe(true)
        expect(contract.isActive()).toBe(false)
      })
    })
  })

  describe('serialization', () => {
    it('should serialize to JSON correctly', () => {
      const contract = Contract.create(mockContractData)
      const json = contract.toJSON()

      expect(json.contractId).toBe('TEST-001')
      expect(json.apartmentUnitCode).toBe('APT-101')
      expect(json.status).toBe(ContractStatus.PENDING)
      expect(json.terms.monthlyRent).toBe(1500)
    })

    it('should deserialize from JSON correctly', () => {
      const contract = Contract.create(mockContractData)
      const json = contract.toJSON()
      const deserializedContract = Contract.fromJSON(json)

      expect(deserializedContract.contractIdValue).toBe(contract.contractIdValue)
      expect(deserializedContract.apartmentUnitCodeValue).toBe(contract.apartmentUnitCodeValue)
      expect(deserializedContract.statusValue).toBe(contract.statusValue)
      expect(deserializedContract.termsValue.monthlyRent).toBe(contract.termsValue.monthlyRent)
    })
  })
})

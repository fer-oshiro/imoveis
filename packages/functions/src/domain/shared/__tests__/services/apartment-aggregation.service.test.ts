import { ApartmentAggregationService } from '../../services/apartment-aggregation.service'
import { Apartment } from '../../../apartment/entities/apartment.entity'
import { User } from '../../../user/entities/user.entity'
import { Payment } from '../../../payment/entities/payment.entity'
import { Contract } from '../../../contract/entities/contract.entity'
import { UserApartmentRelation } from '../../../relationship/entities/user-apartment-relation.entity'
import { ApartmentStatus, RentalType } from '../../../apartment/vo/apartment-enums.vo'
import { UserRole } from '../../../relationship/vo/user-role.vo'
import { ContractStatus } from '../../../contract/vo/contract-enums.vo'
import { PaymentStatus } from '../../../payment/vo/payment-enums.vo'
import { DomainError } from '../../errors/domain-error'

describe('ApartmentAggregationService', () => {
  let mockApartment: Apartment
  let mockUser: User
  let mockPayments: Payment[]
  let mockContracts: Contract[]
  let mockRelations: UserApartmentRelation[]

  beforeEach(() => {
    mockApartment = Apartment.create({
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: 'Test Street, Test City',
      baseRent: 1000,
      contactPhone: '+5511999999999',
      status: ApartmentStatus.OCCUPIED,
      rentalType: RentalType.LONG_TERM,
    })

    mockUser = User.create({
      phoneNumber: '+5511999999999',
      name: 'Test User',
      document: '11144477735', // Valid CPF
    })

    const baseDate = new Date('2024-01-01')
    const paidPayment = Payment.create({
      paymentId: 'payment-1',
      apartmentUnitCode: 'A101',
      userPhoneNumber: '+5511999999999',
      amount: 1000,
      dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      contractId: 'contract-1',
    })
    paidPayment.submitProof('proof-key-1', new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000))

    mockPayments = [
      paidPayment,
      Payment.create({
        paymentId: 'payment-2',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        amount: 1000,
        dueDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        contractId: 'contract-1',
        status: PaymentStatus.PENDING,
      }),
    ]

    mockContracts = [
      Contract.create({
        contractId: 'contract-1',
        apartmentUnitCode: 'A101',
        tenantPhoneNumber: '+5511999999999',
        startDate: baseDate,
        endDate: new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        terms: {
          monthlyRent: 1000,
          paymentDueDay: 5,
          utilitiesIncluded: false,
          cleaningServiceIncluded: false,
          internetIncluded: false,
        },
        status: ContractStatus.ACTIVE,
      }),
    ]

    mockRelations = [
      UserApartmentRelation.create({
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        role: UserRole.PRIMARY_TENANT,
      }),
    ]
  })

  describe('aggregateApartmentWithPaymentInfo', () => {
    it('should aggregate apartment with payment information', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentWithPaymentInfo(
        mockApartment,
        mockPayments,
      )

      expect(result.apartment).toBe(mockApartment)
      expect(result.lastPayment).toBeDefined()
      expect(result.totalPayments).toBe(2)
      expect(result.totalPaidAmount).toBe(1000)
      expect(result.totalPendingAmount).toBe(1000)
      expect(result.paymentStatus).toBeDefined()
    })

    it('should handle apartment with no payments', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentWithPaymentInfo(
        mockApartment,
        [],
      )

      expect(result.apartment).toBe(mockApartment)
      expect(result.lastPayment).toBeUndefined()
      expect(result.totalPayments).toBe(0)
      expect(result.totalPaidAmount).toBe(0)
      expect(result.totalPendingAmount).toBe(0)
      expect(result.paymentStatus.status).toBe('no_payments')
    })

    it('should filter payments by apartment unit code', async () => {
      const otherApartmentPayment = Payment.create({
        paymentId: 'payment-other',
        apartmentUnitCode: 'B102',
        userPhoneNumber: '+5511999999999',
        amount: 500,
        dueDate: new Date(),
        contractId: 'contract-2',
      })

      const allPayments = [...mockPayments, otherApartmentPayment]
      const result = await ApartmentAggregationService.aggregateApartmentWithPaymentInfo(
        mockApartment,
        allPayments,
      )

      expect(result.totalPayments).toBe(2) // Only payments for A101
      expect(result.totalPaidAmount).toBe(1000)
    })
  })

  describe('aggregateApartmentDetails', () => {
    it('should aggregate apartment details with users, contracts, and payments', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        mockApartment,
        [mockUser],
        mockRelations,
        mockContracts,
        mockPayments,
      )

      expect(result.apartment).toBe(mockApartment)
      expect(result.users).toHaveLength(1)
      expect(result.users[0].user).toBe(mockUser)
      expect(result.users[0].role).toBe(UserRole.PRIMARY_TENANT)
      expect(result.activeContract).toBeDefined()
      expect(result.contractHistory).toHaveLength(1)
      expect(result.recentPayments).toHaveLength(2)
      expect(result.paymentSummary).toBeDefined()
    })

    it('should handle apartment with no related data', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        mockApartment,
        [],
        [],
        [],
        [],
      )

      expect(result.apartment).toBe(mockApartment)
      expect(result.users).toHaveLength(0)
      expect(result.activeContract).toBeUndefined()
      expect(result.contractHistory).toHaveLength(0)
      expect(result.recentPayments).toHaveLength(0)
    })

    it('should limit recent payments to 10', async () => {
      const manyPayments = Array.from({ length: 15 }, (_, i) =>
        Payment.create({
          paymentId: `payment-${i}`,
          apartmentUnitCode: 'A101',
          userPhoneNumber: '+5511999999999',
          amount: 1000,
          dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          contractId: 'contract-1',
        }),
      )

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        mockApartment,
        [mockUser],
        mockRelations,
        mockContracts,
        manyPayments,
      )

      expect(result.recentPayments).toHaveLength(10)
    })
  })

  describe('aggregateApartmentLog', () => {
    it('should aggregate apartment log with timeline and statistics', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentLog(
        mockApartment,
        mockContracts,
        mockPayments,
        mockRelations,
      )

      expect(result.apartment).toBe(mockApartment)
      expect(result.contracts).toHaveLength(1)
      expect(result.payments).toHaveLength(2)
      expect(result.timeline).toHaveLength(3) // contract start + payment + user added
      expect(result.statistics).toBeDefined()
      expect(result.statistics.totalContracts).toBe(1)
      expect(result.statistics.totalPayments).toBe(2)
      expect(result.statistics.totalRevenue).toBe(1000) // Only paid payment
    })

    it('should sort contracts and payments by date', async () => {
      const olderContract = Contract.create({
        contractId: 'contract-old',
        apartmentUnitCode: 'A101',
        tenantPhoneNumber: '+5511999999999',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        terms: {
          monthlyRent: 900,
          paymentDueDay: 5,
          utilitiesIncluded: false,
          cleaningServiceIncluded: false,
          internetIncluded: false,
        },
        status: ContractStatus.TERMINATED,
      })

      const allContracts = [olderContract, ...mockContracts]
      const result = await ApartmentAggregationService.aggregateApartmentLog(
        mockApartment,
        allContracts,
        mockPayments,
        mockRelations,
      )

      expect(result.contracts[0].startDateValue.getTime()).toBeGreaterThan(
        result.contracts[1].startDateValue.getTime(),
      )
    })
  })

  describe('aggregateApartmentListing', () => {
    it('should aggregate apartment listing for landing page', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentListing(mockApartment)

      expect(result.apartment).toBe(mockApartment)
      expect(result.images).toEqual(mockApartment.imagesValue)
      expect(result.isAvailable).toBe(mockApartment.isAvailableValue)
      expect(result.priceRange).toEqual({
        min: mockApartment.baseRentValue,
        max: mockApartment.baseRentValue + mockApartment.cleaningFeeValue,
      })
      expect(result.features).toBeDefined()
      expect(result.location).toBeDefined()
    })
  })

  describe('aggregateApartmentsWithPaymentInfo', () => {
    it('should aggregate multiple apartments with payment info', async () => {
      const apartment2 = Apartment.create({
        unitCode: 'B102',
        unitLabel: 'Apartment 102',
        address: 'Another Street, Test City',
        baseRent: 1200,
        contactPhone: '+5511888888888',
      })

      const apartments = [mockApartment, apartment2]
      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        apartments,
        mockPayments,
      )

      expect(result).toHaveLength(2)
      expect(result[0].apartment.unitCodeValue).toBe('A101') // Sorted by unit code
      expect(result[1].apartment.unitCodeValue).toBe('B102')
    })
  })

  describe('aggregateApartmentStatistics', () => {
    it('should aggregate apartment statistics', async () => {
      const apartments = [
        mockApartment,
        Apartment.create({
          unitCode: 'B102',
          unitLabel: 'Apartment 102',
          address: 'Another Street',
          baseRent: 1200,
          contactPhone: '+5511888888888',
          status: ApartmentStatus.AVAILABLE,
        }),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentStatistics(
        apartments,
        mockPayments,
      )

      expect(result.totalApartments).toBe(2)
      expect(result.occupiedApartments).toBe(1)
      expect(result.availableApartments).toBe(1)
      expect(result.occupancyRate).toBe(50)
      expect(result.averageRent).toBe(1100)
    })

    it('should handle empty apartments array', async () => {
      const result = await ApartmentAggregationService.aggregateApartmentStatistics([], [])

      expect(result.totalApartments).toBe(0)
      expect(result.occupancyRate).toBe(0)
      expect(result.averageRent).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should handle null apartment gracefully', async () => {
      // The service should handle null apartments gracefully
      const invalidApartment = null as any

      const result = await ApartmentAggregationService.aggregateApartmentWithPaymentInfo(
        invalidApartment,
        [],
      )

      expect(result.apartment).toBeNull()
      expect(result.totalPayments).toBe(0)
      expect(result.paymentStatus.status).toBe('no_payments')
    })
  })
})

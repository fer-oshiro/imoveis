import { DataMapper } from '../../utils/data-mapper.utils'
import { Apartment } from '../../../apartment/entities/apartment.entity'
import { User } from '../../../user/entities/user.entity'
import { Payment } from '../../../payment/entities/payment.entity'
import { Contract } from '../../../contract/entities/contract.entity'
import { UserApartmentRelation } from '../../../relationship/entities/user-apartment-relation.entity'
import { ApartmentStatus, RentalType } from '../../../apartment/vo/apartment-enums.vo'
import { UserRole } from '../../../relationship/vo/user-role.vo'
import { ContractStatus } from '../../../contract/vo/contract-enums.vo'
import { PaymentStatus } from '../../../payment/vo/payment-enums.vo'
import { ContactMethod } from '../../vo/contact-info.vo'

describe('DataMapper', () => {
  let mockApartment: Apartment
  let mockUser: User
  let mockRelation: UserApartmentRelation
  let mockPayments: Payment[]
  let mockContracts: Contract[]

  beforeEach(() => {
    mockApartment = Apartment.create({
      unitCode: 'A101',
      unitLabel: 'Apartment 101',
      address: 'Test Street, Test Neighborhood, Test City',
      baseRent: 1000,
      contactPhone: '+5511999999999',
      amenities: {
        hasCleaningService: true,
        waterIncluded: true,
        electricityIncluded: false,
      },
    })

    mockUser = User.create({
      phoneNumber: '+5511999999999',
      name: 'Test User',
      document: '11144477735', // Valid CPF
    })

    mockRelation = UserApartmentRelation.create({
      apartmentUnitCode: 'A101',
      userPhoneNumber: '+5511999999999',
      role: UserRole.PRIMARY_TENANT,
      relationshipType: 'tenant',
    })

    const baseDate = new Date('2024-01-01')
    const paidPayment = Payment.create({
      paymentId: 'payment-1',
      apartmentUnitCode: 'A101',
      userPhoneNumber: '+5511999999999',
      amount: 1000,
      dueDate: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days later
      contractId: 'contract-1',
    })
    paidPayment.submitProof('proof-key-1', new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000)) // 25 days later (5 days early)

    mockPayments = [
      paidPayment,
      Payment.create({
        paymentId: 'payment-2',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        amount: 1000,
        dueDate: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days later
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
        endDate: new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year later
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
  })

  describe('mapUserWithRelation', () => {
    it('should map user and relation to UserWithRelation', () => {
      const result = DataMapper.mapUserWithRelation(mockUser, mockRelation)

      expect(result).toEqual({
        user: mockUser,
        role: UserRole.PRIMARY_TENANT,
        relationshipType: 'tenant',
        isActive: true,
        relationshipCreatedAt: mockRelation.metadata.createdAt,
        relationshipUpdatedAt: mockRelation.metadata.updatedAt,
      })
    })
  })

  describe('mapApartmentWithRelation', () => {
    it('should map apartment and relation to ApartmentWithRelation', () => {
      const result = DataMapper.mapApartmentWithRelation(mockApartment, mockRelation)

      expect(result).toEqual({
        apartment: mockApartment,
        role: UserRole.PRIMARY_TENANT,
        relationshipType: 'tenant',
        isActive: true,
        relationshipCreatedAt: mockRelation.metadata.createdAt,
        relationshipUpdatedAt: mockRelation.metadata.updatedAt,
      })
    })
  })

  describe('mapApartmentListing', () => {
    it('should map apartment to ApartmentListing', () => {
      const result = DataMapper.mapApartmentListing(mockApartment)

      expect(result).toEqual({
        apartment: mockApartment,
        images: mockApartment.imagesValue,
        isAvailable: mockApartment.isAvailableValue,
        availableFrom: mockApartment.availableFromValue,
        airbnbLink: mockApartment.airbnbLinkValue,
        priceRange: {
          min: mockApartment.baseRentValue,
          max: mockApartment.baseRentValue + mockApartment.cleaningFeeValue,
        },
        features: ['Cleaning Service', 'Water Included'],
        location: {
          address: 'Test Street, Test Neighborhood, Test City',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
        },
      })
    })

    it('should handle single address part', () => {
      const apartmentWithSimpleAddress = Apartment.create({
        unitCode: 'A102',
        unitLabel: 'Apartment 102',
        address: 'Simple Address',
        baseRent: 1000,
        contactPhone: '+5511999999999',
      })

      const result = DataMapper.mapApartmentListing(apartmentWithSimpleAddress)

      expect(result.location).toEqual({
        address: 'Simple Address',
        neighborhood: undefined,
        city: 'Simple Address',
      })
    })
  })

  describe('calculatePaymentStatus', () => {
    it('should return no_payments for empty array', () => {
      const result = DataMapper.calculatePaymentStatus([])

      expect(result).toEqual({
        status: 'no_payments',
      })
    })

    it('should return current status for payments without overdue', () => {
      // Create a payment from a few days ago
      const oldPayment = Payment.create({
        paymentId: 'payment-old',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        amount: 1000,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        contractId: 'contract-1',
      })
      oldPayment.submitProof('proof-key-old', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3 days ago

      const result = DataMapper.calculatePaymentStatus([oldPayment])

      expect(result.status).toBe('current')
      expect(result.daysSinceLastPayment).toBeGreaterThan(0)
    })

    it('should return overdue status when there are overdue payments', () => {
      // Create an overdue payment
      const overduePayment = Payment.create({
        paymentId: 'payment-overdue',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        amount: 1000,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        contractId: 'contract-1',
        status: PaymentStatus.PENDING,
      })

      const result = DataMapper.calculatePaymentStatus([overduePayment])

      expect(result.status).toBe('overdue')
      expect(result.overdueCount).toBe(1)
      expect(result.totalPendingAmount).toBe(1000)
    })
  })

  describe('createTimelineEvents', () => {
    it('should create timeline events from contracts, payments, and relations', () => {
      const result = DataMapper.createTimelineEvents(mockContracts, mockPayments, [mockRelation])

      expect(result).toHaveLength(3) // 1 contract start + 1 payment (only paid payment has date) + 1 user added
      expect(result.some((e) => e.type === 'payment')).toBe(true)
      expect(result.some((e) => e.type === 'user_added')).toBe(true)
      expect(result.some((e) => e.type === 'contract')).toBe(true)
    })

    it('should sort events by date (most recent first)', () => {
      const result = DataMapper.createTimelineEvents(mockContracts, mockPayments, [mockRelation])

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].date.getTime()).toBeGreaterThanOrEqual(result[i + 1].date.getTime())
      }
    })
  })

  describe('calculateApartmentStatistics', () => {
    it('should calculate statistics for empty contracts', () => {
      const result = DataMapper.calculateApartmentStatistics([])

      expect(result).toEqual({
        totalContracts: 0,
        averageOccupancyDuration: 0,
      })
    })

    it('should calculate statistics for active contracts', () => {
      const result = DataMapper.calculateApartmentStatistics(mockContracts)

      expect(result.totalContracts).toBe(1)
      expect(result.averageOccupancyDuration).toBe(0) // No completed contracts
      expect(result.currentOccupancyDuration).toBeGreaterThan(0)
    })

    it('should calculate average occupancy duration for completed contracts', () => {
      const completedContract = Contract.create({
        contractId: 'contract-completed',
        apartmentUnitCode: 'A101',
        tenantPhoneNumber: '+5511999999999',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
        terms: {
          monthlyRent: 1000,
          paymentDueDay: 5,
          utilitiesIncluded: false,
          cleaningServiceIncluded: false,
          internetIncluded: false,
        },
        status: ContractStatus.TERMINATED,
      })

      const result = DataMapper.calculateApartmentStatistics([completedContract])

      expect(result.totalContracts).toBe(1)
      expect(result.averageOccupancyDuration).toBeGreaterThan(300) // About 364 days
      expect(result.currentOccupancyDuration).toBeUndefined()
    })
  })

  describe('calculateUserPaymentSummary', () => {
    it('should calculate summary for empty payments', () => {
      const result = DataMapper.calculateUserPaymentSummary([])

      expect(result).toEqual({
        totalPayments: 0,
        totalPaidAmount: 0,
        totalPendingAmount: 0,
        averagePaymentDelay: 0,
      })
    })

    it('should calculate summary for user payments', () => {
      const result = DataMapper.calculateUserPaymentSummary(mockPayments)

      expect(result.totalPayments).toBe(2)
      expect(result.totalPaidAmount).toBe(1000)
      expect(result.totalPendingAmount).toBe(1000)
      expect(result.lastPaymentDate).toBeDefined()
      expect(result.averagePaymentDelay).toBe(0) // Payment was made early
    })

    it('should calculate average payment delay correctly', () => {
      const latePayment = Payment.create({
        paymentId: 'payment-late',
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511999999999',
        amount: 1000,
        dueDate: new Date('2024-01-01'),
        contractId: 'contract-1',
      })
      latePayment.submitProof('proof-key-late', new Date('2024-01-06')) // 5 days late

      const result = DataMapper.calculateUserPaymentSummary([latePayment])

      expect(result.averagePaymentDelay).toBe(5)
    })
  })
})

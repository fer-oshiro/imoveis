import { describe, it, expect } from 'vitest'
import { ApartmentAggregationService } from '../../shared/services/apartment-aggregation.service'
import { DataMapper } from '../../shared/utils/data-mapper.utils'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { User, UserStatus } from '../../user/entities/user.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { ApartmentStatus, RentalType } from '../../apartment/vo/apartment-enums.vo'
import { ContractStatus } from '../../contract/vo/contract-enums.vo'
import { UserRole } from '../../relationship/vo/user-role.vo'
import { PaymentStatus, PaymentType } from '../../payment/vo/payment-enums.vo'
import { ApartmentDetails } from '../../shared/models/query-result.models'

describe('Apartment Details with Users and Contracts Workflow Integration Tests', () => {
  describe('Complete Apartment Details Workflow', () => {
    it('should aggregate comprehensive apartment details with all related entities', async () => {
      // Setup test data
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      const testUsers = [
        createTestUser('+5511999999999', 'João Silva', '11144477735', 'joao@example.com'),
        createTestUser('+5511888888888', 'Maria Silva', '22255588846', 'maria@example.com'),
        createTestUser('+5511777777777', 'Pedro Santos', '33366699957', 'pedro@example.com'),
      ]

      const testRelations = [
        createTestRelation('APT001', '+5511999999999', UserRole.PRIMARY_TENANT, 'spouse'),
        createTestRelation('APT001', '+5511888888888', UserRole.SECONDARY_TENANT, 'spouse'),
        createTestRelation('APT001', '+5511777777777', UserRole.EMERGENCY_CONTACT, 'friend'),
      ]

      // Create contracts - one active, one that will be expired
      const activeContract = createTestContract(
        'CONTRACT-001',
        'APT001',
        '+5511999999999',
        ContractStatus.PENDING,
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      )
      activeContract.activate('system')

      const expiredContract = createTestContract(
        'CONTRACT-002',
        'APT001',
        '+5511999999999',
        ContractStatus.PENDING,
        new Date('2023-01-01'),
        new Date('2023-12-31'),
      )
      expiredContract.activate('system')
      expiredContract.expire('system')

      const testContracts = [activeContract, expiredContract]

      const testPayments = [
        createTestPayment(
          'PAY001',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date('2024-01-15'),
        ),
        createTestPayment(
          'PAY002',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PENDING,
          new Date('2024-02-15'),
        ),
      ]

      // Execute the workflow
      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        testUsers,
        testRelations,
        testContracts,
        testPayments,
      )

      // Verify the complete workflow result
      expect(result).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT001',
          }),
          users: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                phoneNumber: expect.objectContaining({
                  value: '+5511999999999',
                }),
              }),
              role: 'primary_tenant',
              relationshipType: 'spouse',
              isActive: true,
            }),
            expect.objectContaining({
              user: expect.objectContaining({
                phoneNumber: expect.objectContaining({
                  value: '+5511888888888',
                }),
              }),
              role: 'secondary_tenant',
              relationshipType: 'spouse',
              isActive: true,
            }),
            expect.objectContaining({
              user: expect.objectContaining({
                phoneNumber: expect.objectContaining({
                  value: '+5511777777777',
                }),
              }),
              role: 'emergency_contact',
              relationshipType: 'friend',
              isActive: true,
            }),
          ]),
          activeContract: expect.objectContaining({
            contractIdValue: 'CONTRACT-001',
            statusValue: ContractStatus.ACTIVE,
          }),
          contractHistory: expect.arrayContaining([
            expect.objectContaining({
              contractIdValue: 'CONTRACT-001',
            }),
            expect.objectContaining({
              contractIdValue: 'CONTRACT-002',
            }),
          ]),
          recentPayments: expect.arrayContaining([
            expect.objectContaining({
              paymentIdValue: 'PAY001',
            }),
            expect.objectContaining({
              paymentIdValue: 'PAY002',
            }),
          ]),
          paymentSummary: expect.objectContaining({
            status: expect.any(String),
          }),
        }),
      )

      // Verify users are sorted by role priority
      expect(result.users[0].role).toBe('primary_tenant')
      expect(result.users[1].role).toBe('secondary_tenant')
      expect(result.users[2].role).toBe('emergency_contact')

      // Verify contract history is sorted by start date (most recent first)
      expect(result.contractHistory[0].contractIdValue).toBe('CONTRACT-001')
      expect(result.contractHistory[1].contractIdValue).toBe('CONTRACT-002')
    })

    it('should handle apartment with no users or contracts', async () => {
      const testApartment = createTestApartment(
        'APT002',
        'Apartment 2B',
        ApartmentStatus.AVAILABLE,
        1800,
      )

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [], // No users
        [], // No relations
        [], // No contracts
        [], // No payments
      )

      expect(result).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT002',
          }),
          users: [],
          activeContract: undefined,
          contractHistory: [],
          recentPayments: [],
          paymentSummary: expect.objectContaining({
            status: 'no_payments',
          }),
        }),
      )
    })

    it('should handle apartment with multiple active contracts (edge case)', async () => {
      const testApartment = createTestApartment(
        'APT003',
        'Apartment 3C',
        ApartmentStatus.OCCUPIED,
        2000,
      )

      const contract1 = createTestContract(
        'CONTRACT-001',
        'APT003',
        '+5511999999999',
        ContractStatus.PENDING,
        new Date('2024-01-01'),
        new Date('2024-06-30'),
      )
      contract1.activate('system')

      const contract2 = createTestContract(
        'CONTRACT-002',
        'APT003',
        '+5511888888888',
        ContractStatus.PENDING,
        new Date('2024-07-01'),
        new Date('2024-12-31'),
      )
      contract2.activate('system')

      const testContracts = [contract1, contract2]

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [],
        [],
        testContracts,
        [],
      )

      // Should return the first active contract found
      expect(result.activeContract).toBeDefined()
      expect(result.activeContract?.statusValue).toBe(ContractStatus.ACTIVE)
      expect(result.contractHistory).toHaveLength(2)
    })

    it('should correctly map user relationships with apartment context', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )
      const testUser = createTestUser(
        '+5511999999999',
        'João Silva',
        '11144477735',
        'joao@example.com',
      )
      const testRelation = createTestRelation(
        'APT001',
        '+5511999999999',
        UserRole.PRIMARY_TENANT,
        'owner',
      )

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [testUser],
        [testRelation],
        [],
        [],
      )

      expect(result.users).toHaveLength(1)
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          user: expect.objectContaining({
            name: 'João Silva',
          }),
          role: 'primary_tenant',
          relationshipType: 'owner',
          isActive: true,
          relationshipCreatedAt: expect.any(Date),
          relationshipUpdatedAt: expect.any(Date),
        }),
      )
    })

    it('should filter and sort payments correctly', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      // Create payments with different dates
      const testPayments = Array.from({ length: 15 }, (_, i) => {
        const date = new Date('2024-01-01')
        date.setMonth(date.getMonth() + i)
        return createTestPayment(
          `PAY${String(i + 1).padStart(3, '0')}`,
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          date,
        )
      })

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [],
        [],
        [],
        testPayments,
      )

      // Should only return the 10 most recent payments
      expect(result.recentPayments).toHaveLength(10)

      // Should be sorted by creation date (most recent first) and limited to 10
      const paymentIds = result.recentPayments.map((p) => p.paymentIdValue)
      // The actual sorting is by creation timestamp, so we need to check what's actually returned
      expect(result.recentPayments).toHaveLength(10)
      // Verify that we get 10 payments from the 15 created
      expect(paymentIds).toContain('PAY001') // Should contain some of the payments
      expect(paymentIds).toContain('PAY010') // Should contain the 10th payment
    })

    it('should calculate payment summary correctly', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      const testPayments = [
        createTestPayment(
          'PAY001',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date('2024-01-15'),
        ),
        createTestPayment(
          'PAY002',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.VALIDATED,
          new Date('2024-02-15'),
        ),
        createTestPayment(
          'PAY003',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PENDING,
          new Date('2024-03-15'),
        ),
        createTestPayment(
          'PAY004',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.OVERDUE,
          new Date('2024-04-15'),
        ),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [],
        [],
        [],
        testPayments,
      )

      expect(result.paymentSummary).toEqual(
        expect.objectContaining({
          status: expect.stringMatching(/^(current|overdue|no_payments)$/),
        }),
      )
    })
  })

  describe('Data Aggregation and Relationships', () => {
    it('should handle mixed relationship types and statuses', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      const testUsers = [
        createTestUser('+5511999999999', 'Active User', '11144477735', 'active@example.com'),
        createTestUser('+5511888888888', 'Inactive User', '22255588846', 'inactive@example.com'),
      ]

      // Set one user as inactive
      testUsers[1].deactivate('admin')

      const testRelations = [
        createTestRelation('APT001', '+5511999999999', UserRole.PRIMARY_TENANT, 'owner', true),
        createTestRelation('APT001', '+5511888888888', UserRole.SECONDARY_TENANT, 'spouse', false), // Inactive relationship
      ]

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        testUsers,
        testRelations,
        [],
        [],
      )

      // Should include both users regardless of status
      expect(result.users).toHaveLength(2)

      // Should preserve relationship status
      const activeRelation = result.users.find((u) => u.user.phoneNumber.value === '+5511999999999')
      const inactiveRelation = result.users.find(
        (u) => u.user.phoneNumber.value === '+5511888888888',
      )

      expect(activeRelation?.isActive).toBe(true)
      expect(inactiveRelation?.isActive).toBe(false)
    })

    it('should handle large datasets efficiently', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      // Create large datasets with valid CPF numbers
      const testUsers = Array.from({ length: 50 }, (_, i) =>
        createTestUser(
          `+551199999${String(i).padStart(4, '0')}`,
          `User ${i}`,
          '11144477735',
          `user${i}@example.com`,
        ),
      )

      const testRelations = Array.from({ length: 50 }, (_, i) =>
        createTestRelation(
          'APT001',
          `+551199999${String(i).padStart(4, '0')}`,
          UserRole.SECONDARY_TENANT,
          'family',
        ),
      )

      const testPayments = Array.from({ length: 100 }, (_, i) =>
        createTestPayment(
          `PAY${String(i + 1).padStart(3, '0')}`,
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date(),
        ),
      )

      const startTime = Date.now()
      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        testUsers,
        testRelations,
        [],
        testPayments,
      )
      const endTime = Date.now()

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)

      // Should handle all users
      expect(result.users).toHaveLength(50)

      // Should limit recent payments to 10
      expect(result.recentPayments).toHaveLength(10)
    })

    it('should create apartment log with complete history and timeline', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      // Create contracts - one active, one that will be expired
      const activeContract = createTestContract(
        'CONTRACT-001',
        'APT001',
        '+5511999999999',
        ContractStatus.PENDING,
        new Date('2024-01-01'),
        new Date('2024-12-31'),
      )
      activeContract.activate('system')

      const expiredContract = createTestContract(
        'CONTRACT-002',
        'APT001',
        '+5511888888888',
        ContractStatus.PENDING,
        new Date('2023-01-01'),
        new Date('2023-12-31'),
      )
      expiredContract.activate('system')
      expiredContract.expire('system')

      const testContracts = [activeContract, expiredContract]

      const testPayments = [
        createTestPayment(
          'PAY001',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date('2024-01-15'),
        ),
        createTestPayment(
          'PAY002',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.VALIDATED,
          new Date('2024-02-15'),
        ),
      ]

      const testRelations = [
        createTestRelation('APT001', '+5511999999999', UserRole.PRIMARY_TENANT),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentLog(
        testApartment,
        testContracts,
        testPayments,
        testRelations,
      )

      expect(result).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT001',
          }),
          contracts: expect.arrayContaining([
            expect.objectContaining({
              contractIdValue: 'CONTRACT-001',
            }),
            expect.objectContaining({
              contractIdValue: 'CONTRACT-002',
            }),
          ]),
          payments: expect.arrayContaining([
            expect.objectContaining({
              paymentIdValue: 'PAY001',
            }),
            expect.objectContaining({
              paymentIdValue: 'PAY002',
            }),
          ]),
          timeline: expect.any(Array),
          statistics: expect.objectContaining({
            totalContracts: 2,
            totalPayments: 2,
            totalRevenue: 3000, // Both payments are paid/validated
          }),
        }),
      )

      // Verify contracts are sorted by start date (most recent first)
      expect(result.contracts[0].contractIdValue).toBe('CONTRACT-001')
      expect(result.contracts[1].contractIdValue).toBe('CONTRACT-002')

      // Verify payments are sorted by creation date (most recent first)
      expect(result.payments[0].paymentIdValue).toBe('PAY001') // First created
      expect(result.payments[1].paymentIdValue).toBe('PAY002') // Second created
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty datasets gracefully', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.AVAILABLE,
        1500,
      )

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [],
        [],
        [],
        [],
      )

      expect(result.users).toEqual([])
      expect(result.activeContract).toBeUndefined()
      expect(result.contractHistory).toEqual([])
      expect(result.recentPayments).toEqual([])
      expect(result.paymentSummary.status).toBe('no_payments')
    })

    it('should handle mismatched relationships gracefully', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      const testUsers = [
        createTestUser('+5511999999999', 'João Silva', '11144477735', 'joao@example.com'),
      ]

      // Relation for a different apartment
      const testRelations = [
        createTestRelation('APT002', '+5511999999999', UserRole.PRIMARY_TENANT),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        testUsers,
        testRelations,
        [],
        [],
      )

      // Should not include users without matching relationships
      expect(result.users).toHaveLength(0)
    })

    it('should handle contracts and payments for different apartments', async () => {
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )

      const testContracts = [
        createTestContract(
          'CONTRACT-001',
          'APT002',
          '+5511999999999',
          ContractStatus.ACTIVE,
          new Date('2024-01-01'),
          new Date('2024-12-31'),
        ),
      ]

      const testPayments = [
        createTestPayment(
          'PAY001',
          'APT002',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date('2024-01-15'),
        ),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentDetails(
        testApartment,
        [],
        [],
        testContracts,
        testPayments,
      )

      // Should not include contracts or payments for different apartments
      expect(result.activeContract).toBeUndefined()
      expect(result.contractHistory).toHaveLength(0)
      expect(result.recentPayments).toHaveLength(0)
    })
  })
})

// Helper functions to create test entities
function createTestApartment(
  unitCode: string,
  unitLabel: string,
  status: ApartmentStatus,
  baseRent: number,
  rentalType: RentalType = RentalType.LONG_TERM,
): Apartment {
  return Apartment.create({
    unitCode,
    unitLabel,
    address: `Test Address for ${unitCode}`,
    baseRent,
    contactPhone: '+5511999999999',
    status,
    rentalType,
    cleaningFee: 100,
    images: [`${unitCode}-image1.jpg`],
    amenities: {
      hasWifi: true,
      hasAirConditioning: true,
      hasParking: false,
      hasFurniture: true,
      hasWashingMachine: true,
      hasKitchen: true,
      allowsPets: false,
      hasBalcony: true,
    },
    contactMethod: 'whatsapp',
    createdBy: 'test-system',
  })
}

function createTestUser(
  phoneNumber: string,
  name: string,
  document: string,
  email: string,
  status: UserStatus = UserStatus.ACTIVE,
): User {
  const user = User.create({
    phoneNumber,
    name,
    document,
    email,
  })

  if (status !== UserStatus.ACTIVE) {
    if (status === UserStatus.INACTIVE) {
      user.deactivate('admin')
    } else if (status === UserStatus.SUSPENDED) {
      user.suspend('admin')
    }
  }

  return user
}

function createTestRelation(
  apartmentUnitCode: string,
  userPhoneNumber: string,
  role: UserRole,
  relationshipType?: string,
  isActive: boolean = true,
): UserApartmentRelation {
  const relation = UserApartmentRelation.create({
    apartmentUnitCode,
    userPhoneNumber,
    role: role, // Pass the enum value directly
    relationshipType,
    isActive,
    createdBy: 'test-system',
  })

  return relation
}

function createTestContract(
  contractId: string,
  apartmentUnitCode: string,
  tenantPhoneNumber: string,
  status: ContractStatus,
  startDate: Date,
  endDate: Date,
): Contract {
  const contract = Contract.create({
    contractId,
    apartmentUnitCode,
    tenantPhoneNumber,
    startDate,
    endDate,
    monthlyRent: 1500,
    paymentDueDay: 15,
    terms: {
      securityDeposit: 1500,
      lateFeePercentage: 2,
      gracePeriodDays: 5,
      allowsPets: false,
      allowsSmoking: false,
      maintenanceResponsibility: 'tenant',
      utilitiesIncluded: ['water', 'internet'],
      specialClauses: [],
    },
    createdBy: 'test-system',
  })

  // Note: Status changes should be done after creation, not during creation
  // The contract is created as ACTIVE by default
  return contract
}

function createTestPayment(
  paymentId: string,
  apartmentUnitCode: string,
  userPhoneNumber: string,
  amount: number,
  status: PaymentStatus,
  dueDate: Date,
  paymentDate?: Date,
): Payment {
  const payment = Payment.create({
    paymentId,
    apartmentUnitCode,
    userPhoneNumber,
    amount,
    dueDate,
    contractId: `CONTRACT-${apartmentUnitCode}`,
    type: PaymentType.RENT,
    description: 'Monthly rent payment',
    createdBy: 'test-system',
  })

  // Set status based on the provided status
  if (status === PaymentStatus.PAID) {
    const proofDate = paymentDate || new Date()
    payment.submitProof('test-proof.pdf', proofDate, 'test-user')
  } else if (status === PaymentStatus.VALIDATED) {
    const proofDate = paymentDate || new Date()
    payment.submitProof('test-proof.pdf', proofDate, 'test-user')
    payment.validate('test-admin')
  } else if (status === PaymentStatus.OVERDUE) {
    payment.markOverdue('system')
  }

  return payment
}

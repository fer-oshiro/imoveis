import { describe, it, expect } from 'vitest'
import { UserAggregationService } from '../../shared/services/user-aggregation.service'
import { User, UserStatus } from '../../user/entities/user.entity'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { UserApartmentRelation } from '../../relationship/entities/user-apartment-relation.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { ApartmentStatus, RentalType } from '../../apartment/vo/apartment-enums.vo'
import { UserRole } from '../../relationship/vo/user-role.vo'
import { PaymentStatus, PaymentType } from '../../payment/vo/payment-enums.vo'

describe('User Details with Relationships Workflow Integration Tests', () => {
  describe('Complete User Details Workflow', () => {
    it('should aggregate comprehensive user details with all relationships and payment history', async () => {
      // Setup test data
      const mainUser = createTestUser(
        '+5511999999999',
        'João Silva',
        '11144477735',
        'joao@example.com',
      )

      const relatedUsers = [
        createTestUser('+5511888888888', 'Maria Silva', '22255588846', 'maria@example.com'),
        createTestUser('+5511777777777', 'Pedro Santos', '33366699957', 'pedro@example.com'),
      ]

      const apartments = [
        createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.OCCUPIED, 1500),
        createTestApartment('APT002', 'Apartment 2B', ApartmentStatus.AVAILABLE, 1800),
      ]

      const userRelations = [
        createTestRelation('APT001', '+5511999999999', UserRole.PRIMARY_TENANT, 'owner'),
        createTestRelation('APT002', '+5511999999999', UserRole.ADMIN, 'property_manager'),
      ]

      const relatedUserRelations = [
        createTestRelation('APT001', '+5511888888888', UserRole.SECONDARY_TENANT, 'spouse'),
        createTestRelation('APT001', '+5511777777777', UserRole.EMERGENCY_CONTACT, 'friend'),
      ]

      const allRelations = [...userRelations, ...relatedUserRelations]

      const payments = [
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
      ]

      // Execute the workflow
      const result = await UserAggregationService.aggregateUserDetails(
        mainUser,
        relatedUsers,
        userRelations,
        relatedUserRelations,
        apartments,
        payments,
        allRelations,
      )

      // Verify the complete workflow result
      expect(result.user.name).toBe('João Silva')
      expect(result.relatedUsers).toHaveLength(2)
      expect(result.apartments).toHaveLength(2)
      expect(result.paymentHistory).toHaveLength(3)
      expect(result.relationships).toHaveLength(2)

      // Verify payment summary
      expect(result.paymentSummary.totalPayments).toBe(3)
      expect(result.paymentSummary.totalPaidAmount).toBe(3000) // PAY001 + PAY002
      expect(result.paymentSummary.totalPendingAmount).toBe(1500) // PAY003
    })

    it('should handle user with no relationships or payments', async () => {
      const isolatedUser = createTestUser(
        '+5511555555555',
        'Isolated User',
        '11144477735',
        'isolated@example.com',
      )

      const result = await UserAggregationService.aggregateUserDetails(
        isolatedUser,
        [],
        [],
        [],
        [],
        [],
        [],
      )

      expect(result.user.name).toBe('Isolated User')
      expect(result.relatedUsers).toEqual([])
      expect(result.apartments).toEqual([])
      expect(result.paymentHistory).toEqual([])
      expect(result.paymentSummary.totalPayments).toBe(0)
      expect(result.relationships).toEqual([])
    })

    it('should aggregate users for apartment with correct role priority sorting', async () => {
      const users = [
        createTestUser('+5511999999999', 'Admin User', '11144477735', 'admin@example.com'),
        createTestUser('+5511888888888', 'Primary Tenant', '11144477735', 'primary@example.com'),
        createTestUser(
          '+5511777777777',
          'Emergency Contact',
          '11144477735',
          'emergency@example.com',
        ),
        createTestUser(
          '+5511666666666',
          'Secondary Tenant',
          '11144477735',
          'secondary@example.com',
        ),
      ]

      const relations = [
        createTestRelation('APT001', '+5511999999999', UserRole.ADMIN),
        createTestRelation('APT001', '+5511888888888', UserRole.PRIMARY_TENANT),
        createTestRelation('APT001', '+5511777777777', UserRole.EMERGENCY_CONTACT),
        createTestRelation('APT001', '+5511666666666', UserRole.SECONDARY_TENANT, 'family'),
      ]

      const result = await UserAggregationService.aggregateUsersForApartment(
        users,
        relations,
        'APT001',
      )

      // Should be sorted by role priority
      expect(result.map((u) => u.role)).toEqual([
        'primary_tenant',
        'secondary_tenant',
        'emergency_contact',
        'admin',
      ])
    })

    it('should find related users through shared apartments', async () => {
      const mainUser = createTestUser(
        '+5511999999999',
        'João Silva',
        '11144477735',
        'joao@example.com',
      )

      const allUsers = [
        mainUser,
        createTestUser('+5511888888888', 'Maria Silva', '11144477735', 'maria@example.com'),
        createTestUser('+5511777777777', 'Pedro Santos', '11144477735', 'pedro@example.com'),
        createTestUser('+5511666666666', 'Ana Costa', '11144477735', 'ana@example.com'),
      ]

      const allRelations = [
        createTestRelation('APT001', '+5511999999999', UserRole.PRIMARY_TENANT),
        createTestRelation('APT001', '+5511888888888', UserRole.SECONDARY_TENANT, 'family'), // Shared apartment
        createTestRelation('APT002', '+5511999999999', UserRole.ADMIN),
        createTestRelation('APT002', '+5511777777777', UserRole.EMERGENCY_CONTACT), // Shared apartment
        createTestRelation('APT003', '+5511666666666', UserRole.PRIMARY_TENANT), // Not shared
      ]

      const result = await UserAggregationService.aggregateRelatedUsers(
        mainUser,
        allUsers,
        allRelations,
      )

      expect(result).toHaveLength(2)
      expect(result.map((u) => u.user.name)).toEqual(
        expect.arrayContaining(['Maria Silva', 'Pedro Santos']),
      )
      expect(result.map((u) => u.user.name)).not.toContain('Ana Costa')
    })

    it('should find potential related users based on name similarity', async () => {
      const mainUser = createTestUser(
        '+5511999999999',
        'João Silva Santos',
        '11144477735',
        'joao@example.com',
      )

      const allUsers = [
        mainUser,
        createTestUser('+5511888888888', 'Maria Silva Costa', '11144477735', 'maria@example.com'), // Shares "Silva"
        createTestUser('+5511777777777', 'Pedro Santos Lima', '11144477735', 'pedro@example.com'), // Shares "Santos"
        createTestUser('+5511666666666', 'Ana Costa Oliveira', '11144477735', 'ana@example.com'), // No shared names
        createTestUser('+5511555555555', 'Carlos Silva', '11144477735', 'carlos@example.com'), // Shares "Silva"
      ]

      const allRelations: UserApartmentRelation[] = [] // No shared apartments

      const result = await UserAggregationService.findPotentialRelatedUsers(
        mainUser,
        allUsers,
        allRelations,
      )

      expect(result).toHaveLength(3)
      expect(result.map((u) => u.name)).toEqual(
        expect.arrayContaining(['Maria Silva Costa', 'Pedro Santos Lima', 'Carlos Silva']),
      )
      expect(result.map((u) => u.name)).not.toContain('Ana Costa Oliveira')
    })

    it('should handle large datasets efficiently', async () => {
      const mainUser = createTestUser(
        '+5511999999999',
        'Main User',
        '11144477735',
        'main@example.com',
      )

      // Create large datasets with valid CPF
      const relatedUsers = Array.from({ length: 50 }, (_, i) =>
        createTestUser(
          `+551188888${String(i).padStart(4, '0')}`,
          `User ${i}`,
          '11144477735',
          `user${i}@example.com`,
        ),
      )

      const userRelations = Array.from({ length: 5 }, (_, i) =>
        createTestRelation(
          `APT${String(i).padStart(3, '0')}`,
          '+5511999999999',
          UserRole.PRIMARY_TENANT,
        ),
      )

      const relatedUserRelations = Array.from({ length: 50 }, (_, i) =>
        createTestRelation(
          `APT${String(i % 5).padStart(3, '0')}`,
          `+551188888${String(i).padStart(4, '0')}`,
          UserRole.SECONDARY_TENANT,
          'family',
        ),
      )

      const apartments = Array.from({ length: 5 }, (_, i) =>
        createTestApartment(
          `APT${String(i).padStart(3, '0')}`,
          `Apartment ${i}`,
          ApartmentStatus.OCCUPIED,
          1500,
        ),
      )

      const payments = Array.from({ length: 100 }, (_, i) =>
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
      const result = await UserAggregationService.aggregateUserDetails(
        mainUser,
        relatedUsers,
        userRelations,
        relatedUserRelations,
        apartments,
        payments,
        [...userRelations, ...relatedUserRelations],
      )
      const endTime = Date.now()

      // Should complete within reasonable time (less than 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000)

      // Should handle all data correctly
      expect(result.user.name).toBe('Main User')
      expect(result.paymentHistory).toHaveLength(100)
      expect(result.relationships).toHaveLength(5)
    })
  })
})

// Helper functions to create test entities
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

function createTestRelation(
  apartmentUnitCode: string,
  userPhoneNumber: string,
  role: UserRole,
  relationshipType?: string,
  isActive: boolean = true,
): UserApartmentRelation {
  return UserApartmentRelation.create({
    apartmentUnitCode,
    userPhoneNumber,
    role: role, // Pass the enum value directly
    relationshipType,
    isActive,
    createdBy: 'test-system',
  })
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

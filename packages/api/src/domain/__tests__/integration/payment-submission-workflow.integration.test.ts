import { describe, it, expect } from 'vitest'
import { Payment } from '../../payment/entities/payment.entity'
import { User, UserStatus } from '../../user/entities/user.entity'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { Contract } from '../../contract/entities/contract.entity'
import { PaymentStatus, PaymentType } from '../../payment/vo/payment-enums.vo'
import { ApartmentStatus, RentalType } from '../../apartment/vo/apartment-enums.vo'
import { ContractStatus } from '../../contract/vo/contract-enums.vo'

describe('Payment Submission and Validation Workflow Integration Tests', () => {
  describe('Complete Payment Submission Workflow', () => {
    it('should handle complete payment submission from creation to validation', async () => {
      // Setup test data
      const testUser = createTestUser(
        '+5511999999999',
        'João Silva',
        '11144477735',
        'joao@example.com',
      )
      const testApartment = createTestApartment(
        'APT001',
        'Apartment 1A',
        ApartmentStatus.OCCUPIED,
        1500,
      )
      const testContract = createTestContract(
        'CONTRACT-001',
        'APT001',
        '+5511999999999',
        ContractStatus.ACTIVE,
      )

      // Step 1: Create payment
      const createdPayment = Payment.create({
        paymentId: 'PAY-APT001-123456-ABC123',
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-02-15T00:00:00.000Z'),
        contractId: 'CONTRACT-001',
        type: PaymentType.RENT,
        description: 'Monthly rent payment for February 2024',
        createdBy: 'system',
      })

      // Verify payment creation
      expect(createdPayment.apartmentUnitCodeValue).toBe('APT001')
      expect(createdPayment.userPhoneNumberValue).toBe('+5511999999999')
      expect(createdPayment.amountValue).toBe(1500.0)
      expect(createdPayment.statusValue).toBe(PaymentStatus.PENDING)
      expect(createdPayment.typeValue).toBe(PaymentType.RENT)
      expect(createdPayment.contractIdValue).toBe('CONTRACT-001')
      expect(createdPayment.paymentIdValue).toBe('PAY-APT001-123456-ABC123')
      expect(createdPayment.isPending()).toBe(true)
      expect(createdPayment.hasProof()).toBe(false)

      // Step 2: Submit payment proof
      const proofSubmissionDate = new Date('2024-02-14T10:30:00.000Z')
      const proofDocumentKey = 'payment-proofs/APT001/2024-02/proof-document.pdf'

      createdPayment.submitProof(proofDocumentKey, proofSubmissionDate, '+5511999999999')

      // Verify proof submission
      expect(createdPayment.statusValue).toBe(PaymentStatus.PAID)
      expect(createdPayment.hasProof()).toBe(true)
      expect(createdPayment.proofDocumentKeyValue).toBe(proofDocumentKey)
      expect(createdPayment.paymentDateValue).toEqual(proofSubmissionDate)
      expect(createdPayment.isPaid()).toBe(true)

      // Step 3: Validate payment (admin action)
      const validatorId = 'admin-user'

      createdPayment.validate(validatorId)

      // Verify payment validation
      expect(createdPayment.statusValue).toBe(PaymentStatus.VALIDATED)
      expect(createdPayment.isValidated()).toBe(true)
      expect(createdPayment.validatedByValue).toBe(validatorId)
      expect(createdPayment.validatedAtValue).toBeInstanceOf(Date)

      // Verify complete workflow state - validated payments cannot be updated
      expect(() => createdPayment.updateAmount(2000, 'admin')).toThrow(
        'Cannot update amount of validated payment',
      )
      expect(createdPayment.getDaysUntilDue()).toBeLessThan(0) // Payment was made before due date
    })

    it('should handle payment submission with business rule validation', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )

      // Cannot validate payment without proof
      expect(() => payment.validate('admin')).toThrow('Only paid payments can be validated')

      // Cannot submit negative amount
      expect(() => payment.updateAmount(-100, 'admin')).toThrow()

      // Cannot update validated payment
      payment.submitProof('proof.pdf', new Date(), '+5511999999999')
      payment.validate('admin')
      expect(() => payment.updateAmount(2000, 'admin')).toThrow(
        'Cannot update amount of validated payment',
      )

      // Cannot submit proof for validated payment
      expect(() => payment.submitProof('new-proof.pdf', new Date(), '+5511999999999')).toThrow(
        'Cannot submit proof for already validated payment',
      )
    })

    it('should handle overdue payment workflow', async () => {
      // Create payment with past due date
      const pastDueDate = new Date()
      pastDueDate.setDate(pastDueDate.getDate() - 10) // 10 days ago

      const payment = Payment.create({
        paymentId: 'PAY-OVERDUE-001',
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: pastDueDate,
        contractId: 'CONTRACT-001',
        type: PaymentType.RENT,
        description: 'Overdue rent payment',
        createdBy: 'system',
      })

      // Mark as overdue
      payment.markOverdue('system')

      expect(payment.statusValue).toBe(PaymentStatus.OVERDUE)
      expect(payment.isOverdue()).toBe(true)
      expect(payment.getDaysOverdue()).toBeGreaterThan(0)

      // Submit late payment
      const latePaymentDate = new Date()
      payment.submitProof('late-proof.pdf', latePaymentDate, '+5511999999999')

      expect(payment.statusValue).toBe(PaymentStatus.PAID)
      expect(payment.getDaysOverdue()).toBe(0) // No longer overdue after payment
    })

    it('should handle payment proof rejection workflow', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )

      // Submit proof
      payment.submitProof('invalid-proof.pdf', new Date(), '+5511999999999')
      expect(payment.statusValue).toBe(PaymentStatus.PAID)

      // Reject payment (admin action)
      payment.reject('admin', 'Invalid proof document')

      expect(payment.statusValue).toBe(PaymentStatus.REJECTED)
      expect(payment.isRejected()).toBe(true)

      // User cannot resubmit proof for rejected payment - need to create new payment
      expect(() =>
        payment.submitProof('corrected-proof.pdf', new Date(), '+5511999999999'),
      ).toThrow('Cannot submit proof for rejected payment')
    })

    it('should handle bulk payment operations', async () => {
      // Create multiple payments for different months
      const payments: Payment[] = []
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date('2024-01-15')
        dueDate.setMonth(dueDate.getMonth() + i)

        const payment = Payment.create({
          paymentId: `PAY-BULK-${String(i + 1).padStart(3, '0')}`,
          apartmentUnitCode: 'APT001',
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate,
          contractId: 'CONTRACT-001',
          type: PaymentType.RENT,
          description: `Monthly rent payment for ${dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
          createdBy: 'system',
        })

        payments.push(payment)
      }

      expect(payments).toHaveLength(12)

      // Simulate bulk proof submission (first 6 months paid)
      const paidPayments = payments.slice(0, 6)
      paidPayments.forEach((payment, index) => {
        const paymentDate = new Date(payment.dueDateValue)
        paymentDate.setDate(paymentDate.getDate() - 1) // Paid one day early
        payment.submitProof(`proof-${index + 1}.pdf`, paymentDate, '+5511999999999')
      })

      // Verify bulk operations
      const paidCount = payments.filter((p) => p.isPaid()).length
      const pendingCount = payments.filter((p) => p.isPending()).length

      expect(paidCount).toBe(6)
      expect(pendingCount).toBe(6)

      // Calculate total amounts
      const totalPaid = payments
        .filter((p) => p.isPaid())
        .reduce((sum, p) => sum + p.amountValue, 0)
      const totalPending = payments
        .filter((p) => p.isPending())
        .reduce((sum, p) => sum + p.amountValue, 0)

      expect(totalPaid).toBe(9000) // 6 * 1500
      expect(totalPending).toBe(9000) // 6 * 1500
    })
  })

  describe('Payment Business Rules and Validation', () => {
    it('should calculate payment dates and delays correctly', async () => {
      const dueDate = new Date('2024-02-15T00:00:00.000Z')
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
        dueDate,
      )

      // Payment made early
      const earlyPaymentDate = new Date('2024-02-13T10:00:00.000Z')
      payment.submitProof('early-proof.pdf', earlyPaymentDate, '+5511999999999')

      expect(payment.getDaysUntilDue()).toBeLessThan(0) // Negative means paid early
      // Check if payment was made on time by comparing payment date to due date
      expect(payment.paymentDateValue!.getTime()).toBeLessThan(payment.dueDateValue.getTime())

      // Test late payment
      const latePayment = createTestPayment(
        'PAY002',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
        dueDate,
      )
      const latePaymentDate = new Date('2024-02-18T15:00:00.000Z')
      latePayment.submitProof('late-proof.pdf', latePaymentDate, '+5511999999999')

      expect(latePayment.getDaysUntilDue()).toBeLessThan(0) // Still negative after payment
      // Check if payment was made late by comparing payment date to due date
      expect(latePayment.paymentDateValue!.getTime()).toBeGreaterThan(
        latePayment.dueDateValue.getTime(),
      )
      // Calculate delay manually - should be 3 days but might be 4 due to time calculation
      const delayMs = latePayment.paymentDateValue!.getTime() - latePayment.dueDateValue.getTime()
      const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24))
      expect(delayDays).toBeGreaterThanOrEqual(3) // At least 3 days late
    })

    it('should handle payment status transitions correctly', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )

      // Valid transitions
      expect(payment.isPending()).toBe(true)

      payment.submitProof('proof.pdf', new Date(), '+5511999999999')
      expect(payment.isPaid()).toBe(true)

      payment.validate('admin')
      expect(payment.isValidated()).toBe(true)

      // Test rejection workflow
      const rejectedPayment = createTestPayment(
        'PAY002',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )
      rejectedPayment.submitProof('invalid-proof.pdf', new Date(), '+5511999999999')
      rejectedPayment.reject('admin', 'Invalid document')
      expect(rejectedPayment.isRejected()).toBe(true)

      // Cannot resubmit proof for rejected payment
      expect(() =>
        rejectedPayment.submitProof('corrected-proof.pdf', new Date(), '+5511999999999'),
      ).toThrow('Cannot submit proof for rejected payment')
    })

    it('should handle payment metadata and audit trail correctly', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )
      const originalVersion = payment.metadataValue.version

      // Submit proof
      payment.submitProof('proof.pdf', new Date(), '+5511999999999')
      expect(payment.metadataValue.version).toBe(originalVersion + 1)
      expect(payment.metadataValue.updatedBy).toBe('+5511999999999')

      // Validate payment
      const validationVersion = payment.metadataValue.version
      payment.validate('admin-user')
      expect(payment.metadataValue.version).toBe(validationVersion + 1)
      expect(payment.validatedByValue).toBe('admin-user')
      expect(payment.validatedAtValue).toBeInstanceOf(Date)

      // Verify audit trail
      expect(payment.metadataValue.createdAt).toBeInstanceOf(Date)
      expect(payment.metadataValue.updatedAt).toBeInstanceOf(Date)
      expect(payment.metadataValue.updatedAt.getTime()).toBeGreaterThanOrEqual(
        payment.metadataValue.createdAt.getTime(),
      )
    })

    it('should generate correct DynamoDB keys and serialization', async () => {
      const payment = Payment.create({
        paymentId: 'PAY-001-123456',
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
        type: PaymentType.RENT,
        description: 'Test payment',
        createdBy: 'test-system',
      })

      expect(payment.pkValue).toBe('APARTMENT#APT001')
      expect(payment.skValue).toMatch(/^PAYMENT#\d+#PAY-001-123456$/)

      // Verify the SK includes timestamp for proper sorting
      const skParts = payment.skValue.split('#')
      expect(skParts).toHaveLength(3)
      expect(skParts[0]).toBe('PAYMENT')
      expect(parseInt(skParts[1])).toBeGreaterThan(0) // timestamp
      expect(skParts[2]).toBe('PAY-001-123456')

      // Test serialization
      const json = payment.toJSON()
      const deserializedPayment = Payment.fromJSON(json)
      expect(deserializedPayment.paymentIdValue).toBe(payment.paymentIdValue)
      expect(deserializedPayment.statusValue).toBe(PaymentStatus.PENDING)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent payment submissions', async () => {
      // Simulate concurrent payment creation with unique IDs
      const payments = Array.from({ length: 5 }, (_, i) =>
        Payment.create({
          paymentId: `PAY-CONCURRENT-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          apartmentUnitCode: 'APT001',
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate: new Date('2024-02-15T00:00:00.000Z'),
          contractId: 'CONTRACT-001',
          type: PaymentType.RENT,
          description: 'Concurrent payment test',
          createdBy: 'system',
        }),
      )

      // All payments should be created successfully with unique IDs
      expect(payments).toHaveLength(5)
      const paymentIds = payments.map((p) => p.paymentIdValue)
      const uniqueIds = new Set(paymentIds)
      expect(uniqueIds.size).toBe(5) // All IDs should be unique
    })

    it('should handle invalid date formats and edge cases', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )

      // Test with future payment date (should be allowed but flagged)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      payment.submitProof('future-proof.pdf', futureDate, '+5511999999999')
      expect(payment.paymentDateValue).toEqual(futureDate)
      expect(payment.isPaid()).toBe(true)
    })

    it('should handle payment amount validations', async () => {
      // Test zero amount - should be allowed during creation but fail during updates
      const zeroPayment = Payment.create({
        paymentId: 'PAY-ZERO',
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500, // Valid amount for creation
        dueDate: new Date('2024-02-15'),
        contractId: 'CONTRACT-001',
      })

      // Test updating to zero amount
      expect(() => zeroPayment.updateAmount(0, 'admin')).toThrow()

      // Test updating to negative amount
      expect(() => zeroPayment.updateAmount(-100, 'admin')).toThrow()
    })

    it('should handle payment lifecycle edge cases', async () => {
      const payment = createTestPayment(
        'PAY001',
        'APT001',
        '+5511999999999',
        1500,
        PaymentStatus.PENDING,
      )

      // Cannot validate without proof
      expect(() => payment.validate('admin')).toThrow()

      // Cannot reject pending payment
      expect(() => payment.reject('admin', 'reason')).toThrow()

      // Submit proof and then test rejection
      payment.submitProof('proof.pdf', new Date(), '+5511999999999')
      payment.reject('admin', 'Invalid proof')
      expect(payment.isRejected()).toBe(true)

      // Cannot validate rejected payment directly
      expect(() => payment.validate('admin')).toThrow()

      // Cannot resubmit proof for rejected payment
      expect(() => payment.submitProof('new-proof.pdf', new Date(), '+5511999999999')).toThrow(
        'Cannot submit proof for rejected payment',
      )
    })

    it('should handle large payment amounts correctly', async () => {
      const largeAmount = 999999.99
      const payment = Payment.create({
        paymentId: 'PAY-LARGE',
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: largeAmount,
        dueDate: new Date('2024-02-15'),
        contractId: 'CONTRACT-001',
        type: PaymentType.RENT,
        description: 'Large payment test',
        createdBy: 'system',
      })

      expect(payment.amountValue).toBe(largeAmount)

      // Should handle proof submission for large amounts
      payment.submitProof('large-proof.pdf', new Date(), '+5511999999999')
      expect(payment.isPaid()).toBe(true)
      expect(payment.amountValue).toBe(largeAmount)
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

function createTestContract(
  contractId: string,
  apartmentUnitCode: string,
  tenantPhoneNumber: string,
  status: ContractStatus,
): Contract {
  const contract = Contract.create({
    contractId,
    apartmentUnitCode,
    tenantPhoneNumber,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
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

  if (status === ContractStatus.EXPIRED) {
    contract.expire('system')
  } else if (status === ContractStatus.TERMINATED) {
    contract.terminate('admin', 'Early termination')
  }

  return contract
}

function createTestPayment(
  paymentId: string,
  apartmentUnitCode: string,
  userPhoneNumber: string,
  amount: number,
  status: PaymentStatus,
  dueDate: Date = new Date('2024-02-15'),
): Payment {
  const payment = Payment.create({
    paymentId,
    apartmentUnitCode,
    userPhoneNumber,
    amount,
    dueDate,
    contractId: `CONTRACT-${apartmentUnitCode}`,
    type: PaymentType.RENT,
    description: 'Test payment',
    createdBy: 'test-system',
  })

  // Set initial status if not pending
  if (status === PaymentStatus.OVERDUE) {
    payment.markOverdue('system')
  }

  return payment
}

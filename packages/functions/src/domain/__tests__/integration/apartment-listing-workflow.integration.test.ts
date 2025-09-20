import { describe, it, expect } from 'vitest'
import { ApartmentAggregationService } from '../../shared/services/apartment-aggregation.service'
import { Apartment } from '../../apartment/entities/apartment.entity'
import { Payment } from '../../payment/entities/payment.entity'
import { ApartmentStatus, RentalType } from '../../apartment/vo/apartment-enums.vo'
import { PaymentStatus, PaymentType } from '../../payment/vo/payment-enums.vo'
import { ApartmentWithPaymentInfo, ApartmentListing } from '../../shared/models/query-result.models'

describe('Apartment Listing with Payment Info Workflow Integration Tests', () => {
  describe('Complete Apartment Listing Workflow', () => {
    it('should aggregate apartments with payment information for admin dashboard', async () => {
      // Setup test data
      const testApartments = [
        createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.OCCUPIED, 1500),
        createTestApartment('APT002', 'Apartment 2B', ApartmentStatus.AVAILABLE, 1800),
        createTestApartment('APT003', 'Apartment 3C', ApartmentStatus.OCCUPIED, 2000),
      ]

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
        createTestPayment(
          'PAY003',
          'APT003',
          '+5511888888888',
          2000,
          PaymentStatus.OVERDUE,
          new Date('2024-01-10'),
        ),
      ]

      // Execute the workflow
      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        testApartments,
        testPayments,
      )

      // Verify the complete workflow
      expect(result).toHaveLength(3)

      // Verify APT001 with multiple payments
      const apt001 = result.find((r) => r.apartment.unitCodeValue === 'APT001')
      expect(apt001).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT001',
          }),
          lastPayment: expect.objectContaining({
            paymentIdValue: 'PAY001', // Most recent payment by creation time
          }),
          totalPayments: 2,
          totalPaidAmount: 1500, // Only PAY001 is paid
          totalPendingAmount: 1500, // PAY002 is pending
        }),
      )

      // Verify APT002 with no payments
      const apt002 = result.find((r) => r.apartment.unitCodeValue === 'APT002')
      expect(apt002).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT002',
          }),
          lastPayment: undefined,
          totalPayments: 0,
          totalPaidAmount: 0,
          totalPendingAmount: 0,
        }),
      )

      // Verify APT003 with overdue payment
      const apt003 = result.find((r) => r.apartment.unitCodeValue === 'APT003')
      expect(apt003).toEqual(
        expect.objectContaining({
          apartment: expect.objectContaining({
            unitCodeValue: 'APT003',
          }),
          lastPayment: expect.objectContaining({
            paymentIdValue: 'PAY003',
          }),
          totalPayments: 1,
          totalPaidAmount: 0, // Overdue payment is not paid
          totalPendingAmount: 0, // Overdue payments are not counted as pending
        }),
      )

      // Verify sorting by unit code
      expect(result.map((r) => r.apartment.unitCodeValue)).toEqual(['APT001', 'APT002', 'APT003'])
    })

    it('should handle apartment listing with complex payment scenarios', async () => {
      const testApartments = [
        createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.OCCUPIED, 1500),
      ]

      // Multiple payments with different statuses and dates
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

      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        testApartments,
        testPayments,
      )

      expect(result).toHaveLength(1)
      const apartmentInfo = result[0]

      // Should have the most recent payment (PAY001 - first created)
      expect(apartmentInfo.lastPayment?.paymentIdValue).toBe('PAY001')
      expect(apartmentInfo.totalPayments).toBe(4)
      expect(apartmentInfo.totalPaidAmount).toBe(3000) // PAY001 + PAY002
      expect(apartmentInfo.totalPendingAmount).toBe(1500) // Only PAY003 is pending, PAY004 is overdue
    })

    it('should create apartment listings for landing page', async () => {
      const testApartments = [
        createTestApartment(
          'APT001',
          'Apartment 1A',
          ApartmentStatus.AVAILABLE,
          1500,
          RentalType.LONG_TERM,
          true,
        ),
        createTestApartment(
          'APT002',
          'Apartment 2B',
          ApartmentStatus.AVAILABLE,
          1800,
          RentalType.AIRBNB,
          true,
          'https://airbnb.com/rooms/123',
        ),
        createTestApartment(
          'APT003',
          'Apartment 3C',
          ApartmentStatus.AVAILABLE,
          2000,
          RentalType.BOTH,
          true,
          'https://airbnb.com/rooms/456',
        ),
      ]

      // Test long-term listings
      const longTermApartments = testApartments.filter((apt) => apt.isLongTermEnabled())
      const longTermListings = await Promise.all(
        longTermApartments.map((apt) => ApartmentAggregationService.aggregateApartmentListing(apt)),
      )

      expect(longTermListings).toHaveLength(2) // APT001 and APT003
      expect(longTermListings.map((l) => l.apartment.unitCodeValue)).toEqual(
        expect.arrayContaining(['APT001', 'APT003']),
      )

      // Test Airbnb listings
      const airbnbApartments = testApartments.filter((apt) => apt.isAirbnbEnabled())
      const airbnbListings = await Promise.all(
        airbnbApartments.map((apt) => ApartmentAggregationService.aggregateApartmentListing(apt)),
      )

      expect(airbnbListings).toHaveLength(2) // APT002 and APT003
      expect(airbnbListings.map((l) => l.apartment.unitCodeValue)).toEqual(
        expect.arrayContaining(['APT002', 'APT003']),
      )

      // Verify Airbnb links are preserved
      const apt002Listing = airbnbListings.find((l) => l.apartment.unitCodeValue === 'APT002')
      expect(apt002Listing?.airbnbLink).toBe('https://airbnb.com/rooms/123')
    })

    it('should calculate payment status correctly for different scenarios', async () => {
      const testApartments = [
        createTestApartment('APT001', 'Current Payments', ApartmentStatus.OCCUPIED, 1500),
        createTestApartment('APT002', 'Overdue Payments', ApartmentStatus.OCCUPIED, 1500),
        createTestApartment('APT003', 'No Payments', ApartmentStatus.AVAILABLE, 1500),
      ]

      const currentDate = new Date()
      const pastDate = new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      const futureDate = new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from now

      const testPayments = [
        createTestPayment(
          'PAY001',
          'APT001',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          futureDate,
        ),
        createTestPayment(
          'PAY002',
          'APT002',
          '+5511888888888',
          1500,
          PaymentStatus.PENDING,
          pastDate,
        ),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        testApartments,
        testPayments,
      )

      const apt001 = result.find((r) => r.apartment.unitCodeValue === 'APT001')
      const apt002 = result.find((r) => r.apartment.unitCodeValue === 'APT002')
      const apt003 = result.find((r) => r.apartment.unitCodeValue === 'APT003')

      expect(apt001?.paymentStatus.status).toBe('current')
      expect(apt002?.paymentStatus.status).toBe('overdue')
      expect(apt003?.paymentStatus.status).toBe('no_payments')
    })
  })

  describe('Data Consistency and Performance', () => {
    it('should maintain consistent sorting across apartment listings', async () => {
      const testApartments = [
        createTestApartment('APT003', 'Apartment 3C', ApartmentStatus.OCCUPIED, 2000),
        createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.OCCUPIED, 1500),
        createTestApartment('APT002', 'Apartment 2B', ApartmentStatus.AVAILABLE, 1800),
      ]

      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        testApartments,
        [],
      )

      // Should be sorted by unit code
      expect(result.map((r) => r.apartment.unitCodeValue)).toEqual(['APT001', 'APT002', 'APT003'])
    })

    it('should handle large datasets efficiently', async () => {
      // Create large datasets
      const testApartments = Array.from({ length: 100 }, (_, i) =>
        createTestApartment(
          `APT${String(i + 1).padStart(3, '0')}`,
          `Apartment ${i + 1}`,
          ApartmentStatus.OCCUPIED,
          1500,
        ),
      )

      const testPayments = Array.from({ length: 500 }, (_, i) =>
        createTestPayment(
          `PAY${String(i + 1).padStart(3, '0')}`,
          `APT${String((i % 100) + 1).padStart(3, '0')}`,
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date(),
        ),
      )

      const startTime = Date.now()
      const result = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        testApartments,
        testPayments,
      )
      const endTime = Date.now()

      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000)

      // Should handle all apartments
      expect(result).toHaveLength(100)

      // Each apartment should have 5 payments on average
      const totalPayments = result.reduce((sum, apt) => sum + apt.totalPayments, 0)
      expect(totalPayments).toBe(500)
    })

    it('should handle edge cases gracefully', async () => {
      // Empty datasets
      const emptyResult = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        [],
        [],
      )
      expect(emptyResult).toEqual([])

      // Apartments with no matching payments
      const apartmentsOnly = await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
        [createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.AVAILABLE, 1500)],
        [],
      )
      expect(apartmentsOnly).toHaveLength(1)
      expect(apartmentsOnly[0].totalPayments).toBe(0)

      // Payments with no matching apartments (should not affect result)
      const orphanPayments = [
        createTestPayment(
          'PAY001',
          'NONEXISTENT',
          '+5511999999999',
          1500,
          PaymentStatus.PAID,
          new Date(),
        ),
      ]
      const apartmentWithOrphanPayments =
        await ApartmentAggregationService.aggregateApartmentsWithPaymentInfo(
          [createTestApartment('APT001', 'Apartment 1A', ApartmentStatus.AVAILABLE, 1500)],
          orphanPayments,
        )
      expect(apartmentWithOrphanPayments).toHaveLength(1)
      expect(apartmentWithOrphanPayments[0].totalPayments).toBe(0)
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
  isAvailable: boolean = false,
  airbnbLink?: string,
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
    images: [`${unitCode}-image1.jpg`, `${unitCode}-image2.jpg`],
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
    airbnbLink,
    isAvailable,
    availableFrom: isAvailable ? new Date() : undefined,
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

  // Set status and payment date if provided
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

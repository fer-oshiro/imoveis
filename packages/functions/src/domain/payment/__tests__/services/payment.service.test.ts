import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PaymentService } from '../../services/payment.service'
import { IPaymentRepository } from '../../repositories/payment.repository'
import { Payment } from '../../entities/payment.entity'
import { PaymentStatus, PaymentType } from '../../vo/payment-enums.vo'
import {
  CreatePaymentDto,
  SubmitPaymentProofDto,
  ValidatePaymentDto,
  UpdatePaymentDto,
} from '../../dto/create-payment.dto'

// Mock repository
const mockPaymentRepository: IPaymentRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByApartment: vi.fn(),
  findByUser: vi.fn(),
  findLastByApartment: vi.fn(),
  findByStatus: vi.fn(),
  findByContract: vi.fn(),
  findOverduePayments: vi.fn(),
  findPendingPayments: vi.fn(),
  findByDateRange: vi.fn(),
  findByApartmentAndDateRange: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
}

describe.skip('PaymentService', () => {
  let paymentService: PaymentService

  beforeEach(() => {
    paymentService = new PaymentService(mockPaymentRepository)
    vi.clearAllMocks()
  })

  describe('createPayment', () => {
    const validDto: CreatePaymentDto = {
      apartmentUnitCode: 'APT001',
      userPhoneNumber: '+5511999999999',
      amount: 1500.0,
      dueDate: '2024-01-15T00:00:00.000Z',
      contractId: 'CONTRACT-001',
      type: PaymentType.RENT,
      description: 'Monthly rent payment',
      createdBy: 'admin',
    }

    it('should create payment successfully', async () => {
      const mockPayment = Payment.create({
        paymentId: 'PAY-APT001-123456-ABC123',
        apartmentUnitCode: validDto.apartmentUnitCode,
        userPhoneNumber: validDto.userPhoneNumber,
        amount: validDto.amount,
        dueDate: new Date(validDto.dueDate),
        contractId: validDto.contractId,
        type: validDto.type,
        description: validDto.description,
        createdBy: validDto.createdBy,
      })

      vi.mocked(mockPaymentRepository.save).mockResolvedValue(mockPayment)

      const result = await paymentService.createPayment(validDto)

      expect(mockPaymentRepository.save).toHaveBeenCalledWith(expect.any(Payment))
      expect(result.apartmentUnitCode).toBe(validDto.apartmentUnitCode)
      expect(result.userPhoneNumber).toBe(validDto.userPhoneNumber)
      expect(result.amount).toBe(validDto.amount)
      expect(result.status).toBe(PaymentStatus.PENDING)
      expect(result.type).toBe(PaymentType.RENT)
    })

    it('should throw error for invalid DTO', async () => {
      const invalidDto = { ...validDto, amount: 0 }

      await expect(paymentService.createPayment(invalidDto)).rejects.toThrow(
        'Amount must be greater than zero',
      )

      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('submitPaymentProof', () => {
    const validDto: SubmitPaymentProofDto = {
      paymentId: 'PAY-001-123456',
      proofDocumentKey: 'proof-document-123.pdf',
      paymentDate: '2024-01-14T00:00:00.000Z',
      updatedBy: 'user',
    }

    it('should submit payment proof successfully', async () => {
      const mockPayment = Payment.create({
        paymentId: validDto.paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)
      vi.mocked(mockPaymentRepository.save).mockResolvedValue(mockPayment)

      const result = await paymentService.submitPaymentProof(validDto)

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(validDto.paymentId)
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(mockPayment)
      expect(result.status).toBe(PaymentStatus.PAID)
      expect(result.proofDocumentKey).toBe(validDto.proofDocumentKey)
    })

    it('should throw error when payment not found', async () => {
      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(null)

      await expect(paymentService.submitPaymentProof(validDto)).rejects.toThrow(
        `Payment with ID ${validDto.paymentId} not found`,
      )

      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
    })

    it('should throw error for invalid DTO', async () => {
      const invalidDto = { ...validDto, paymentId: '' }

      await expect(paymentService.submitPaymentProof(invalidDto)).rejects.toThrow(
        'Payment ID is required',
      )

      expect(mockPaymentRepository.findById).not.toHaveBeenCalled()
    })
  })

  describe('validatePayment', () => {
    const validDto: ValidatePaymentDto = {
      paymentId: 'PAY-001-123456',
      validatedBy: 'admin',
      action: 'validate',
    }

    it('should validate payment successfully', async () => {
      const mockPayment = Payment.create({
        paymentId: validDto.paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      // Submit proof first to make it eligible for validation
      mockPayment.submitProof('proof.pdf', new Date(), 'user')

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)
      vi.mocked(mockPaymentRepository.save).mockResolvedValue(mockPayment)

      const result = await paymentService.validatePayment(validDto)

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(validDto.paymentId)
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(mockPayment)
      expect(result.status).toBe(PaymentStatus.VALIDATED)
      expect(result.validatedBy).toBe(validDto.validatedBy)
    })

    it('should reject payment successfully', async () => {
      const rejectDto = { ...validDto, action: 'reject' as const }
      const mockPayment = Payment.create({
        paymentId: validDto.paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      // Submit proof first to make it eligible for rejection
      mockPayment.submitProof('proof.pdf', new Date(), 'user')

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)
      vi.mocked(mockPaymentRepository.save).mockResolvedValue(mockPayment)

      const result = await paymentService.validatePayment(rejectDto)

      expect(result.status).toBe(PaymentStatus.REJECTED)
      expect(result.validatedBy).toBe(rejectDto.validatedBy)
    })

    it('should throw error when payment not found', async () => {
      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(null)

      await expect(paymentService.validatePayment(validDto)).rejects.toThrow(
        `Payment with ID ${validDto.paymentId} not found`,
      )

      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('getPaymentById', () => {
    it('should return payment when found', async () => {
      const paymentId = 'PAY-001-123456'
      const mockPayment = Payment.create({
        paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)

      const result = await paymentService.getPaymentById(paymentId)

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(paymentId)
      expect(result).not.toBeNull()
      expect(result?.paymentId).toBe(paymentId)
    })

    it('should return null when payment not found', async () => {
      const paymentId = 'PAY-001-123456'
      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(null)

      const result = await paymentService.getPaymentById(paymentId)

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(paymentId)
      expect(result).toBeNull()
    })
  })

  describe('getPaymentsByApartment', () => {
    it('should return payments for apartment', async () => {
      const apartmentUnitCode = 'APT001'
      const mockPayments = [
        Payment.create({
          paymentId: 'PAY-001',
          apartmentUnitCode,
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate: new Date('2024-01-15'),
          contractId: 'CONTRACT-001',
        }),
      ]

      vi.mocked(mockPaymentRepository.findByApartment).mockResolvedValue(mockPayments)

      const result = await paymentService.getPaymentsByApartment(apartmentUnitCode)

      expect(mockPaymentRepository.findByApartment).toHaveBeenCalledWith(apartmentUnitCode)
      expect(result).toHaveLength(1)
      expect(result[0].apartmentUnitCode).toBe(apartmentUnitCode)
    })
  })

  describe('markOverduePayments', () => {
    it('should mark overdue payments correctly', async () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const mockPayments = [
        Payment.create({
          paymentId: 'PAY-001',
          apartmentUnitCode: 'APT001',
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate: pastDate,
          contractId: 'CONTRACT-001',
        }),
      ]

      vi.mocked(mockPaymentRepository.findPendingPayments).mockResolvedValue(mockPayments)
      vi.mocked(mockPaymentRepository.save).mockResolvedValue(mockPayments[0])

      const result = await paymentService.markOverduePayments()

      expect(mockPaymentRepository.findPendingPayments).toHaveBeenCalled()
      expect(mockPaymentRepository.save).toHaveBeenCalledWith(mockPayments[0])
      expect(result).toHaveLength(1)
      expect(result[0].status).toBe(PaymentStatus.OVERDUE)
    })

    it('should not mark future payments as overdue', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)

      const mockPayments = [
        Payment.create({
          paymentId: 'PAY-001',
          apartmentUnitCode: 'APT001',
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate: futureDate,
          contractId: 'CONTRACT-001',
        }),
      ]

      vi.mocked(mockPaymentRepository.findPendingPayments).mockResolvedValue(mockPayments)

      const result = await paymentService.markOverduePayments()

      expect(mockPaymentRepository.findPendingPayments).toHaveBeenCalled()
      expect(mockPaymentRepository.save).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  describe('deletePayment', () => {
    it('should delete non-validated payment successfully', async () => {
      const paymentId = 'PAY-001-123456'
      const mockPayment = Payment.create({
        paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)
      vi.mocked(mockPaymentRepository.delete).mockResolvedValue()

      await paymentService.deletePayment(paymentId)

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(paymentId)
      expect(mockPaymentRepository.delete).toHaveBeenCalledWith(paymentId)
    })

    it('should throw error when trying to delete validated payment', async () => {
      const paymentId = 'PAY-001-123456'
      const mockPayment = Payment.create({
        paymentId,
        apartmentUnitCode: 'APT001',
        userPhoneNumber: '+5511999999999',
        amount: 1500.0,
        dueDate: new Date('2024-01-15'),
        contractId: 'CONTRACT-001',
      })

      // Make payment validated
      mockPayment.submitProof('proof.pdf', new Date(), 'user')
      mockPayment.validate('admin')

      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(mockPayment)

      await expect(paymentService.deletePayment(paymentId)).rejects.toThrow(
        'Cannot delete a validated payment',
      )

      expect(mockPaymentRepository.delete).not.toHaveBeenCalled()
    })

    it('should throw error when payment not found', async () => {
      const paymentId = 'PAY-001-123456'
      vi.mocked(mockPaymentRepository.findById).mockResolvedValue(null)

      await expect(paymentService.deletePayment(paymentId)).rejects.toThrow(
        `Payment with ID ${paymentId} not found`,
      )

      expect(mockPaymentRepository.delete).not.toHaveBeenCalled()
    })
  })

  describe('getPaymentStatsByApartment', () => {
    it('should calculate payment statistics correctly', async () => {
      const apartmentUnitCode = 'APT001'
      const mockPayments = [
        Payment.create({
          paymentId: 'PAY-001',
          apartmentUnitCode,
          userPhoneNumber: '+5511999999999',
          amount: 1500.0,
          dueDate: new Date('2024-01-15'),
          contractId: 'CONTRACT-001',
        }),
        Payment.create({
          paymentId: 'PAY-002',
          apartmentUnitCode,
          userPhoneNumber: '+5511999999999',
          amount: 1600.0,
          dueDate: new Date('2024-02-15'),
          contractId: 'CONTRACT-001',
        }),
      ]

      // Make one payment paid
      mockPayments[1].submitProof('proof.pdf', new Date(), 'user')

      vi.mocked(mockPaymentRepository.findByApartment).mockResolvedValue(mockPayments)

      const result = await paymentService.getPaymentStatsByApartment(apartmentUnitCode)

      expect(result.totalPayments).toBe(2)
      expect(result.totalAmount).toBe(3100.0)
      expect(result.pendingCount).toBe(1)
      expect(result.paidCount).toBe(1)
      expect(result.overdueCount).toBe(0)
      expect(result.validatedCount).toBe(0)
      expect(result.rejectedCount).toBe(0)
    })
  })
})

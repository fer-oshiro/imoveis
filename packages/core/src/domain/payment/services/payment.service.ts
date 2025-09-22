import type { Apartment } from '../../apartment'
import { type IApartmentRepository } from '../../apartment/repositories/apartment.repository'
import {
  type CreatePaymentDto,
  type PaymentResponseDto,
  PaymentResponseDtoMapper,
  type SubmitPaymentProofDto,
  type UpdatePaymentDto,
  validateCreatePaymentDto,
  type ValidatePaymentDto,
  validateSubmitPaymentProofDto,
  validateUpdatePaymentDto,
  validateValidatePaymentDto,
} from '../dto'
import { Payment } from '../entities/payment.entity'
import { PaymentRepository } from '../repositories/payment.repository'
import { PaymentStatus, PaymentType } from '../vo/payment-enums.vo'

export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly apartmentRepository: IApartmentRepository,
  ) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    const sanitizedDto = validateCreatePaymentDto(dto)

    if (!sanitizedDto?.doc && !sanitizedDto?.apartmentUnitCode) {
      throw new Error('Either doc or apartmentUnitCode must be provided')
    }

    let apartmentMeta: Apartment | null = null
    if (sanitizedDto?.doc) {
      apartmentMeta = await this.apartmentRepository.findUserByDocAndName(
        sanitizedDto.doc,
        sanitizedDto.name,
      )
      if (!apartmentMeta)
        apartmentMeta = await this.apartmentRepository.findUserByDoc(sanitizedDto.doc)
    }

    if (sanitizedDto.apartmentUnitCode)
      apartmentMeta = await this.apartmentRepository.findByUnitCode(sanitizedDto.apartmentUnitCode)

    if (!apartmentMeta) {
      throw new Error('Apartment or user not found for the provided doc or apartmentUnitCode')
    }

    sanitizedDto.apartmentUnitCode = apartmentMeta.unitCode
    const depositor = apartmentMeta.contactName || sanitizedDto.name

    const paymentId = `PAYMENT#${sanitizedDto.dueDate}`

    const payment = Payment.create({
      paymentId,
      apartmentUnitCode: apartmentMeta.unitCode,
      amount: sanitizedDto.amount,
      dueDate: sanitizedDto.dueDate,
      depositor,
      type: sanitizedDto.type as PaymentType,
      description: sanitizedDto.description,
      createdBy: 'system',
    })

    const savedPayment = await this.paymentRepository.save(payment)
    const isLastPayment =
      apartmentMeta.lastDepositedAt &&
      apartmentMeta.lastDepositedAt < new Date(sanitizedDto.dueDate)

    if (isLastPayment) {
      apartmentMeta.updateLastPayment(new Date(sanitizedDto.dueDate), sanitizedDto.amount, 'system')
      await this.apartmentRepository.save(apartmentMeta)
    }

    return PaymentResponseDtoMapper.fromEntity(savedPayment)
  }

  async submitPaymentProof(dto: SubmitPaymentProofDto): Promise<PaymentResponseDto> {
    // Validate input
    const sanitizedDto = validateSubmitPaymentProofDto(dto)

    // Find existing payment
    const existingPayment = await this.paymentRepository.findById(sanitizedDto.paymentId)
    if (!existingPayment) {
      throw new Error(`Payment with ID ${sanitizedDto.paymentId} not found`)
    }

    // Submit proof
    existingPayment.submitProof(
      sanitizedDto.proofDocumentKey,
      new Date(sanitizedDto.paymentDate),
      sanitizedDto.updatedBy,
    )

    // Save updated payment
    const updatedPayment = await this.paymentRepository.save(existingPayment)

    return PaymentResponseDtoMapper.fromEntity(updatedPayment)
  }

  async validatePayment(dto: ValidatePaymentDto): Promise<PaymentResponseDto> {
    // Validate input
    const sanitizedDto = validateValidatePaymentDto(dto)

    // Find existing payment
    const existingPayment = await this.paymentRepository.findById(sanitizedDto.paymentId)
    if (!existingPayment) {
      throw new Error(`Payment with ID ${sanitizedDto.paymentId} not found`)
    }

    // Validate or reject payment
    if (sanitizedDto.action === 'validate') {
      existingPayment.validate(sanitizedDto.validatedBy)
    } else {
      existingPayment.reject(sanitizedDto.validatedBy, sanitizedDto.validatedBy)
    }

    // Save updated payment
    const updatedPayment = await this.paymentRepository.save(existingPayment)

    return PaymentResponseDtoMapper.fromEntity(updatedPayment)
  }

  async updatePayment(paymentId: string, dto: UpdatePaymentDto): Promise<PaymentResponseDto> {
    // Validate input
    const sanitizedDto = validateUpdatePaymentDto(dto)

    // Find existing payment
    const existingPayment = await this.paymentRepository.findById(paymentId)
    if (!existingPayment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    // Apply updates
    if (sanitizedDto.amount !== undefined) {
      existingPayment.updateAmount(sanitizedDto.amount, sanitizedDto.updatedBy)
    }

    if (sanitizedDto.dueDate) {
      existingPayment.updateDueDate(new Date(sanitizedDto.dueDate), sanitizedDto.updatedBy)
    }

    if (sanitizedDto.description !== undefined) {
      existingPayment.updateDescription(sanitizedDto.description, sanitizedDto.updatedBy)
    }

    // Save updated payment
    const updatedPayment = await this.paymentRepository.save(existingPayment)

    return PaymentResponseDtoMapper.fromEntity(updatedPayment)
  }

  async getPaymentById(paymentId: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentRepository.findById(paymentId)
    return payment ? PaymentResponseDtoMapper.fromEntity(payment) : null
  }

  async getPaymentsByApartment(apartmentUnitCode: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByApartment(apartmentUnitCode)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getLastPaymentByApartment(apartmentUnitCode: string): Promise<PaymentResponseDto | null> {
    const payment = await this.paymentRepository.findLastByApartment(apartmentUnitCode)
    return payment ? PaymentResponseDtoMapper.fromEntity(payment) : null
  }

  async getPaymentsByUser(userPhoneNumber: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByUser(userPhoneNumber)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getPaymentsByContract(contractId: string): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByContract(contractId)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByStatus(status)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getOverduePayments(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findOverduePayments()
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getPendingPayments(): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findPendingPayments()
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByDateRange(startDate, endDate)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async getPaymentsByApartmentAndDateRange(
    apartmentUnitCode: string,
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentResponseDto[]> {
    const payments = await this.paymentRepository.findByApartmentAndDateRange(
      apartmentUnitCode,
      startDate,
      endDate,
    )
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async markOverduePayments(): Promise<PaymentResponseDto[]> {
    // Get all pending payments
    const pendingPayments = await this.paymentRepository.findPendingPayments()
    const now = new Date()
    const overduePayments: Payment[] = []

    // Mark overdue payments
    for (const payment of pendingPayments) {
      if (payment.dueDateValue < now) {
        payment.markOverdue('system')
        await this.paymentRepository.save(payment)
        overduePayments.push(payment)
      }
    }

    return PaymentResponseDtoMapper.fromEntities(overduePayments)
  }

  async generateMonthlyPayments(contractId: string): Promise<PaymentResponseDto[]> {
    // This would be used to generate recurring monthly payments for a contract
    // Implementation would depend on contract details and business rules
    // For now, this is a placeholder that would need contract service integration
    throw new Error('generateMonthlyPayments not yet implemented - requires contract integration')
  }

  async deletePayment(paymentId: string): Promise<void> {
    const payment = await this.paymentRepository.findById(paymentId)
    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found`)
    }

    if (payment.isValidated()) {
      throw new Error('Cannot delete a validated payment')
    }

    await this.paymentRepository.delete(paymentId)
  }

  // Statistics and reporting methods
  async getPaymentStatsByApartment(apartmentUnitCode: string): Promise<{
    totalPayments: number
    totalAmount: number
    pendingCount: number
    paidCount: number
    overdueCount: number
    validatedCount: number
    rejectedCount: number
  }> {
    const payments = await this.paymentRepository.findByApartment(apartmentUnitCode)

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amountValue, 0),
      pendingCount: payments.filter((p) => p.isPending()).length,
      paidCount: payments.filter((p) => p.isPaid()).length,
      overdueCount: payments.filter((p) => p.isOverdue()).length,
      validatedCount: payments.filter((p) => p.isValidated()).length,
      rejectedCount: payments.filter((p) => p.isRejected()).length,
    }
  }

  async getPaymentStatsByUser(userPhoneNumber: string): Promise<{
    totalPayments: number
    totalAmount: number
    pendingCount: number
    paidCount: number
    overdueCount: number
    validatedCount: number
    rejectedCount: number
  }> {
    const payments = await this.paymentRepository.findByUser(userPhoneNumber)

    return {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, payment) => sum + payment.amountValue, 0),
      pendingCount: payments.filter((p) => p.isPending()).length,
      paidCount: payments.filter((p) => p.isPaid()).length,
      overdueCount: payments.filter((p) => p.isOverdue()).length,
      validatedCount: payments.filter((p) => p.isValidated()).length,
      rejectedCount: payments.filter((p) => p.isRejected()).length,
    }
  }

  // Legacy methods for backward compatibility
  async getAllPaymentProofs(): Promise<PaymentResponseDto[]> {
    // Get all payments with proof submitted (legacy comprovantes endpoint)
    const payments = await this.paymentRepository.findByStatus(PaymentStatus.PAID)
    return PaymentResponseDtoMapper.fromEntities(payments)
  }

  async submitLegacyPaymentProof(body: any): Promise<PaymentResponseDto> {
    // Legacy method to handle old comprovantes format
    // This would need to be mapped to the new SubmitPaymentProofDto format
    const dto: SubmitPaymentProofDto = {
      paymentId: body.paymentId || body.id,
      paymentDate: body.dataDeposito || body.paymentDate,
      proofDocumentKey: body.proofDocumentKey || body.documentKey,
      updatedBy: body.updatedBy || 'legacy-system',
    }

    return this.submitPaymentProof(dto)
  }

  private generatePaymentId(apartmentUnitCode: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `PAY-${apartmentUnitCode}-${timestamp}-${random}`.toUpperCase()
  }
}

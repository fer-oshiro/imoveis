import { Payment } from '../entities/payment.entity'
import { IPaymentRepository } from '../repositories/payment.repository'
import { PaymentStatus, PaymentType } from '../vo/payment-enums.vo'
import {
  CreatePaymentDto,
  CreatePaymentDtoValidator,
  SubmitPaymentProofDto,
  SubmitPaymentProofDtoValidator,
  ValidatePaymentDto,
  ValidatePaymentDtoValidator,
  UpdatePaymentDto,
  UpdatePaymentDtoValidator,
  PaymentResponseDto,
  PaymentResponseDtoMapper,
} from '../dto'

export class PaymentService {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async createPayment(dto: CreatePaymentDto): Promise<PaymentResponseDto> {
    // Validate input
    CreatePaymentDtoValidator.validate(dto)
    const sanitizedDto = CreatePaymentDtoValidator.sanitize(dto)

    // Generate payment ID
    const paymentId = this.generatePaymentId(sanitizedDto.apartmentUnitCode)

    // Create payment entity
    const payment = Payment.create({
      paymentId,
      apartmentUnitCode: sanitizedDto.apartmentUnitCode,
      userPhoneNumber: sanitizedDto.userPhoneNumber,
      amount: sanitizedDto.amount,
      dueDate: new Date(sanitizedDto.dueDate),
      contractId: sanitizedDto.contractId,
      type: sanitizedDto.type,
      description: sanitizedDto.description,
      createdBy: sanitizedDto.createdBy,
    })

    // Save to repository
    const savedPayment = await this.paymentRepository.save(payment)

    return PaymentResponseDtoMapper.fromEntity(savedPayment)
  }

  async submitPaymentProof(dto: SubmitPaymentProofDto): Promise<PaymentResponseDto> {
    // Validate input
    SubmitPaymentProofDtoValidator.validate(dto)
    const sanitizedDto = SubmitPaymentProofDtoValidator.sanitize(dto)

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
    ValidatePaymentDtoValidator.validate(dto)
    const sanitizedDto = ValidatePaymentDtoValidator.sanitize(dto)

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
    UpdatePaymentDtoValidator.validate(dto)
    const sanitizedDto = UpdatePaymentDtoValidator.sanitize(dto)

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
  async getAllPaymentProofs(): Promise<any[]> {
    // Get all payments that have proof documents (legacy comprovantes)
    const allPayments = await this.paymentRepository.findAll()
    return allPayments
      .filter((payment) => payment.hasProof())
      .map((payment) => payment.toLegacyFormat())
  }

  async submitLegacyPaymentProof(body: any): Promise<any> {
    // Convert legacy format to new payment proof format
    const dto: SubmitPaymentProofDto = {
      paymentId: body.PK || `LEGACY-${Date.now()}`,
      proofDocumentKey: body.chaveDocumento || body.documentKey,
      paymentDate: body.dataDeposito,
      updatedBy: 'legacy-system',
    }

    // If this is a new payment (no existing paymentId), create it first
    if (body.PK && !body.PK.startsWith('LEGACY-')) {
      return await this.submitPaymentProof(dto)
    } else {
      // Create new payment from legacy data
      const createDto: CreatePaymentDto = {
        apartmentUnitCode: body.unidade || body.apartmentUnitCode,
        userPhoneNumber: body.telefone || body.phoneNumber,
        amount: body.valor || body.amount || 0,
        dueDate: body.dataVencimento || body.dueDate || body.dataDeposito,
        contractId: body.contratoId || body.contractId || 'LEGACY',
        type: 'rent' as any,
        description: body.descricao || body.description || 'Legacy payment',
        createdBy: 'legacy-system',
      }

      const payment = await this.createPayment(createDto)

      // Then submit the proof
      return await this.submitPaymentProof({
        paymentId: payment.paymentId,
        proofDocumentKey: dto.proofDocumentKey,
        paymentDate: dto.paymentDate,
        updatedBy: dto.updatedBy,
      })
    }
  }

  private generatePaymentId(apartmentUnitCode: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `PAY-${apartmentUnitCode}-${timestamp}-${random}`.toUpperCase()
  }
}

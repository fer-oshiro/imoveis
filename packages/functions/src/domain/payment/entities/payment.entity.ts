import { EntityMetadataVO } from '../../shared'
import { PaymentStatus, PaymentType } from '../vo/payment-enums.vo'

export class Payment {
  constructor(
    private pk: string,
    private sk: string,
    private paymentId: string,
    private apartmentUnitCode: string,
    private userPhoneNumber: string,
    private amount: number,
    private dueDate: Date,
    private status: PaymentStatus,
    private type: PaymentType,
    private contractId: string,
    private paymentDate?: Date,
    private proofDocumentKey?: string,
    private validatedBy?: string,
    private validatedAt?: Date,
    private description?: string,
    private metadata: EntityMetadataVO = EntityMetadataVO.create(),
  ) {}

  public static create(data: {
    paymentId: string
    apartmentUnitCode: string
    userPhoneNumber: string
    amount: number
    dueDate: Date
    contractId: string
    type?: PaymentType
    status?: PaymentStatus
    description?: string
    createdBy?: string
  }): Payment {
    const timestamp = Date.now()
    const metadata = EntityMetadataVO.create(data.createdBy)

    return new Payment(
      `APARTMENT#${data.apartmentUnitCode}`,
      `PAYMENT#${timestamp}#${data.paymentId}`,
      data.paymentId,
      data.apartmentUnitCode,
      data.userPhoneNumber,
      data.amount,
      data.dueDate,
      data.status || PaymentStatus.PENDING,
      data.type || PaymentType.RENT,
      data.contractId,
      undefined, // paymentDate
      undefined, // proofDocumentKey
      undefined, // validatedBy
      undefined, // validatedAt
      data.description,
      metadata,
    )
  }

  // Getters
  get pkValue(): string {
    return this.pk
  }

  get skValue(): string {
    return this.sk
  }

  get paymentIdValue(): string {
    return this.paymentId
  }

  get apartmentUnitCodeValue(): string {
    return this.apartmentUnitCode
  }

  get userPhoneNumberValue(): string {
    return this.userPhoneNumber
  }

  get amountValue(): number {
    return this.amount
  }

  get dueDateValue(): Date {
    return this.dueDate
  }

  get statusValue(): PaymentStatus {
    return this.status
  }

  get typeValue(): PaymentType {
    return this.type
  }

  get contractIdValue(): string {
    return this.contractId
  }

  get paymentDateValue(): Date | undefined {
    return this.paymentDate
  }

  get proofDocumentKeyValue(): string | undefined {
    return this.proofDocumentKey
  }

  get validatedByValue(): string | undefined {
    return this.validatedBy
  }

  get validatedAtValue(): Date | undefined {
    return this.validatedAt
  }

  get descriptionValue(): string | undefined {
    return this.description
  }

  get metadataValue(): EntityMetadataVO {
    return this.metadata
  }

  // Business methods
  submitProof(proofDocumentKey: string, paymentDate: Date, updatedBy?: string): void {
    if (this.status === PaymentStatus.VALIDATED) {
      throw new Error('Cannot submit proof for already validated payment')
    }
    if (this.status === PaymentStatus.REJECTED) {
      throw new Error('Cannot submit proof for rejected payment')
    }

    this.proofDocumentKey = proofDocumentKey
    this.paymentDate = paymentDate
    this.status = PaymentStatus.PAID
    this.metadata = this.metadata.update(updatedBy)
  }

  validate(validatedBy: string): void {
    if (this.status !== PaymentStatus.PAID) {
      throw new Error('Only paid payments can be validated')
    }
    if (!this.proofDocumentKey) {
      throw new Error('Cannot validate payment without proof document')
    }

    this.status = PaymentStatus.VALIDATED
    this.validatedBy = validatedBy
    this.validatedAt = new Date()
    this.metadata = this.metadata.update(validatedBy)
  }

  reject(validatedBy: string, updatedBy?: string): void {
    if (this.status !== PaymentStatus.PAID) {
      throw new Error('Only paid payments can be rejected')
    }

    this.status = PaymentStatus.REJECTED
    this.validatedBy = validatedBy
    this.validatedAt = new Date()
    this.metadata = this.metadata.update(updatedBy)
  }

  markOverdue(updatedBy?: string): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Only pending payments can be marked as overdue')
    }

    const now = new Date()
    if (this.dueDate >= now) {
      throw new Error('Cannot mark payment as overdue before due date')
    }

    this.status = PaymentStatus.OVERDUE
    this.metadata = this.metadata.update(updatedBy)
  }

  updateAmount(newAmount: number, updatedBy?: string): void {
    if (this.status === PaymentStatus.VALIDATED) {
      throw new Error('Cannot update amount of validated payment')
    }
    if (newAmount <= 0) {
      throw new Error('Payment amount must be greater than zero')
    }

    this.amount = newAmount
    this.metadata = this.metadata.update(updatedBy)
  }

  updateDueDate(newDueDate: Date, updatedBy?: string): void {
    if (this.status === PaymentStatus.VALIDATED) {
      throw new Error('Cannot update due date of validated payment')
    }

    this.dueDate = newDueDate

    // Update status based on new due date
    const now = new Date()
    if (this.status === PaymentStatus.OVERDUE && newDueDate >= now) {
      this.status = PaymentStatus.PENDING
    } else if (this.status === PaymentStatus.PENDING && newDueDate < now) {
      this.status = PaymentStatus.OVERDUE
    }

    this.metadata = this.metadata.update(updatedBy)
  }

  updateDescription(description: string, updatedBy?: string): void {
    this.description = description
    this.metadata = this.metadata.update(updatedBy)
  }

  // Status check methods
  isPending(): boolean {
    return this.status === PaymentStatus.PENDING
  }

  isPaid(): boolean {
    return this.status === PaymentStatus.PAID
  }

  isOverdue(): boolean {
    return this.status === PaymentStatus.OVERDUE
  }

  isValidated(): boolean {
    return this.status === PaymentStatus.VALIDATED
  }

  isRejected(): boolean {
    return this.status === PaymentStatus.REJECTED
  }

  hasProof(): boolean {
    return !!this.proofDocumentKey
  }

  getDaysOverdue(): number {
    if (!this.isOverdue()) return 0

    const now = new Date()
    const diffTime = now.getTime() - this.dueDate.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  getDaysUntilDue(): number {
    const now = new Date()
    const diffTime = this.dueDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  public toJSON(): Record<string, any> {
    return {
      pk: this.pk,
      sk: this.sk,
      paymentId: this.paymentId,
      apartmentUnitCode: this.apartmentUnitCode,
      userPhoneNumber: this.userPhoneNumber,
      amount: this.amount,
      dueDate: this.dueDate.toISOString(),
      status: this.status,
      type: this.type,
      contractId: this.contractId,
      paymentDate: this.paymentDate?.toISOString(),
      proofDocumentKey: this.proofDocumentKey,
      validatedBy: this.validatedBy,
      validatedAt: this.validatedAt?.toISOString(),
      description: this.description,
      ...this.metadata.toJSON(),
    }
  }

  public static fromJSON(data: Record<string, any>): Payment {
    const metadata = EntityMetadataVO.fromJSON(data)

    return new Payment(
      data.pk,
      data.sk,
      data.paymentId,
      data.apartmentUnitCode,
      data.userPhoneNumber,
      data.amount,
      new Date(data.dueDate),
      data.status as PaymentStatus,
      data.type as PaymentType,
      data.contractId,
      data.paymentDate ? new Date(data.paymentDate) : undefined,
      data.proofDocumentKey,
      data.validatedBy,
      data.validatedAt ? new Date(data.validatedAt) : undefined,
      data.description,
      metadata,
    )
  }

  // Legacy format conversion for backward compatibility
  public toLegacyFormat(): Record<string, any> {
    return {
      PK: this.pk,
      SK: this.sk,
      unidade: this.apartmentUnitCode,
      telefone: this.userPhoneNumber,
      valor: this.amount,
      dataDeposito: this.paymentDate?.toISOString(),
      dataVencimento: this.dueDate.toISOString(),
      chaveDocumento: this.proofDocumentKey,
      tipo: 'comprovante',
      status: this.status,
      validadoPor: this.validatedBy,
      validadoEm: this.validatedAt?.toISOString(),
      descricao: this.description,
      criadoEm: this.metadata.createdAt.toISOString(),
      atualizadoEm: this.metadata.updatedAt.toISOString(),
    }
  }
}

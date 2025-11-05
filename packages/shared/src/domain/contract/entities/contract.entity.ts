import { EntityMetadataVO } from '../../shared'
import { ContractStatus } from '../vo/contract-enums.vo'
import { type ContractTerms, ContractTermsVO } from '../vo/contract-terms.vo'

export class Contract {
  constructor(
    private pk: string,
    private sk: string,
    private contractId: string,
    private apartmentUnitCode: string,
    private tenantPhoneNumber: string,
    private startDate: Date,
    private endDate: Date,
    private status: ContractStatus,
    private terms: ContractTermsVO,
    private metadata: EntityMetadataVO = EntityMetadataVO.create(),
  ) {}

  public static create(data: {
    contractId: string
    apartmentUnitCode: string
    tenantPhoneNumber: string
    startDate: Date
    endDate: Date
    terms: ContractTerms
    status?: ContractStatus
    createdBy?: string
  }): Contract {
    const terms = ContractTermsVO.create(data.terms)
    const metadata = EntityMetadataVO.create(data.createdBy)

    return new Contract(
      `APARTMENT#${data.apartmentUnitCode}`,
      `CONTRACT#${data.contractId}`,
      data.contractId,
      data.apartmentUnitCode,
      data.tenantPhoneNumber,
      data.startDate,
      data.endDate,
      data.status || ContractStatus.PENDING,
      terms,
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

  get contractIdValue(): string {
    return this.contractId
  }

  get apartmentUnitCodeValue(): string {
    return this.apartmentUnitCode
  }

  get tenantPhoneNumberValue(): string {
    return this.tenantPhoneNumber
  }

  get startDateValue(): Date {
    return this.startDate
  }

  get endDateValue(): Date {
    return this.endDate
  }

  get statusValue(): ContractStatus {
    return this.status
  }

  get termsValue(): ContractTermsVO {
    return this.terms
  }

  get metadataValue(): EntityMetadataVO {
    return this.metadata
  }

  // Business methods
  activate(updatedBy?: string): void {
    if (this.status !== ContractStatus.PENDING) {
      throw new Error('Only pending contracts can be activated')
    }
    this.status = ContractStatus.ACTIVE
    this.metadata = this.metadata.update(updatedBy)
  }

  terminate(updatedBy?: string): void {
    if (this.status !== ContractStatus.ACTIVE) {
      throw new Error('Only active contracts can be terminated')
    }
    this.status = ContractStatus.TERMINATED
    this.metadata = this.metadata.update(updatedBy)
  }

  expire(updatedBy?: string): void {
    if (this.status !== ContractStatus.ACTIVE) {
      throw new Error('Only active contracts can expire')
    }
    this.status = ContractStatus.EXPIRED
    this.metadata = this.metadata.update(updatedBy)
  }

  extend(newEndDate: Date, updatedBy?: string): void {
    if (this.status !== ContractStatus.ACTIVE) {
      throw new Error('Only active contracts can be extended')
    }
    if (newEndDate <= this.endDate) {
      throw new Error('New end date must be after current end date')
    }
    this.endDate = newEndDate
    this.metadata = this.metadata.update(updatedBy)
  }

  updateTerms(newTerms: ContractTerms, updatedBy?: string): void {
    this.terms = ContractTermsVO.create(newTerms)
    this.metadata = this.metadata.update(updatedBy)
  }

  isActive(): boolean {
    return this.status === ContractStatus.ACTIVE
  }

  isExpired(): boolean {
    const now = new Date()
    return this.endDate < now || this.status === ContractStatus.EXPIRED
  }

  isTerminated(): boolean {
    return this.status === ContractStatus.TERMINATED
  }

  isPending(): boolean {
    return this.status === ContractStatus.PENDING
  }

  getDurationInMonths(): number {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.ceil(diffDays / 30)
  }

  getRemainingDays(): number {
    const now = new Date()
    if (this.endDate < now) return 0
    const diffTime = this.endDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  public toJSON(): Record<string, any> {
    return {
      pk: this.pk,
      sk: this.sk,
      contractId: this.contractId,
      apartmentUnitCode: this.apartmentUnitCode,
      tenantPhoneNumber: this.tenantPhoneNumber,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      status: this.status,
      terms: this.terms.toJSON(),
      ...this.metadata.toJSON(),
    }
  }

  public static fromJSON(data: Record<string, any>): Contract {
    const terms = ContractTermsVO.fromJSON(data.terms || {})
    const metadata = EntityMetadataVO.fromJSON(data)

    return new Contract(
      data.pk,
      data.sk,
      data.contractId,
      data.apartmentUnitCode,
      data.tenantPhoneNumber,
      new Date(data.startDate),
      new Date(data.endDate),
      data.status as ContractStatus,
      terms,
      metadata,
    )
  }
}

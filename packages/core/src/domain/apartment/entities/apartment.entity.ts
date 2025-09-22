/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContactInfoVO, ContactMethod, EntityMetadataVO } from '../../shared'
import { type ApartmentAmenities, ApartmentAmenitiesVO } from '../vo/apartment-amenities.vo'
import { ApartmentStatus, RentalType } from '../vo/apartment-enums.vo'

export class Apartment {
  constructor(
    private pk: string,
    private sk: string,
    private unitCode: string,
    private unitLabel: string,
    private address: string,
    private status: ApartmentStatus,
    private rentalType: RentalType,
    private baseRent: number,
    private cleaningFee: number,
    private images: string[], // S3 bucket keys
    private amenities: ApartmentAmenities,
    private contactInfo: ContactInfoVO | null,
    private airbnbLink?: string,
    private isAvailable: boolean = false,
    private availableFrom?: Date,
    private lastDepositedAt?: Date,
    private lastPaymentAmount?: number,
    private lastBillingMonth?: number,
    private dueDayOfMonth?: number,
    private metadata: EntityMetadataVO = EntityMetadataVO.create(),
  ) {}

  public static create(data: {
    unitCode: string
    unitLabel: string
    address: string
    status?: ApartmentStatus
    rentalType?: RentalType
    baseRent: number
    cleaningFee?: number
    images?: string[]
    amenities?: Partial<ApartmentAmenities>
    contactName?: string
    contactPhone?: string
    contactMethod?: ContactMethod
    contactDocument?: string
    airbnbLink?: string
    isAvailable?: boolean
    availableFrom?: Date
    lastDepositedAt?: Date
    lastPaymentAmount?: number
    lastBillingMonth?: number
    dueDayOfMonth?: number
    createdBy?: string
  }): Apartment {
    const contactInfo = ContactInfoVO.create(
      data.contactName,
      data.contactPhone,
      data.contactMethod || ContactMethod.WHATSAPP,
      data.contactDocument,
    )

    const amenities = new ApartmentAmenitiesVO(data.amenities)
    const metadata = EntityMetadataVO.create(data.createdBy)

    return new Apartment(
      `APARTMENT#${data.unitCode}`,
      `INFO`,
      data.unitCode,
      data.unitLabel,
      data.address,
      data.status || ApartmentStatus.AVAILABLE,
      data.rentalType || RentalType.LONG_TERM,
      data.baseRent,
      data.cleaningFee || 0,
      data.images || [],
      amenities,
      contactInfo,
      data.airbnbLink,
      data.isAvailable ?? false,
      data.availableFrom,
      data.lastDepositedAt,
      data.lastPaymentAmount,
      data.lastBillingMonth,
      data.dueDayOfMonth,
      metadata,
    )
  }

  // Getters
  get unitCodeValue(): string {
    return this.unitCode
  }
  get unitLabelValue(): string {
    return this.unitLabel
  }
  get addressValue(): string {
    return this.address
  }
  get statusValue(): ApartmentStatus {
    return this.status
  }
  get rentalTypeValue(): RentalType {
    return this.rentalType
  }
  get baseRentValue(): number {
    return this.baseRent
  }
  get cleaningFeeValue(): number {
    return this.cleaningFee
  }
  get imagesValue(): string[] {
    return [...this.images]
  }
  get amenitiesValue(): ApartmentAmenities {
    return this.amenities
  }
  get contactInfoValue(): ContactInfoVO | null {
    return this.contactInfo
  }
  get airbnbLinkValue(): string | undefined {
    return this.airbnbLink
  }
  get isAvailableValue(): boolean {
    return this.isAvailable
  }
  get availableFromValue(): Date | undefined {
    return this.availableFrom
  }
  get metadataValue(): EntityMetadataVO {
    return this.metadata
  }

  get contactName(): string | undefined {
    return this.contactInfo?.contactName
  }

  // Business methods
  markAsOccupied(updatedBy?: string): void {
    this.status = ApartmentStatus.OCCUPIED
    this.isAvailable = false
    this.availableFrom = undefined
    this.metadata = this.metadata.update(updatedBy)
  }

  markAsAvailable(availableFrom?: Date, updatedBy?: string): void {
    this.status = ApartmentStatus.AVAILABLE
    this.isAvailable = true
    this.availableFrom = availableFrom
    this.metadata = this.metadata.update(updatedBy)
  }

  markAsInactive(updatedBy?: string): void {
    this.status = ApartmentStatus.INACTIVE
    this.isAvailable = false
    this.availableFrom = undefined
    this.metadata = this.metadata.update(updatedBy)
  }

  updateLastPayment(lastDepositedAt: Date, lastPaymentAmount: number, updatedBy?: string) {
    this.lastDepositedAt = lastDepositedAt
    this.lastPaymentAmount = lastPaymentAmount
    this.metadata = this.metadata.update(updatedBy)
  }

  updateRentalType(rentalType: RentalType, updatedBy?: string): void {
    this.rentalType = rentalType
    this.metadata = this.metadata.update(updatedBy)
  }

  updateAirbnbLink(airbnbLink: string | undefined, updatedBy?: string): void {
    this.airbnbLink = airbnbLink
    this.metadata = this.metadata.update(updatedBy)
  }

  addImage(imageKey: string, updatedBy?: string): void {
    if (!this.images.includes(imageKey)) {
      this.images.push(imageKey)
      this.metadata = this.metadata.update(updatedBy)
    }
  }

  removeImage(imageKey: string, updatedBy?: string): void {
    const index = this.images.indexOf(imageKey)
    if (index > -1) {
      this.images.splice(index, 1)
      this.metadata = this.metadata.update(updatedBy)
    }
  }

  updatePricing(baseRent: number, cleaningFee?: number, updatedBy?: string): void {
    this.baseRent = baseRent
    if (cleaningFee !== undefined) {
      this.cleaningFee = cleaningFee
    }
    this.metadata = this.metadata.update(updatedBy)
  }

  isAirbnbEnabled(): boolean {
    return this.rentalType === RentalType.AIRBNB || this.rentalType === RentalType.BOTH
  }

  isLongTermEnabled(): boolean {
    return this.rentalType === RentalType.LONG_TERM || this.rentalType === RentalType.BOTH
  }

  public toJSON() {
    console.log('Serializing apartment:', this.contactInfo?.toJSON())
    return {
      PK: this.pk,
      SK: this.sk,
      unitCode: this.unitCode,
      unitLabel: this.unitLabel,
      address: this.address,
      status: this.status,
      rentalType: this.rentalType,
      baseRent: this.baseRent,
      cleaningFee: this.cleaningFee,
      images: this.images,
      airbnbLink: this.airbnbLink,
      isAvailable: this.isAvailable,
      availableFrom: this.availableFrom?.toISOString(),
      lastDepositedAt: this.lastDepositedAt?.toISOString(),
      lastPaymentAmount: this.lastPaymentAmount,
      lastBillingMonth: this.lastBillingMonth,
      dueDayOfMonth: this.dueDayOfMonth,
      ...this.amenities.toJSON(),
      ...this.contactInfo?.toJSON(),
      ...this.metadata.toJSON(),
    }
  }

  public static fromJSON(data: Record<string, any>): Apartment {
    const contactInfo = ContactInfoVO.fromJSON(
      data.contactInfo || {
        contactPhone: data.contactPhone || '',
        contactMethod: data.contactMethod || ContactMethod.WHATSAPP,
        contactName: data.contactName,
        contactDocument: data.contactDocument,
        preferredLanguage: data.preferredLanguage,
        defaultCountry: data.defaultCountry,
      },
    )

    const amenities = ApartmentAmenitiesVO.fromJSON(
      data.amenities || {
        hasCleaningService: ['yes', 'true', 'incluido'].includes(data.hasCleaningService),
        waterIncluded: ['yes', 'true', 'incluido'].includes(data.waterIncluded),
        electricityIncluded: ['yes', 'true', 'incluido'].includes(data.electricityIncluded),
      },
    )

    const metadata = EntityMetadataVO.fromJSON(data)

    console.log(
      'Deserialized apartment:',
      contactInfo?.toJSON(),
      data.contactPhone,
      data.contactInfo,
    )

    return new Apartment(
      data.PK,
      data.SK,
      data.unitCode,
      data.unitLabel,
      data.address,
      data.status as ApartmentStatus,
      (data.rentalType as RentalType) || RentalType.LONG_TERM,
      Number(data.baseRent) || 0,
      Number(data.cleaningFee) || 0,
      data.images || [],
      amenities,
      contactInfo,
      data.airbnbLink,
      data.isAvailable ?? false,
      data.availableFrom ? new Date(data.availableFrom) : undefined,
      data.lastDepositedAt ? new Date(data.lastDepositedAt) : undefined,
      data.lastPaymentAmount ? Number(data.lastPaymentAmount) : undefined,
      data.lastBillingMonth ? Number(data.lastBillingMonth) : undefined,
      data.dueDayOfMonth ? Number(data.dueDayOfMonth) : undefined,
      metadata,
    )
  }
}

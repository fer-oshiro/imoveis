import { Metadata, MetadataSchema } from '@imovel/core/domain/common'

import { APARTMENT_STATUS, ApartmentStatusSchema } from '../vo'

export class Apartment {
  constructor(
    readonly id: string,
    readonly label: string,
    readonly rentAmount: number,
    readonly status: APARTMENT_STATUS,
    readonly location: string,
    readonly description: string,
    readonly images: string[] = [],
    readonly airbnbLink: string = '',
    readonly isOccupied: boolean = false,
    readonly cleanCost?: number,
    readonly metadata: Metadata = MetadataSchema.parse({}),
  ) {}

  public static create(data: {
    id: string
    label: string
    rentAmount: number
    status?: string
    location: string
    description: string
    images: string[]
    airbnbLink: string
    isOccupied: boolean
    cleanCost?: number
    metadata?: any
  }): Apartment {
    if (ApartmentStatusSchema.safeParse(data.status).success === false) {
      throw new Error(`Invalid apartment status: ${data.status}`)
    }

    if (data.metadata && MetadataSchema.safeParse(data.metadata).success === false) {
      throw new Error(`Invalid metadata: ${JSON.stringify(data.metadata)}`)
    }

    return new Apartment(
      data.id,
      data.label,
      data.rentAmount,
      ApartmentStatusSchema.parse(data.status),
      data.location,
      data.description,
      data.images,
      data.airbnbLink,
      data.isOccupied,
      data.cleanCost,
      MetadataSchema.parse(data.metadata ?? {}),
    )
  }

  public toJSON() {
    return {
      id: this.id,
      label: this.label,
      rentAmount: this.rentAmount,
      status: this.status,
      location: this.location,
      description: this.description,
      images: this.images,
      airbnbLink: this.airbnbLink,
      isOccupied: this.isOccupied,
      cleanCost: this.cleanCost,
    }
  }
}

import { Metadata, MetadataSchema } from '@imovel/core/domain/common'

import { Option } from '../vo'

export class Contract {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly document: string,
    readonly apartmentId: string,
    readonly valid: boolean,
    readonly dueDate: Date | null = null,
    readonly images: string[] = [],
    readonly rentAmount: number = 0,
    readonly options: Option[] = [Option.FURNISHED],
    readonly balance: number = 0,
    readonly metadata: Metadata = MetadataSchema.parse({}),
  ) {}

  static create(props: {
    id?: string
    userId: string
    document: string
    apartmentId: string
    valid: boolean
    dueDate?: Date
    images?: string[]
    rentAmount?: number
    options?: Option[]
    balance?: number
    metadata?: Metadata
  }): Contract {
    return new Contract(
      props.id ?? crypto.randomUUID(),
      props.userId,
      props.document,
      props.apartmentId,
      props.valid,
      props.dueDate,
      props.images || [],
      props.rentAmount || 0,
      props.options || [Option.FURNISHED],
      props.balance || 0,
      props.metadata || MetadataSchema.parse({}),
    )
  }
}

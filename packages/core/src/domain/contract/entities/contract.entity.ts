import { Metadata, MetadataSchema } from '@imovel/core/domain/common'

import { Option } from '../vo'

export class Contract {
  constructor(
    readonly id: string,
    readonly userId: string,
    readonly document: string,
    readonly apartmentId: string,
    readonly valid: boolean,
    readonly dueDate: string | null = null,
    readonly images: string[] = [],
    readonly rentAmount: number = 0,
    readonly options: Option[] = [Option.FURNISHED],
    readonly balance: number = 0,
    readonly lastPaymentId: string | null = null,
    readonly lastPaymentDate: Date | null = null,
    readonly metadata: Metadata = MetadataSchema.parse({}),
  ) {}

  static create(props: {
    id?: string
    userId: string
    document: string
    apartmentId: string
    valid: boolean
    dueDate?: string | null
    images?: string[]
    rentAmount?: number
    options?: Option[]
    balance?: number
    lastPaymentId?: string | null
    lastPaymentDate?: string | null
    metadata?: Metadata
  }): Contract {
    return new Contract(
      props.id ?? crypto.randomUUID(),
      props.userId,
      props.document,
      props.apartmentId,
      props.valid,
      props.dueDate ? props.dueDate : null,
      props.images || [],
      props.rentAmount || 0,
      props.options || [Option.FURNISHED],
      props.balance || 0,
      props.lastPaymentId || null,
      props.lastPaymentDate ? new Date(props.lastPaymentDate) : null,
      props.metadata || MetadataSchema.parse({}),
    )
  }
}

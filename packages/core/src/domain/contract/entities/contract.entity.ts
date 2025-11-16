import { Metadata, MetadataSchema } from '@imovel/core/domain/common'

import { Option } from '../vo'

export class Contract {
  constructor(
    private _id: string,
    private _userId: string,
    private _document: string,
    private _apartmentId: string,
    private _valid: boolean,
    private _dueDate: string | null = null,
    private _images: string[] = [],
    private _rentAmount: number = 0,
    private _options: Option[] = [Option.FURNISHED],
    private _balance: number = 0,
    private _lastPaymentId: string | null = null,
    private _lastPaymentDate: Date | null = null,
    private _metadata: Metadata = MetadataSchema.parse({}),
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

  toJSON(): { [key: string]: any } {
    return {
      id: this._id,
      userId: this._userId,
      document: this._document,
      apartmentId: this._apartmentId,
      valid: this._valid,
      dueDate: this._dueDate,
      images: this._images,
      rentAmount: this._rentAmount,
      options: this._options,
      balance: this._balance,
      lastPaymentId: this._lastPaymentId,
      lastPaymentDate: this._lastPaymentDate ? this._lastPaymentDate.toISOString() : null,
      metadata: this._metadata,
    }
  }

  updateLastPayment(paymentId: string, paymentDate: Date) {
    this._lastPaymentId = paymentId
    this._lastPaymentDate = paymentDate
  }

  get id() {
    return this._id
  }
  get userId() {
    return this._userId
  }
  get document() {
    return this._document
  }
  get apartmentId() {
    return this._apartmentId
  }
  get valid() {
    return this._valid
  }
  get dueDate() {
    return this._dueDate
  }
  get images() {
    return this._images
  }
  get rentAmount() {
    return this._rentAmount
  }
  get options() {
    return this._options
  }
  get balance() {
    return this._balance
  }
  get lastPaymentId() {
    return this._lastPaymentId
  }
  get lastPaymentDate() {
    return this._lastPaymentDate
  }
  get metadata() {
    return this._metadata
  }
}

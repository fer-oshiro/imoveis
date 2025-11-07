import { Metadata, MetadataSchema } from '@core/common'

import { OccupancySource, OccupancyStatus } from '../vo'

export interface OccupancyProps {
  apartmentId: string
  date: string
  status: OccupancyStatus
  source?: OccupancySource
  contractId?: string | null
  note?: string | null
  metadata: Metadata
}

export class Occupancy {
  private constructor(private props: OccupancyProps) {}

  static create(params: {
    apartmentId: string
    date: string
    status?: OccupancyStatus
    source?: OccupancySource
    contractId?: string | null
    note?: string | null
  }): Occupancy {
    const now = new Date()

    return new Occupancy({
      apartmentId: params.apartmentId,
      date: params.date,
      status: params.status ?? OccupancyStatus.OCCUPIED,
      source: params.source,
      contractId: params.contractId ?? null,
      note: params.note ?? null,
      metadata: MetadataSchema.parse({ createdAt: now, updatedAt: now }),
    })
  }

  static restore(props: OccupancyProps): Occupancy {
    return new Occupancy(props)
  }

  get apartmentId() {
    return this.props.apartmentId
  }

  get date() {
    return this.props.date
  }

  get status() {
    return this.props.status
  }

  get source() {
    return this.props.source
  }

  get contractId() {
    return this.props.contractId
  }

  get note() {
    return this.props.note
  }

  get createdAt() {
    return this.props.metadata.createdAt
  }

  get updatedAt() {
    return this.props.metadata.updatedAt
  }

  setStatus(status: OccupancyStatus) {
    this.props.status = status
    this.touch()
  }

  setNote(note: string | null) {
    this.props.note = note
    this.touch()
  }

  private touch() {
    this.props.metadata.updatedAt = new Date().toISOString()
  }

  toJSON(): Readonly<OccupancyProps> {
    return { ...this.props }
  }
}

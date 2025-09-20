export interface EntityMetadata {
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
  version: number
}

export class EntityMetadataVO implements EntityMetadata {
  public readonly createdAt: Date
  public readonly updatedAt: Date
  public readonly createdBy?: string
  public readonly updatedBy?: string
  public readonly version: number

  constructor(
    data: {
      createdAt?: Date
      updatedAt?: Date
      createdBy?: string
      updatedBy?: string
      version?: number
    } = {},
  ) {
    const now = new Date()
    this.createdAt = data.createdAt || now
    this.updatedAt = data.updatedAt || now
    this.createdBy = data.createdBy
    this.updatedBy = data.updatedBy
    this.version = data.version || 1
  }

  static create(createdBy?: string): EntityMetadataVO {
    return new EntityMetadataVO({ createdBy })
  }

  update(updatedBy?: string): EntityMetadataVO {
    return new EntityMetadataVO({
      createdAt: this.createdAt,
      updatedAt: new Date(),
      createdBy: this.createdBy,
      updatedBy,
      version: this.version + 1,
    })
  }

  toJSON(): Record<string, any> {
    return {
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      version: this.version,
    }
  }

  static fromJSON(data: Record<string, any>): EntityMetadataVO {
    return new EntityMetadataVO({
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
      version: data.version,
    })
  }
}

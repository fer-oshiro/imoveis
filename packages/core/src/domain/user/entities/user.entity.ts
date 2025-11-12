import { randomUUID } from 'node:crypto'

import { Metadata, MetadataSchema, Status } from '@imovel/core/domain/common'

import { Role } from '../vo'

export class User {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly docName: string,
    readonly role: Role[],
    readonly status: Status,
    readonly metadata: Metadata,
    readonly email?: string,
    readonly phone?: string,
    readonly document?: string,
  ) {}

  static create(props: {
    id?: string
    name?: string
    docName?: string
    role?: Role[]
    status?: Status
    metadata?: Metadata
    email?: string
    phone?: string
    document?: string
  }): User {
    return new User(
      props.id || randomUUID(),
      props.name || '',
      props.docName || '',
      props.role || [Role.TENANT],
      props.status || Status.ACTIVE,
      props.metadata || MetadataSchema.parse({}),
      props.email,
      props.phone,
      props.document,
    )
  }
}

import { Metadata, Status } from '@imovel/core/domain/common'

import { Role } from '../vo'

export class User {
  constructor(
    readonly pk: string,
    readonly sk: string,
    readonly name: string,
    readonly docName: string,
    readonly role: Role[],
    readonly status: Status,
    readonly metadata: Metadata,
    readonly email?: string,
    readonly phone?: string,
    readonly document?: string,
  ) {}
}

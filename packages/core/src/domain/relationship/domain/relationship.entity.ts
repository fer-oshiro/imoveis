import { Metadata, Status } from '@imovel/core/domain/common'

import { RELATIONSHIP_TYPE } from '../vo'

export class Relationship {
  constructor(
    readonly pk: string,
    readonly sk: string,
    readonly kind: RELATIONSHIP_TYPE,
    readonly access: 'read' | 'write' | 'null',
    readonly status: Status,
    readonly metadata: Metadata,
  ) {}
}

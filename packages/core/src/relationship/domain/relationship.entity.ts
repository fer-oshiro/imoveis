import { Metadata, Status } from '@core/common'

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

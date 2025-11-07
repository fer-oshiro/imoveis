import { Metadata, MetadataSchema } from '@imovel/core/domain/common'
import { User } from '@imovel/core/domain/user'

import { Option } from '../vo'

export class Contract {
  constructor(
    readonly pk: string,
    readonly sk: string,
    readonly user: User,
    readonly valid: boolean,
    readonly dueDate?: Date,
    readonly images: string[] = [],
    readonly rentAmount: number = 0,
    readonly options: Option[] = [Option.FURNISHED],
    readonly balance: number = 0,
    readonly metadata: Metadata = MetadataSchema.parse({}),
  ) {}
}

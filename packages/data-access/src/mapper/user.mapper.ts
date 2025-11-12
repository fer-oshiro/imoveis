import { User } from '@imovel/core/domain/user'

export function mapUserToDynamo(user: User): Record<string, unknown> {
  return {
    PK: `USER#${user.id}`,
    SK: `PROFILE`,
    name: user.name,
    docName: user.docName,
    role: user.role,
    status: user.status,
    email: user.email,
    phone: user.phone,
    document: user.document,
    metadata: user.metadata,
  }
}

export function mapDynamoToUser(item: Record<string, any>): User {
  return User.create({
    id: item.PK.replace('USER#', ''),
    name: item.name,
    docName: item.docName,
    role: item.role,
    status: item.status,
    metadata: item.metadata,
    email: item.email,
    phone: item.phone,
    document: item.document,
  })
}

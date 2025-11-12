import { User } from '@imovel/core/domain/user'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  save(user: User): Promise<void>
  delete(user: User): Promise<void>
}

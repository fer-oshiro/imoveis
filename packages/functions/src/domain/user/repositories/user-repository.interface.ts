import { IBaseRepository, IQueryableRepository } from '../../shared';
import { User, UserStatus } from '../entities/user.entity';

export interface IUserRepository extends IBaseRepository<User, string>, IQueryableRepository<User> {
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findByStatus(status: UserStatus): Promise<User[]>;
    findByApartment(unitCode: string): Promise<User[]>;
    existsByPhoneNumber(phoneNumber: string): Promise<boolean>;
    existsByDocument(document: string): Promise<boolean>;
    existsByCpf(cpf: string): Promise<boolean>; // Backward compatibility
}
import { IBaseRepository } from '../../shared/interfaces/base-repository.interface';
import { UserApartmentRelation } from '../entities/user-apartment-relation.entity';
import { UserRole } from '../vo/user-role.vo';

export interface RelationshipKey {
    apartmentUnitCode: string;
    userPhoneNumber: string;
    role: UserRole;
}

export interface IRelationshipRepository extends IBaseRepository<UserApartmentRelation, RelationshipKey> {
    // Apartment-centric queries
    findByApartment(apartmentUnitCode: string): Promise<UserApartmentRelation[]>;
    findByApartmentAndRole(apartmentUnitCode: string, role: UserRole): Promise<UserApartmentRelation[]>;
    findActiveByApartment(apartmentUnitCode: string): Promise<UserApartmentRelation[]>;

    // User-centric queries
    findByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]>;
    findActiveByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]>;
    findByUserAndRole(userPhoneNumber: string, role: UserRole): Promise<UserApartmentRelation[]>;

    // Specific relationship queries
    findByApartmentAndUser(apartmentUnitCode: string, userPhoneNumber: string): Promise<UserApartmentRelation[]>;
    findSpecificRelation(apartmentUnitCode: string, userPhoneNumber: string, role: UserRole): Promise<UserApartmentRelation | null>;

    // Bulk operations
    findMultipleByApartments(apartmentUnitCodes: string[]): Promise<UserApartmentRelation[]>;
    findMultipleByUsers(userPhoneNumbers: string[]): Promise<UserApartmentRelation[]>;

    // Existence checks
    relationshipExists(apartmentUnitCode: string, userPhoneNumber: string, role: UserRole): Promise<boolean>;
    hasActiveRelationship(apartmentUnitCode: string, userPhoneNumber: string): Promise<boolean>;
}
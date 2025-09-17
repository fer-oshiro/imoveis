import { UserApartmentRelation } from '../../entities/user-apartment-relation.entity';
import { UserRole } from '../../vo/user-role.vo';
import { ValidationError } from '../../../shared/errors/domain-error';

describe('UserApartmentRelation Entity', () => {
    const validData = {
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511987654321',
        role: UserRole.PRIMARY_TENANT,
        createdBy: 'test-user',
    };

    describe('create', () => {
        it('should create a valid relationship', () => {
            const relationship = UserApartmentRelation.create(validData);

            expect(relationship.apartmentUnitCode).toBe('A101');
            expect(relationship.userPhoneNumber.value).toBe('+5511987654321');
            expect(relationship.role.value).toBe(UserRole.PRIMARY_TENANT);
            expect(relationship.isActive).toBe(true);
            expect(relationship.pk).toBe('APARTMENT#A101');
            expect(relationship.sk).toBe('USER#+5511987654321#primary_tenant');
        });

        it('should create relationship with relationship type for secondary tenant', () => {
            const data = {
                ...validData,
                role: UserRole.SECONDARY_TENANT,
                relationshipType: 'spouse',
            };

            const relationship = UserApartmentRelation.create(data);

            expect(relationship.role.value).toBe(UserRole.SECONDARY_TENANT);
            expect(relationship.relationshipType).toBe('spouse');
        });

        it('should default isActive to true', () => {
            const relationship = UserApartmentRelation.create(validData);
            expect(relationship.isActive).toBe(true);
        });

        it('should allow setting isActive to false', () => {
            const data = { ...validData, isActive: false };
            const relationship = UserApartmentRelation.create(data);
            expect(relationship.isActive).toBe(false);
        });

        it('should throw error for empty apartment unit code', () => {
            const data = { ...validData, apartmentUnitCode: '' };
            expect(() => UserApartmentRelation.create(data)).toThrow(ValidationError);
        });

        it('should throw error for empty user phone number', () => {
            const data = { ...validData, userPhoneNumber: '' };
            expect(() => UserApartmentRelation.create(data)).toThrow(ValidationError);
        });

        it('should throw error for secondary tenant without relationship type', () => {
            const data = {
                ...validData,
                role: UserRole.SECONDARY_TENANT,
            };
            expect(() => UserApartmentRelation.create(data)).toThrow(ValidationError);
        });
    });

    describe('business logic methods', () => {
        let relationship: UserApartmentRelation;

        beforeEach(() => {
            relationship = UserApartmentRelation.create({
                ...validData,
                role: UserRole.SECONDARY_TENANT,
                relationshipType: 'child',
            });
        });

        it('should update relationship type', () => {
            relationship.updateRelationshipType('spouse', 'updater');
            expect(relationship.relationshipType).toBe('spouse');
        });

        it('should activate relationship', () => {
            relationship.deactivate('deactivator');
            expect(relationship.isActive).toBe(false);

            relationship.activate('activator');
            expect(relationship.isActive).toBe(true);
        });

        it('should deactivate relationship', () => {
            expect(relationship.isActive).toBe(true);

            relationship.deactivate('deactivator');
            expect(relationship.isActive).toBe(false);
        });

        it('should throw error when activating already active relationship', () => {
            expect(() => relationship.activate()).toThrow(ValidationError);
        });

        it('should throw error when deactivating already inactive relationship', () => {
            relationship.deactivate();
            expect(() => relationship.deactivate()).toThrow(ValidationError);
        });
    });

    describe('GSI keys', () => {
        it('should generate correct user-centric keys', () => {
            const relationship = UserApartmentRelation.create(validData);

            expect(relationship.getUserCentricPK()).toBe('USER#+5511987654321');
            expect(relationship.getUserCentricSK()).toBe('APARTMENT#A101#primary_tenant');
        });
    });

    describe('serialization', () => {
        it('should serialize to DynamoDB item correctly', () => {
            const relationship = UserApartmentRelation.create(validData);
            const item = relationship.toDynamoItem();

            expect(item.pk).toBe('APARTMENT#A101');
            expect(item.sk).toBe('USER#+5511987654321#primary_tenant');
            expect(item.apartmentUnitCode).toBe('A101');
            expect(item.userPhoneNumber).toBe('+5511987654321');
            expect(item.role).toBe(UserRole.PRIMARY_TENANT);
            expect(item.isActive).toBe(true);
            expect(item.GSI1PK).toBe('USER#+5511987654321');
            expect(item.GSI1SK).toBe('APARTMENT#A101#primary_tenant');
            expect(item.metadata).toBeDefined();
        });

        it('should serialize to JSON correctly', () => {
            const relationship = UserApartmentRelation.create(validData);
            const json = relationship.toJSON();

            expect(json.apartmentUnitCode).toBe('A101');
            expect(json.userPhoneNumber).toBe('+55 11 98765 4321'); // Formatted phone number
            expect(json.role).toBe(UserRole.PRIMARY_TENANT);
            expect(json.isActive).toBe(true);
            expect(json.createdAt).toBeInstanceOf(Date);
            expect(json.updatedAt).toBeInstanceOf(Date);
        });

        it('should deserialize from DynamoDB item correctly', () => {
            const item = {
                pk: 'APARTMENT#A101',
                sk: 'USER#+5511987654321#primary_tenant',
                apartmentUnitCode: 'A101',
                userPhoneNumber: '+5511987654321',
                role: UserRole.PRIMARY_TENANT,
                relationshipType: undefined,
                isActive: true,
                metadata: {
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1,
                },
            };

            const relationship = UserApartmentRelation.fromDynamoItem(item);

            expect(relationship.apartmentUnitCode).toBe('A101');
            expect(relationship.userPhoneNumber.value).toBe('+5511987654321');
            expect(relationship.role.value).toBe(UserRole.PRIMARY_TENANT);
            expect(relationship.isActive).toBe(true);
        });
    });
});
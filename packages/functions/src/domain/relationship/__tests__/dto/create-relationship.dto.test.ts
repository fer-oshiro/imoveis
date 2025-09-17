import { CreateRelationshipDto } from '../../dto/create-relationship.dto';
import { UserRole } from '../../vo/user-role.vo';

describe('CreateRelationshipDto', () => {
    const validData = {
        apartmentUnitCode: 'A101',
        userPhoneNumber: '+5511987654321',
        role: UserRole.PRIMARY_TENANT,
        createdBy: 'test-user',
    };

    describe('create', () => {
        it('should create valid DTO', () => {
            const dto = CreateRelationshipDto.create(validData);

            expect(dto.apartmentUnitCode).toBe('A101');
            expect(dto.userPhoneNumber).toBe('+5511987654321');
            expect(dto.role).toBe(UserRole.PRIMARY_TENANT);
            expect(dto.isActive).toBe(true);
            expect(dto.createdBy).toBe('test-user');
        });

        it('should trim whitespace from string fields', () => {
            const data = {
                ...validData,
                apartmentUnitCode: '  A101  ',
                userPhoneNumber: '  +5511987654321  ',
                relationshipType: '  spouse  ',
                createdBy: '  test-user  ',
            };

            const dto = CreateRelationshipDto.create(data);

            expect(dto.apartmentUnitCode).toBe('A101');
            expect(dto.userPhoneNumber).toBe('+5511987654321');
            expect(dto.relationshipType).toBe('spouse');
            expect(dto.createdBy).toBe('test-user');
        });

        it('should default isActive to true', () => {
            const dto = CreateRelationshipDto.create(validData);
            expect(dto.isActive).toBe(true);
        });

        it('should allow setting isActive to false', () => {
            const data = { ...validData, isActive: false };
            const dto = CreateRelationshipDto.create(data);
            expect(dto.isActive).toBe(false);
        });
    });

    describe('validation', () => {
        it('should validate successfully with valid data', () => {
            const dto = CreateRelationshipDto.create(validData);
            const errors = dto.validate();
            expect(errors).toHaveLength(0);
            expect(dto.isValid()).toBe(true);
        });

        it('should require apartment unit code', () => {
            const data = { ...validData, apartmentUnitCode: '' };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors).toContain('Apartment unit code is required');
            expect(dto.isValid()).toBe(false);
        });

        it('should require user phone number', () => {
            const data = { ...validData, userPhoneNumber: '' };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors).toContain('User phone number is required');
            expect(dto.isValid()).toBe(false);
        });

        it('should require user role', () => {
            const data = { ...validData, role: undefined as any };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors).toContain('User role is required');
            expect(dto.isValid()).toBe(false);
        });

        it('should validate user role values', () => {
            const data = { ...validData, role: 'invalid_role' as UserRole };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors.some(error => error.includes('Invalid user role'))).toBe(true);
            expect(dto.isValid()).toBe(false);
        });

        it('should require relationship type for secondary tenants', () => {
            const data = {
                ...validData,
                role: UserRole.SECONDARY_TENANT,
            };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors).toContain('Relationship type is required for secondary tenants');
            expect(dto.isValid()).toBe(false);
        });

        it('should allow relationship type for secondary tenants', () => {
            const data = {
                ...validData,
                role: UserRole.SECONDARY_TENANT,
                relationshipType: 'spouse',
            };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors).toHaveLength(0);
            expect(dto.isValid()).toBe(true);
        });

        it('should not require relationship type for other roles', () => {
            const roles = [
                UserRole.PRIMARY_TENANT,
                UserRole.EMERGENCY_CONTACT,
                UserRole.ADMIN,
                UserRole.OPS,
            ];

            for (const role of roles) {
                const data = { ...validData, role };
                const dto = CreateRelationshipDto.create(data);
                const errors = dto.validate();

                expect(errors).toHaveLength(0);
                expect(dto.isValid()).toBe(true);
            }
        });

        it('should collect multiple validation errors', () => {
            const data = {
                apartmentUnitCode: '',
                userPhoneNumber: '',
                role: undefined as any,
            };
            const dto = CreateRelationshipDto.create(data);
            const errors = dto.validate();

            expect(errors.length).toBeGreaterThan(1);
            expect(errors).toContain('Apartment unit code is required');
            expect(errors).toContain('User phone number is required');
            expect(errors).toContain('User role is required');
            expect(dto.isValid()).toBe(false);
        });
    });
});
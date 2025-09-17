import { User, UserStatus } from '../../entities/user.entity';
import { ValidationError } from '../../../shared/errors/domain-error';

describe('User Entity', () => {
    const validUserData = {
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        document: '11144477735', // Valid CPF
        email: 'joao@example.com',
    };

    describe('create', () => {
        it('should create a valid user', () => {
            const user = User.create(validUserData);

            expect(user.name).toBe('João Silva');
            expect(user.phoneNumber.value).toBe('+5511987654321');
            expect(user.document.value).toBe('11144477735');
            expect(user.email).toBe('joao@example.com');
            expect(user.status).toBe(UserStatus.ACTIVE);
            expect(user.isActive).toBe(true);
        });

        it('should create user without email', () => {
            const { email, ...userData } = validUserData;

            const user = User.create(userData);

            expect(user.email).toBeUndefined();
        });

        it('should create user with custom status', () => {
            const user = User.create({
                ...validUserData,
                status: UserStatus.INACTIVE,
            });

            expect(user.status).toBe(UserStatus.INACTIVE);
            expect(user.isActive).toBe(false);
        });

        it('should throw error for empty name', () => {
            expect(() => {
                User.create({
                    ...validUserData,
                    name: '',
                });
            }).toThrow(ValidationError);
        });

        it('should throw error for short name', () => {
            expect(() => {
                User.create({
                    ...validUserData,
                    name: 'A',
                });
            }).toThrow(ValidationError);
        });

        it('should throw error for invalid email', () => {
            expect(() => {
                User.create({
                    ...validUserData,
                    email: 'invalid-email',
                });
            }).toThrow(ValidationError);
        });

        it('should throw error for invalid phone number', () => {
            expect(() => {
                User.create({
                    ...validUserData,
                    phoneNumber: 'invalid-phone',
                });
            }).toThrow(ValidationError);
        });

        it('should throw error for invalid CPF', () => {
            expect(() => {
                User.create({
                    ...validUserData,
                    document: '12345678900', // Invalid CPF
                });
            }).toThrow(ValidationError);
        });
    });

    describe('updateProfile', () => {
        let user: User;

        beforeEach(() => {
            user = User.create(validUserData);
        });

        it('should update name', () => {
            user.updateProfile({ name: 'Maria Silva' });

            expect(user.name).toBe('Maria Silva');
            expect(user.metadata.version).toBe(2); // Version should increment
        });

        it('should update email', () => {
            user.updateProfile({ email: 'maria@example.com' });

            expect(user.email).toBe('maria@example.com');
        });

        it('should remove email when set to undefined', () => {
            user.updateProfile({ email: undefined });

            expect(user.email).toBeUndefined();
        });

        it('should throw error for empty name', () => {
            expect(() => {
                user.updateProfile({ name: '' });
            }).toThrow(ValidationError);
        });

        it('should throw error for invalid email', () => {
            expect(() => {
                user.updateProfile({ email: 'invalid-email' });
            }).toThrow(ValidationError);
        });
    });

    describe('status management', () => {
        let user: User;

        beforeEach(() => {
            user = User.create(validUserData);
        });

        it('should activate inactive user', () => {
            user.deactivate();
            user.activate();

            expect(user.status).toBe(UserStatus.ACTIVE);
            expect(user.isActive).toBe(true);
        });

        it('should deactivate active user', () => {
            user.deactivate();

            expect(user.status).toBe(UserStatus.INACTIVE);
            expect(user.isActive).toBe(false);
        });

        it('should suspend active user', () => {
            user.suspend();

            expect(user.status).toBe(UserStatus.SUSPENDED);
            expect(user.isActive).toBe(false);
        });

        it('should throw error when activating already active user', () => {
            expect(() => {
                user.activate();
            }).toThrow(ValidationError);
        });

        it('should throw error when deactivating already inactive user', () => {
            user.deactivate();

            expect(() => {
                user.deactivate();
            }).toThrow(ValidationError);
        });

        it('should throw error when suspending already suspended user', () => {
            user.suspend();

            expect(() => {
                user.suspend();
            }).toThrow(ValidationError);
        });
    });

    describe('serialization', () => {
        it('should serialize to DynamoDB item', () => {
            const user = User.create(validUserData);
            const item = user.toDynamoItem();

            expect(item.pk).toBe('USER#+5511987654321');
            expect(item.sk).toBe('PROFILE');
            expect(item.phoneNumber).toBe('+5511987654321');
            expect(item.name).toBe('João Silva');
            expect(item.document).toBe('11144477735');
            expect(item.email).toBe('joao@example.com');
            expect(item.status).toBe(UserStatus.ACTIVE);
            expect(item.metadata).toBeDefined();
        });

        it('should serialize to JSON', () => {
            const user = User.create(validUserData);
            const json = user.toJSON();

            expect(json.phoneNumber).toBe('+55 11 98765 4321'); // Formatted
            expect(json.name).toBe('João Silva');
            expect(json.document).toBe('111.444.777-35'); // Formatted
            expect(json.email).toBe('joao@example.com');
            expect(json.status).toBe(UserStatus.ACTIVE);
            expect(json.isActive).toBe(true);
            expect(json.createdAt).toBeDefined();
            expect(json.updatedAt).toBeDefined();
        });

        it('should deserialize from DynamoDB item', () => {
            const originalUser = User.create(validUserData);
            const item = originalUser.toDynamoItem();

            const deserializedUser = User.fromDynamoItem(item);

            expect(deserializedUser.phoneNumber.value).toBe(originalUser.phoneNumber.value);
            expect(deserializedUser.name).toBe(originalUser.name);
            expect(deserializedUser.document.value).toBe(originalUser.document.value);
            expect(deserializedUser.email).toBe(originalUser.email);
            expect(deserializedUser.status).toBe(originalUser.status);
        });
    });
});
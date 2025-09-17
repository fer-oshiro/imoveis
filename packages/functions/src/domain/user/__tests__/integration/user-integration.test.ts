import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../../services/user.service';
import { UserRepository } from '../../repositories/user.repository';
import { User, UserStatus } from '../../entities/user.entity';

// Mock DynamoDB client for integration tests
const mockDynamoClient = {
    send: async (command: any) => {
        // Mock implementation for basic operations
        if (command.constructor.name === 'GetCommand') {
            return { Item: null }; // User not found
        }
        if (command.constructor.name === 'PutCommand') {
            return {}; // Success
        }
        if (command.constructor.name === 'ScanCommand') {
            return { Items: [] }; // No items found
        }
        return {};
    }
} as any;

describe('User Integration Tests', () => {
    let userService: UserService;
    let userRepository: UserRepository;

    beforeEach(() => {
        userRepository = new UserRepository('test-table', mockDynamoClient);
        userService = new UserService(userRepository);
    });

    const validUserData = {
        phoneNumber: '+5511987654321',
        name: 'João Silva',
        document: '11144477735',
        email: 'joao@example.com',
    };

    it('should create user entity with proper key structure', () => {
        const user = User.create(validUserData);
        const dynamoItem = user.toDynamoItem();

        expect(dynamoItem.pk).toBe('USER#+5511987654321');
        expect(dynamoItem.sk).toBe('PROFILE');
        expect(dynamoItem.phoneNumber).toBe('+5511987654321');
        expect(dynamoItem.name).toBe('João Silva');
        expect(dynamoItem.document).toBe('11144477735');
        expect(dynamoItem.email).toBe('joao@example.com');
        expect(dynamoItem.status).toBe(UserStatus.ACTIVE);
        expect(dynamoItem.metadata).toBeDefined();
    });

    it('should serialize and deserialize user correctly', () => {
        const originalUser = User.create(validUserData);
        const dynamoItem = originalUser.toDynamoItem();
        const deserializedUser = User.fromDynamoItem(dynamoItem);

        expect(deserializedUser.phoneNumber.value).toBe(originalUser.phoneNumber.value);
        expect(deserializedUser.name).toBe(originalUser.name);
        expect(deserializedUser.document.value).toBe(originalUser.document.value);
        expect(deserializedUser.email).toBe(originalUser.email);
        expect(deserializedUser.status).toBe(originalUser.status);
    });

    it('should handle user lifecycle operations', () => {
        const user = User.create(validUserData);

        // Test status changes
        expect(user.isActive).toBe(true);

        user.deactivate('admin');
        expect(user.status).toBe(UserStatus.INACTIVE);
        expect(user.isActive).toBe(false);

        user.activate('admin');
        expect(user.status).toBe(UserStatus.ACTIVE);
        expect(user.isActive).toBe(true);

        user.suspend('admin');
        expect(user.status).toBe(UserStatus.SUSPENDED);
        expect(user.isActive).toBe(false);
    });

    it('should handle profile updates correctly', () => {
        const user = User.create(validUserData);
        const originalVersion = user.metadata.version;

        user.updateProfile({
            name: 'Maria Silva',
            email: 'maria@example.com',
            updatedBy: 'admin'
        });

        expect(user.name).toBe('Maria Silva');
        expect(user.email).toBe('maria@example.com');
        expect(user.metadata.version).toBe(originalVersion + 1);
        expect(user.metadata.updatedBy).toBe('admin');
    });

    it('should validate business rules', () => {
        const user = User.create(validUserData);

        // Cannot activate already active user
        expect(() => user.activate()).toThrow();

        // Cannot deactivate already inactive user
        user.deactivate();
        expect(() => user.deactivate()).toThrow();

        // Cannot suspend already suspended user
        user.activate();
        user.suspend();
        expect(() => user.suspend()).toThrow();
    });
});
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { PhoneNumberVO } from '../../shared';
import { DatabaseError } from '../../shared/errors/domain-error';
import { BaseRepository } from '../../shared/repositories/base-repository.abstract';
import { UserApartmentRelation } from '../entities/user-apartment-relation.entity';
import { UserRole, UserRoleVO } from '../vo/user-role.vo';
import { IRelationshipRepository, RelationshipKey } from './relationship.repository.interface';

export class RelationshipRepository extends BaseRepository<UserApartmentRelation, RelationshipKey> implements IRelationshipRepository {
    constructor(tableName: string, dynamoClient: DynamoDBDocumentClient) {
        super(tableName, dynamoClient);
    }

    async findById(key: RelationshipKey): Promise<UserApartmentRelation | null> {
        return this.findSpecificRelation(key.apartmentUnitCode, key.userPhoneNumber, key.role);
    }

    async findSpecificRelation(apartmentUnitCode: string, userPhoneNumber: string, role: UserRole): Promise<UserApartmentRelation | null> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(userPhoneNumber);
            const roleVO = UserRoleVO.create(role);

            const pk = `APARTMENT#${apartmentUnitCode}`;
            const sk = `USER#${phoneNumberVO.value}#${roleVO.value}`;

            const command = new GetCommand({
                TableName: this.tableName,
                Key: { pk, sk },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Item) {
                return null;
            }

            return this.mapToEntity(result.Item);
        } catch (error) {
            if (error instanceof Error && error.name !== 'ValidationError') {
                throw new DatabaseError(`Failed to find specific relationship: ${error.message}`, error);
            }
            throw error;
        }
    }

    async findByApartment(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': `APARTMENT#${apartmentUnitCode}`,
                    ':skPrefix': 'USER#',
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by apartment: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findByApartmentAndRole(apartmentUnitCode: string, role: UserRole): Promise<UserApartmentRelation[]> {
        try {
            const roleVO = UserRoleVO.create(role);

            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                FilterExpression: '#role = :role',
                ExpressionAttributeValues: {
                    ':pk': `APARTMENT#${apartmentUnitCode}`,
                    ':skPrefix': 'USER#',
                    ':role': roleVO.value,
                },
                ExpressionAttributeNames: {
                    '#role': 'role',
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by apartment and role: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findActiveByApartment(apartmentUnitCode: string): Promise<UserApartmentRelation[]> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                FilterExpression: 'isActive = :isActive',
                ExpressionAttributeValues: {
                    ':pk': `APARTMENT#${apartmentUnitCode}`,
                    ':skPrefix': 'USER#',
                    ':isActive': true,
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find active relationships by apartment: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(userPhoneNumber);

            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :gsi1pk',
                ExpressionAttributeValues: {
                    ':gsi1pk': `USER#${phoneNumberVO.value}`,
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by user: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findActiveByUser(userPhoneNumber: string): Promise<UserApartmentRelation[]> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(userPhoneNumber);

            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :gsi1pk',
                FilterExpression: 'isActive = :isActive',
                ExpressionAttributeValues: {
                    ':gsi1pk': `USER#${phoneNumberVO.value}`,
                    ':isActive': true,
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find active relationships by user: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findByUserAndRole(userPhoneNumber: string, role: UserRole): Promise<UserApartmentRelation[]> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(userPhoneNumber);
            const roleVO = UserRoleVO.create(role);

            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'GSI1',
                KeyConditionExpression: 'GSI1PK = :gsi1pk',
                FilterExpression: '#role = :role',
                ExpressionAttributeValues: {
                    ':gsi1pk': `USER#${phoneNumberVO.value}`,
                    ':role': roleVO.value,
                },
                ExpressionAttributeNames: {
                    '#role': 'role',
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by user and role: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findByApartmentAndUser(apartmentUnitCode: string, userPhoneNumber: string): Promise<UserApartmentRelation[]> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(userPhoneNumber);

            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
                ExpressionAttributeValues: {
                    ':pk': `APARTMENT#${apartmentUnitCode}`,
                    ':skPrefix': `USER#${phoneNumberVO.value}#`,
                },
            });

            const result = await this.dynamoClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => this.mapToEntity(item));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by apartment and user: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findMultipleByApartments(apartmentUnitCodes: string[]): Promise<UserApartmentRelation[]> {
        if (apartmentUnitCodes.length === 0) {
            return [];
        }

        try {
            const allRelationships: UserApartmentRelation[] = [];

            // Process in batches to avoid overwhelming DynamoDB
            const batchSize = 10;
            for (let i = 0; i < apartmentUnitCodes.length; i += batchSize) {
                const batch = apartmentUnitCodes.slice(i, i + batchSize);
                const batchPromises = batch.map(unitCode => this.findByApartment(unitCode));
                const batchResults = await Promise.all(batchPromises);

                for (const relationships of batchResults) {
                    allRelationships.push(...relationships);
                }
            }

            return allRelationships;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by multiple apartments: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async findMultipleByUsers(userPhoneNumbers: string[]): Promise<UserApartmentRelation[]> {
        if (userPhoneNumbers.length === 0) {
            return [];
        }

        try {
            const allRelationships: UserApartmentRelation[] = [];

            // Process in batches to avoid overwhelming DynamoDB
            const batchSize = 10;
            for (let i = 0; i < userPhoneNumbers.length; i += batchSize) {
                const batch = userPhoneNumbers.slice(i, i + batchSize);
                const batchPromises = batch.map(phoneNumber => this.findByUser(phoneNumber));
                const batchResults = await Promise.all(batchPromises);

                for (const relationships of batchResults) {
                    allRelationships.push(...relationships);
                }
            }

            return allRelationships;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to find relationships by multiple users: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async relationshipExists(apartmentUnitCode: string, userPhoneNumber: string, role: UserRole): Promise<boolean> {
        const relationship = await this.findSpecificRelation(apartmentUnitCode, userPhoneNumber, role);
        return relationship !== null;
    }

    async hasActiveRelationship(apartmentUnitCode: string, userPhoneNumber: string): Promise<boolean> {
        const relationships = await this.findByApartmentAndUser(apartmentUnitCode, userPhoneNumber);
        return relationships.some(rel => rel.isActive);
    }

    async save(relationship: UserApartmentRelation): Promise<UserApartmentRelation> {
        try {
            const item = this.mapFromEntity(relationship);

            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
            });

            await this.dynamoClient.send(command);
            return relationship;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new DatabaseError(`Failed to save relationship: ${errorMessage}`, error instanceof Error ? error : undefined);
        }
    }

    async delete(key: RelationshipKey): Promise<void> {
        try {
            const phoneNumberVO = PhoneNumberVO.create(key.userPhoneNumber);
            const roleVO = UserRoleVO.create(key.role);

            const pk = `APARTMENT#${key.apartmentUnitCode}`;
            const sk = `USER#${phoneNumberVO.value}#${roleVO.value}`;

            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: { pk, sk },
            });

            await this.dynamoClient.send(command);
        } catch (error) {
            if (error instanceof Error && error.name !== 'ValidationError') {
                throw new DatabaseError(`Failed to delete relationship: ${error.message}`, error);
            }
            throw error;
        }
    }

    protected mapToEntity(item: Record<string, any>): UserApartmentRelation {
        return UserApartmentRelation.fromDynamoItem(item);
    }

    protected mapFromEntity(relationship: UserApartmentRelation): Record<string, any> {
        return relationship.toDynamoItem();
    }
}
# User-Apartment Relationship Domain

This domain manages the relationships between users and apartments, including roles, relationship types, and active status.

## Overview

The UserApartmentRelation domain handles the many-to-many relationship between users and apartments, with additional metadata about the nature of the relationship (role, relationship type, active status).

## Key Concepts

### User Roles
- **PRIMARY_TENANT**: The main tenant responsible for the apartment
- **SECONDARY_TENANT**: Additional tenants (spouse, children, etc.)
- **EMERGENCY_CONTACT**: Emergency contacts for the apartment
- **ADMIN**: Administrative users with full access
- **OPS**: Operations users with management access

### Relationship Types
Used primarily for secondary tenants to specify their relationship to the primary tenant:
- spouse, child, parent, sibling, friend, etc.

### Active Status
Indicates whether the relationship is currently active. Inactive relationships are kept for historical purposes.

## DynamoDB Key Structure

### Main Table
- **PK**: `APARTMENT#{unitCode}`
- **SK**: `USER#{phoneNumber}#{role}`

### GSI1 (User-centric queries)
- **GSI1PK**: `USER#{phoneNumber}`
- **GSI1SK**: `APARTMENT#{unitCode}#{role}`

## Business Rules

1. **Only one active primary tenant per apartment**
2. **Relationship type is required for secondary tenants**
3. **Active relationships cannot be deleted (must be deactivated first)**
4. **Phone numbers are validated and stored in E.164 format**

## Usage Examples

### Creating a Relationship
```typescript
const dto = CreateRelationshipDto.create({
    apartmentUnitCode: 'A101',
    userPhoneNumber: '+5511987654321',
    role: UserRole.PRIMARY_TENANT,
    isActive: true,
    createdBy: 'admin'
});

const relationship = await relationshipService.createRelationship(dto);
```

### Querying Relationships
```typescript
// Get all users for an apartment
const users = await relationshipService.getUsersByApartment('A101');

// Get all apartments for a user
const apartments = await relationshipService.getApartmentsByUser('+5511987654321');

// Get primary tenant for an apartment
const primaryTenant = await relationshipService.getPrimaryTenant('A101');
```

### Updating Relationships
```typescript
const updateDto = UpdateRelationshipDto.create({
    relationshipType: 'spouse',
    updatedBy: 'admin'
});

await relationshipService.updateRelationship(
    'A101',
    '+5511987654321',
    UserRole.SECONDARY_TENANT,
    updateDto
);
```

## Query Patterns Supported

### Apartment-centric
- All relationships for an apartment
- Active relationships for an apartment
- Relationships by apartment and role
- Users by apartment (with relationship info)

### User-centric
- All relationships for a user
- Active relationships for a user
- Relationships by user and role
- Apartments by user (with relationship info)

### Combined
- Relationships between specific user and apartment
- Bulk queries for multiple apartments or users

## Error Handling

The domain throws specific errors for different scenarios:
- `ValidationError`: Invalid input data
- `BusinessRuleViolationError`: Business rule violations (e.g., multiple primary tenants)
- `EntityNotFoundError`: Relationship not found
- `DatabaseError`: Database operation failures

## Testing

Unit tests should cover:
- Entity creation and validation
- Value object validation (UserRole, PhoneNumber)
- Repository operations with mocked DynamoDB
- Service business logic with mocked repositories
- DTO validation and transformation
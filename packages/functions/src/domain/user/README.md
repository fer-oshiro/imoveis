# User Domain

This domain handles user management with flexible document validation supporting both CPF and CNPJ, or no document at all.

## Key Features

### Flexible Document System

- **DocumentVO**: Handles CPF, CNPJ, or no document
- **Auto-detection**: Automatically detects document type based on length
- **Validation**: Full validation for both CPF and CNPJ formats
- **Backward compatibility**: Supports legacy CPF-only data

### Zod Validation

- All DTOs use Zod schemas for runtime validation
- Custom validators for phone numbers and documents
- Type-safe with TypeScript inference

### Entity Design

- **User Entity**: Core user with phone number, name, optional document, email
- **Status Management**: ACTIVE, INACTIVE, SUSPENDED states
- **Metadata**: Creation/update tracking with versioning

### Repository Pattern

- **DynamoDB Integration**: Optimized key structure (USER#{phone}#PROFILE)
- **Query Support**: Find by phone, status, apartment relationships
- **Document Uniqueness**: Prevents duplicate documents across users

### Service Layer

- **Business Logic**: User lifecycle management
- **Validation**: Input validation with Zod schemas
- **Error Handling**: Domain-specific errors with proper codes

## Usage Examples

### Creating a User with CPF

```typescript
const user = await userService.createUser({
  phoneNumber: '+5511987654321',
  name: 'João Silva',
  document: '11144477735', // CPF
  email: 'joao@example.com',
})
```

### Creating a User with CNPJ

```typescript
const user = await userService.createUser({
  phoneNumber: '+5511987654321',
  name: 'Empresa LTDA',
  document: '11222333000181', // CNPJ
  email: 'contato@empresa.com',
})
```

### Creating a User without Document

```typescript
const user = await userService.createUser({
  phoneNumber: '+5511987654321',
  name: 'João Silva',
  email: 'joao@example.com',
  // No document provided
})
```

## Document Types

### CPF (Cadastro de Pessoas Físicas)

- 11 digits
- Format: XXX.XXX.XXX-XX
- For individuals

### CNPJ (Cadastro Nacional da Pessoa Jurídica)

- 14 digits
- Format: XX.XXX.XXX/XXXX-XX
- For companies

### No Document

- Some users may not have or provide documents
- System handles this gracefully

## Validation

### Phone Number

- Uses libphonenumber-js for international validation
- Supports Brazilian format by default
- Stores in E.164 format

### Document Validation

- Full CPF validation with check digits
- Full CNPJ validation with check digits
- Prevents known invalid patterns (all same digits)

### Email

- Standard email format validation
- Optional field

### Name

- Minimum 2 characters
- Required field

## Database Schema

### User Profile Record

```
PK: USER#{phoneNumber}
SK: PROFILE
phoneNumber: string (E.164 format)
name: string
document?: string (normalized, digits only)
documentType: 'cpf' | 'cnpj' | 'none'
email?: string
status: 'active' | 'inactive' | 'suspended'
metadata: {
  createdAt: ISO string
  updatedAt: ISO string
  createdBy?: string
  updatedBy?: string
  version: number
}
```

## Error Handling

### Domain Errors

- **ValidationError**: Input validation failures
- **BusinessRuleViolationError**: Business logic violations
- **EntityNotFoundError**: User not found
- **DatabaseError**: Database operation failures

### Common Scenarios

- Duplicate phone numbers
- Duplicate documents
- Invalid document formats
- Invalid phone numbers
- Business rule violations (e.g., deleting active users)

## Testing

### Unit Tests

- Entity validation and business logic
- Service layer operations
- Repository patterns
- Validation utilities

### Integration Tests

- End-to-end user operations
- Serialization/deserialization
- Database interactions

### Test Coverage

- 42+ tests covering all major functionality
- Mock-based service testing
- Real validation testing

## Migration Notes

### From CPF-only to Flexible Documents

- Existing CPF data is automatically migrated
- `fromDynamoItem` handles legacy `cpf` field
- New records use `document` and `documentType` fields
- Backward compatibility maintained

### API Changes

- DTOs updated to use `document` instead of `cpf`
- Response includes `documentType` field
- Validation updated to handle optional documents

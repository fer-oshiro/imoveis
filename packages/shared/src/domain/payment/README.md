# Payment Domain

This domain implements a consolidated Payment system that replaces the previous separate invoice and payment proof concepts. It combines both invoice generation and payment proof submission into a single, cohesive domain.

## Architecture

The Payment domain follows the established domain-driven design patterns:

- **Entities**: Core business objects with identity and lifecycle
- **Value Objects**: Immutable objects that describe aspects of the domain
- **Repositories**: Data access abstraction layer
- **Services**: Business logic orchestration
- **DTOs**: Data transfer objects for API boundaries

## Key Components

### Payment Entity

- Combines invoice and payment proof concepts
- Manages payment lifecycle (pending → paid → validated/rejected)
- Enforces business rules and constraints
- Supports different payment types (rent, deposit, utilities, etc.)

### Payment Repository

- Apartment-based queries (most common use case)
- User-based queries for payment history
- Status-based queries for overdue/pending payments
- Date range queries for reporting

### Payment Service

- Payment creation and lifecycle management
- Proof submission and validation workflows
- Statistics and reporting capabilities
- Overdue payment detection and marking

## Payment Lifecycle

1. **Creation**: Payment is created in PENDING status
2. **Proof Submission**: User submits payment proof, status becomes PAID
3. **Validation**: Admin validates or rejects the payment
4. **Final Status**: VALIDATED or REJECTED

## Key Features

### Business Rules

- Only paid payments can be validated/rejected
- Validated payments cannot be modified
- Payment dates cannot be in the future
- Amounts must be positive

### Query Patterns

- Optimized for apartment-centric queries
- Supports user payment history
- Efficient last payment lookup
- Date range filtering

### Statistics

- Payment counts by status
- Total amounts and averages
- Overdue payment tracking
- User and apartment-level statistics

## DynamoDB Key Design

- **PK**: `APARTMENT#{unitCode}` - Groups payments by apartment
- **SK**: `PAYMENT#{timestamp}#{paymentId}` - Ensures chronological ordering
- **GSI1**: User-centric queries (when needed)
- **GSI2**: Status-based queries (when needed)

## Testing

The domain includes comprehensive test coverage:

- **Entity Tests**: Business logic and validation (24 tests)
- **DTO Tests**: Input validation and sanitization (27 tests)
- **Service Tests**: Business workflows with mocked dependencies (17 tests)
- **Integration Tests**: End-to-end domain functionality (6 tests)

Total: **74 tests** with 100% pass rate

## Usage Examples

### Creating a Payment

```typescript
const paymentService = new PaymentService(paymentRepository)

const payment = await paymentService.createPayment({
  apartmentUnitCode: 'APT001',
  userPhoneNumber: '+5511999999999',
  amount: 1500.0,
  dueDate: '2024-01-15T00:00:00.000Z',
  contractId: 'CONTRACT-001',
  type: PaymentType.RENT,
  description: 'Monthly rent payment',
  createdBy: 'admin',
})
```

### Submitting Payment Proof

```typescript
const updatedPayment = await paymentService.submitPaymentProof({
  paymentId: 'PAY-001-123456',
  proofDocumentKey: 'proof-document-123.pdf',
  paymentDate: '2024-01-14T00:00:00.000Z',
  updatedBy: 'user',
})
```

### Validating Payment

```typescript
const validatedPayment = await paymentService.validatePayment({
  paymentId: 'PAY-001-123456',
  validatedBy: 'admin',
  action: 'validate',
})
```

## Requirements Satisfied

This implementation satisfies all requirements from the design document:

- **6.1**: Payment domain handles payment proofs, validation, and status tracking
- **6.2**: Payment data includes amount, date, proof document keys, and associated invoice
- **6.3**: Payment operations are handled through PaymentService and PaymentRepository
- **6.4**: Payment validation ensures proper date formats and required fields

The consolidated Payment domain successfully replaces the separate invoice and payment concepts while maintaining all existing functionality and adding new capabilities for better payment lifecycle management.

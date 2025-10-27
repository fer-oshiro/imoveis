# Error Handling and Validation System

This directory contains the comprehensive error handling and validation system implemented for the domain-driven architecture.

## Overview

The error handling system provides:

- **Domain-specific error classes** for each domain
- **Consistent error transformation** across controllers
- **Input validation** using Zod schemas
- **Business rule validation** in domain services
- **HTTP error responses** with proper status codes

## Architecture

### Base Error Classes

- `DomainError`: Base class for all domain errors
- `EntityNotFoundError`: For missing entities
- `ValidationError`: For input validation failures
- `BusinessRuleViolationError`: For business rule violations
- `DatabaseError`: For database operation failures

### Domain-Specific Errors

Each domain has its own error classes:

#### Apartment Domain

- `ApartmentNotFoundError`
- `ApartmentAlreadyExistsError`
- `InvalidUnitCodeError`
- `ApartmentOccupiedError`
- `InvalidApartmentStatusTransitionError`

#### User Domain

- `UserNotFoundError`
- `UserAlreadyExistsError`
- `InvalidPhoneNumberError`
- `DocumentAlreadyExistsError`
- `UserInactiveError`

#### Contract Domain

- `ContractNotFoundError`
- `ContractAlreadyExistsError`
- `InvalidContractDateError`
- `ContractDateOverlapError`
- `ContractAlreadyTerminatedError`

#### Payment Domain

- `PaymentNotFoundError`
- `PaymentAlreadyPaidError`
- `InvalidPaymentAmountError`
- `PaymentOverdueError`
- `PaymentProofMissingError`

#### Relationship Domain

- `RelationshipNotFoundError`
- `PrimaryTenantAlreadyExistsError`
- `MaximumTenantsReachedError`
- `UserNotAuthorizedForApartmentError`

## Usage

### In Controllers

Controllers extend `BaseController` which provides consistent error handling:

```typescript
export class ApartmentController extends BaseController {
  async createApartment(data: unknown, createdBy?: string) {
    return this.executeWithValidation(
      data,
      (data) => createApartmentDto.parse(data),
      (validatedDto) => this.apartmentService.createApartment(validatedDto, createdBy),
      'create apartment',
    )
  }
}
```

### In Services

Services use domain-specific errors and business rule validation:

```typescript
export class ApartmentService {
  async createApartment(dto: CreateApartmentDto, createdBy?: string): Promise<Apartment> {
    // Business rule validations
    await this.validateUniqueUnitCode(dto.unitCode)
    this.validateRentalAmount(dto.baseRent)

    if (dto.airbnbLink) {
      this.validateAirbnbLink(dto.airbnbLink)
    }

    // ... rest of implementation
  }

  private async validateUniqueUnitCode(unitCode: string): Promise<void> {
    const existingApartment = await this.apartmentRepository.findByUnitCode(unitCode)
    if (existingApartment) {
      throw new ApartmentAlreadyExistsError(unitCode)
    }
  }
}
```

### Input Validation

DTOs use Zod schemas for validation:

```typescript
export const createApartmentDto = z.object({
  unitCode: z.string().min(1, 'Unit code is required'),
  unitLabel: z.string().min(1, 'Unit label is required'),
  address: z.string().min(1, 'Address is required'),
  baseRent: z.number().min(0, 'Base rent must be non-negative'),
  // ... other fields
})

export type CreateApartmentDto = z.infer<typeof createApartmentDto>
```

### HTTP Middleware

Validation middleware for Fastify routes:

```typescript
import { validateBody, setupGlobalErrorHandler } from '../middleware/validation.middleware'

// In route setup
fastify.post('/apartments', {
  preHandler: validateBody(createApartmentDto),
  handler: apartmentController.createApartment,
})

// Global error handler setup
setupGlobalErrorHandler(fastify)
```

## Error Response Format

All errors are transformed to a consistent format:

```json
{
  "error": {
    "code": "APARTMENT_NOT_FOUND",
    "message": "Apartment with identifier APT-001 not found",
    "statusCode": 404
  }
}
```

## Validation Utilities

Shared validation utilities are available in `src/domain/shared/utils/validation.utils.ts`:

- `safeParseWithValidationError()`: Safe Zod parsing with domain errors
- `validateRequiredString()`: String validation
- `validatePositiveNumber()`: Number validation
- `validateEmail()`: Email format validation
- `validateUrl()`: URL format validation
- `validateDateRange()`: Date range validation

## Business Rules

Each domain service implements business rule validation:

### Apartment Business Rules

- Rental amounts must be between R$500 and R$10,000
- Airbnb links must be from airbnb.com domain
- Availability dates cannot be more than 1 year in the future
- Status transitions must follow valid state machine

### Contract Business Rules

- Contract duration must be between 30 days and 5 years
- No date overlaps with existing contracts
- Security deposit cannot exceed 3 months of rent
- Payment due day must be between 1 and 31

### Payment Business Rules

- Payment amounts must be positive
- Payment dates cannot be in the future
- Proof documents are required for payment submission
- Status transitions follow payment lifecycle

## Testing

Error handling is tested at multiple levels:

- Unit tests for individual error classes
- Integration tests for service-level error handling
- Controller tests for HTTP error responses

## Pre-commit Hooks

The system includes pre-commit hooks that run:

- **Prettier**: Code formatting
- **ESLint**: Code quality checks (informational)
- **TypeScript**: Type checking (informational)
- **Tests**: Unit test execution

These checks help maintain code quality without blocking development workflow.

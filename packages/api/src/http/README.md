# HTTP Controllers Implementation

This directory contains the HTTP controllers that have been refactored to use the new domain services.

## Controllers Implemented

### 1. ApartmentController (Enhanced)

- **Location**: `apartment/apartment.controller.ts`
- **Enhanced Methods**:
  - `getApartmentsWithLastPayment()` - Main admin view with payment info
  - `getAvailableApartments()` - Landing page available apartments
  - `getAirbnbApartments()` - Landing page Airbnb apartments
  - `getApartmentDetails(unitCode)` - Apartment details with users and contracts
  - `getApartmentLog(unitCode)` - Apartment history and log
  - `getApartmentByUnitCode(unitCode)` - Single apartment by unit code
  - `getApartmentsByStatus(status)` - Filter by status
  - `getApartmentsByRentalType(rentalType)` - Filter by rental type
  - `queryApartments(query)` - Advanced filtering
  - `createApartment(dto, createdBy)` - Create new apartment
  - `updateApartment(unitCode, dto, updatedBy)` - Update apartment
  - `deactivateApartment(unitCode, updatedBy)` - Deactivate apartment
- **Legacy Methods**: Maintained for backward compatibility

### 2. UserController (New)

- **Location**: `user/user.controller.ts`
- **Methods**:
  - `getUserDetails(phoneNumber)` - User details with relationships
  - `getUserDetailsEnhanced(phoneNumber)` - Enhanced user details with aggregated data
  - `getUserByPhoneNumber(phoneNumber)` - Get single user
  - `getAllUsers()` - Get all users
  - `getUsersByStatus(status)` - Filter by status
  - `getUsersByApartment(unitCode)` - Users by apartment
  - `searchUsers(criteria)` - Search users
  - `createUser(dto, createdBy)` - Create new user
  - `updateUser(phoneNumber, dto, updatedBy)` - Update user
  - `activateUser(phoneNumber, updatedBy)` - Activate user
  - `deactivateUser(phoneNumber, updatedBy)` - Deactivate user
  - `suspendUser(phoneNumber, updatedBy)` - Suspend user
  - `deleteUser(phoneNumber)` - Delete user
  - `validateUserExists(phoneNumber)` - Validate user existence
  - `validateDocumentUnique(document, excludePhoneNumber)` - Validate document uniqueness

### 3. ContractController (New)

- **Location**: `contract/contract.controller.ts`
- **Methods**:
  - `getContractById(contractId)` - Get contract by ID
  - `getActiveContractByApartment(unitCode)` - Get active contract for apartment
  - `getContractsByApartment(unitCode)` - All contracts for apartment
  - `getContractsByTenant(phoneNumber)` - Contracts by tenant
  - `getContractsByStatus(status)` - Filter by status
  - `getExpiringContracts(daysFromNow)` - Get expiring contracts
  - `createContract(dto)` - Create new contract
  - `updateContract(contractId, dto)` - Update contract
  - `terminateContract(contractId, updatedBy)` - Terminate contract
  - `renewContract(contractId, dto)` - Renew contract
  - `deleteContract(contractId)` - Delete contract

### 4. PaymentController (Updated)

- **Location**: `payment/payment.controller.ts`
- **Methods**:
  - `getPaymentById(paymentId)` - Get payment by ID
  - `getPaymentsByApartment(apartmentUnitCode)` - Payments by apartment
  - `getLastPaymentByApartment(apartmentUnitCode)` - Last payment for apartment
  - `getPaymentsByUser(userPhoneNumber)` - Payments by user
  - `getPaymentsByContract(contractId)` - Payments by contract
  - `getPaymentsByStatus(status)` - Filter by status
  - `getOverduePayments()` - Get overdue payments
  - `getPendingPayments()` - Get pending payments
  - `getPaymentsByDateRange(startDate, endDate)` - Filter by date range
  - `getPaymentsByApartmentAndDateRange(apartmentUnitCode, startDate, endDate)` - Combined filter
  - `createPayment(dto)` - Create new payment
  - `submitPaymentProof(dto)` - Submit payment proof
  - `validatePayment(dto)` - Validate payment
  - `updatePayment(paymentId, dto)` - Update payment
  - `deletePayment(paymentId)` - Delete payment
  - `markOverduePayments()` - Mark overdue payments (system operation)
  - `getPaymentStatsByApartment(apartmentUnitCode)` - Payment statistics by apartment
  - `getPaymentStatsByUser(userPhoneNumber)` - Payment statistics by user

## Routes

Each controller has corresponding route files that define the HTTP endpoints:

- `apartment/apartment.routes.ts` - Enhanced apartment routes
- `user/user.routes.ts` - New user management routes
- `contract/contract.routes.ts` - New contract management routes
- `payment/payment.routes.ts` - Updated payment routes

## Main Routes Registration

The main `routes.ts` file has been updated to register all the new controllers:

```typescript
export async function Routes(app: FastifyInstance) {
  await app.register(apartmentRoutes, { prefix: '/apartments' })
  await app.register(userRoutes, { prefix: '/users' })
  await app.register(contractRoutes, { prefix: '/contracts' })
  await app.register(paymentRoutes, { prefix: '/payments' })

  // Legacy routes for backward compatibility
  await app.register(apartmentRoutes, { prefix: '/files' })
}
```

## Error Handling

All controllers implement consistent error handling:

- Domain-specific errors are caught and re-thrown with appropriate HTTP status codes
- Validation errors return 400 status codes
- Not found errors return 404 status codes
- Business rule violations return 409 status codes
- Generic errors return 500 status codes

## Validation

Controllers use different validation approaches:

- **Apartment**: Zod schemas for validation
- **User**: Zod schemas for validation
- **Contract**: Custom validator classes
- **Payment**: Custom validator classes

## Repository Integration

All controllers use singleton repository instances through `getInstance()` methods:

- `ApartmentRepository.getInstance()`
- `UserRepository.getInstance()`
- `ContractRepository.getInstance()`
- `PaymentRepository.getInstance()`

## Testing

Basic controller tests are included in `__tests__/controllers.test.ts` to verify:

- Controller instantiation
- Method availability
- Basic functionality

## Backward Compatibility

The implementation maintains backward compatibility by:

- Keeping legacy methods in ApartmentController
- Maintaining existing route patterns where possible
- Preserving existing API contracts

## Next Steps

The controllers are now ready for integration with the existing application. The next tasks would be:

1. Update HTTP routes to support new query patterns
2. Migrate existing data access patterns from legacy handlers
3. Add comprehensive error handling and validation
4. Create unit tests for all domain components

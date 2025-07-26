# Authentication System Tests Documentation

This document provides comprehensive documentation for the authentication system test suite, covering all test files, their purposes, and what they validate.

## Overview

The authentication test suite ensures the reliability and security of the entire authentication and onboarding flow. It covers:

- User registration and email verification
- Company onboarding with service management
- Freelance onboarding with service requests
- Email verification API endpoints
- NextAuth authentication system

## Test Files Structure

```
tests/unit/
├── api/auth/
│   ├── auth.onboarding.test.ts      # Core AuthService methods
│   ├── company.onboarding.test.ts   # Company onboarding flow
│   ├── freelance.onboarding.test.ts # Freelance onboarding flow
│   └── verify-email.test.ts         # Email verification API
├── lib/
│   └── auth.test.ts                 # NextAuth configuration
└── services/
    └── auth.service.ts              # Source implementation
```

## 1. Core Authentication Service Tests (`auth.onboarding.test.ts`)

### Purpose

Tests the fundamental AuthService methods that handle user registration, email verification, and service management.

### Test Suites

#### `initiateRegistration`

**Functionality**: Initial user registration process

**Tests**:

1. **Successful registration for new user**

   - Creates user with hashed password and verification token
   - Generates 24-hour expiring verification token
   - Logs all registration steps
   - Returns user object and verification token

2. **Error handling for existing email**

   - Validates email uniqueness
   - Returns French error message
   - Logs warning about duplicate attempt

3. **Database error handling**
   - Gracefully handles connection failures
   - Logs errors with proper context

#### `verifyEmailAndSetPassword`

**Functionality**: Email verification and password setting

**Tests**:

1. **Successful email verification**

   - Validates token and expiration
   - Hashes password with bcrypt (strength 12)
   - Clears verification fields
   - Returns French success message

2. **Invalid/expired token handling**
   - Validates token security
   - Logs masked token for debugging
   - Returns French error message

#### `finalizeRegistration`

**Functionality**: Verification email sending

**Tests**:

1. **Successful email sending**

   - Generates new verification token
   - Sends email with user's first name
   - Updates token in database

2. **User not found handling**
   - Validates user existence
   - Logs warning with user ID

#### `getAvailableServices`

**Functionality**: Service retrieval for onboarding

**Tests**:

1. **Successful service fetching**

   - Queries active services only
   - Includes company and service relations
   - Logs service count

2. **Database error handling**
   - Handles query failures gracefully

### Mock Strategy

- **bcryptjs**: Password hashing simulation
- **crypto**: Token generation with hex encoding
- **Prisma**: Complete database operation mocking
- **Logger**: Comprehensive logging verification
- **Mailer**: Email sending simulation

## 2. Company Onboarding Tests (`company.onboarding.test.ts`)

### Purpose

Tests the complex company onboarding process including service selection and platform service creation.

### Test Scenarios

#### Standard Service Selection

**Test**: "should successfully complete company onboarding with selected services"

- Creates company record with business details
- Links to 3 existing platform services
- Sets services as active (pre-approved)
- Validates transaction integrity

#### Custom Service Creation

**Test**: "should successfully complete company onboarding with new service creation"

- Creates company record
- Creates new platform service with custom configuration
- Sets service as pending approval
- Handles complex data types (SELECT with choices)

#### Hybrid Approach

**Test**: "should handle company onboarding with both selected services and new service"

- Combines both workflows in single transaction
- Creates 4 total service links
- Validates mixed service types

#### Error Scenarios

1. **Transaction failures**: Tests complete rollback
2. **Company creation failures**: Tests partial failure handling
3. **Validation errors**: Tests required field validation
4. **Service creation failures**: Tests new service creation errors

### Business Logic Validation

- **Service Status Management**: Existing services are active, new services are pending
- **Transaction Safety**: All-or-nothing operations
- **SIRET Validation**: French business registration numbers
- **Management Fees**: Percentage validation

## 3. Freelance Onboarding Tests (`freelance.onboarding.test.ts`)

### Purpose

Tests freelance user onboarding including profile creation and service requests.

### Test Scenarios

#### Basic Freelance Setup

**Test**: "should successfully complete freelance onboarding without services"

- Creates freelance profile with métier
- Creates freelance request with mission details
- Handles TJM (daily rate) and day calculations

#### Service Request Handling

**Test**: "should successfully complete freelance onboarding with service requests"

- Links to available company services
- Creates request options with custom data
- Handles required vs optional services

#### Service Matching Logic

**Test**: "should handle service requests with no available providers"

- Gracefully handles missing service providers
- Logs warnings for unmatched requests
- Continues processing available services

#### Complex Request Scenarios

**Test**: "should handle mixed service requirements"

- Combines required and optional services
- Validates response data structure
- Tests service priority handling

### Freelance-Specific Validations

- **Métier Validation**: Professional specialty
- **TJM Calculations**: Daily rate validation
- **Mission Status**: Current engagement status
- **Client Information**: Business context validation

## 4. Email Verification API Tests (`verify-email.test.ts`)

### Purpose

Tests the HTTP API endpoints for email verification functionality.

### API Endpoints

#### POST `/api/auth/verify-email`

**Functionality**: Email verification with password setting

**Tests**:

1. **Successful verification**

   - Validates request body structure
   - Calls AuthService method
   - Returns success response
   - Logs API usage

2. **Request validation errors**

   - Missing token handling
   - Missing password handling
   - Password mismatch validation

3. **Service integration errors**
   - Invalid token responses
   - Internal service errors
   - JSON parsing errors

#### GET `/api/auth/verify-email`

**Functionality**: Email verification redirect handling

**Tests**:

1. **Successful redirect**

   - Extracts token from URL
   - Redirects to password setting page
   - Validates URL construction

2. **Error handling**
   - Missing token redirects
   - URL parsing errors
   - Redirect failures

### API Testing Strategy

- **NextRequest/NextResponse**: HTTP layer mocking
- **Schema Validation**: Zod schema testing
- **Error Response**: Proper HTTP status codes
- **Logging Integration**: API usage tracking

## 5. NextAuth System Tests (`auth.test.ts`)

### Purpose

Tests the NextAuth authentication configuration and callbacks.

### Test Areas

#### Credentials Provider

**Test**: "should authenticate user with valid credentials"

- Email/password validation
- Password comparison with bcrypt
- User status verification
- Role-based authentication

#### JWT Callbacks

**Test**: "should add user data to token when user is provided"

- Token enhancement with user data
- Role and status inclusion
- Secure token handling

#### Session Callbacks

**Test**: "should populate session user data from token"

- Session object construction
- User data extraction from JWT
- Client-side session management

### Authentication Security

- **Password Hashing**: bcrypt verification
- **Token Security**: JWT handling
- **Session Management**: Secure session data
- **Role Validation**: RBAC implementation

## Test Execution

### Running Individual Test Suites

```bash
# Core authentication tests
npm test tests/unit/api/auth/auth.onboarding.test.ts

# Company onboarding tests
npm test tests/unit/api/auth/company.onboarding.test.ts

# Freelance onboarding tests
npm test tests/unit/api/auth/freelance.onboarding.test.ts

# Email verification API tests
npm test tests/unit/api/auth/verify-email.test.ts

# NextAuth system tests
npm test tests/unit/lib/auth.test.ts
```

### Running All Auth Tests

```bash
# All API auth tests
npm test /api

# All auth-related tests
npm test auth
```

## Test Coverage

### Functional Coverage

- ✅ User registration flow
- ✅ Email verification process
- ✅ Company onboarding with services
- ✅ Freelance onboarding with requests
- ✅ API endpoint validation
- ✅ Authentication system integration

### Error Handling Coverage

- ✅ Database connection failures
- ✅ Transaction rollbacks
- ✅ Validation errors
- ✅ Service integration failures
- ✅ Network/API errors

### Security Coverage

- ✅ Password hashing verification
- ✅ Token generation and validation
- ✅ Email verification security
- ✅ Session management
- ✅ Role-based access control

## Mock Dependencies

### External Services

- **Database (Prisma)**: Complete ORM mocking with transaction support
- **Email Service**: Verification email sending simulation
- **Crypto**: Token generation with consistent output
- **bcryptjs**: Password hashing with deterministic results

### System Components

- **Logger**: Comprehensive logging verification at all levels
- **NextAuth**: Authentication provider mocking
- **NextJS**: Request/Response object simulation
- **Validation Schemas**: Zod schema mocking

## Maintenance Guidelines

### Adding New Tests

1. Follow existing naming conventions
2. Include comprehensive error scenarios
3. Mock all external dependencies
4. Verify logging at appropriate levels
5. Test both success and failure paths

### Updating Tests

1. Update mocks when service interfaces change
2. Maintain test data consistency
3. Verify mock token/hash formats
4. Update documentation when adding new test scenarios

### Debugging Test Failures

1. Check mock configuration alignment
2. Verify token format expectations
3. Review logging call expectations
4. Validate error message consistency
5. Check transaction mock behavior

## Integration Points

### Service Dependencies

- **AuthService**: Core business logic
- **Prisma**: Database operations
- **NextAuth**: Authentication framework
- **Email Service**: Verification emails
- **Validation**: Request/response schemas

### Data Flow Testing

1. **Registration → Verification → Onboarding**
2. **Service Selection → Company/Freelance Setup**
3. **API Requests → Service Calls → Database Operations**
4. **Authentication → Session Management → Authorization**

This comprehensive test suite ensures the authentication system is robust, secure, and handles all business scenarios while maintaining data integrity and user experience quality.

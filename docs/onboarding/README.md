# Onboarding System Documentation

## Overview

The Lillinker platform implements a comprehensive dual-track onboarding system supporting both **Company** and **Freelance** user registration. The system uses a multi-step process with email verification, role-based onboarding, and platform service integration.

## Architecture Overview

### Core Components

- **AuthService**: Central service handling registration, verification, and onboarding
- **Role-Based Flow**: Separate onboarding paths for COMPANY and FREELANCE users
- **Platform Services**: Dynamic service marketplace integration
- **Email Verification**: Secure token-based email validation
- **Database Transactions**: Atomic operations ensuring data consistency

### User Roles

```typescript
enum Role {
  ADMIN     // Platform administrators
  COMPANY   // Company administrators
  FREELANCE // Independent contractors
  MANAGER   // Company managers
}
```

## Registration Flow Architecture

### Phase 1: Initial Registration

```typescript
// AuthService.initiateRegistration()
interface InitialRegistration {
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  phone_number?: string;
}
```

**Process:**
1. Validate email uniqueness
2. Generate secure verification token (64-char hex)
3. Create temporary password for security
4. Store user with `email_verified: false` and `status: false`
5. Return user and verification token

### Phase 2: Role-Specific Onboarding

After initial registration, users complete role-specific onboarding:

#### Company Onboarding Flow

```typescript
// AuthService.completeCompanyOnboarding()
interface CompanyOnboarding {
  company_name: string;
  company_description?: string;
  siret?: string;
  consultant_count: number;
  management_fees: number;
  selected_services?: number[];        // Existing platform services
  service_label?: string;             // New service creation
  service_description?: string;
  data_type?: DataType;
  requires_data?: boolean;
  data_label?: string;
  data_description?: string;
  choices?: any[];
}
```

**Database Operations (Transaction):**
1. Create Company record linked to user
2. Create CompanyService relationships for selected services
3. Create new PlatformService if service creation requested
4. Link new service to company (pending approval)

#### Freelance Onboarding Flow

```typescript
// AuthService.completeFreelanceOnboarding()
interface FreelanceOnboarding {
  metier: string;                     // Profession/trade
  mission_status: MissionStatus;      // OPEN, CLOSED, PENDING
  client_name?: string;
  client_address?: string;
  client_sector?: string;
  priority: Priority;                 // HIGH, MEDIUM, LOW
  tjm: number;                       // Daily rate (Taux Journalier Moyen)
  days: number;                      // Available days
  selected_services?: Array<{
    serviceId: number;
    isRequired: boolean;
    responseData?: any;
  }>;
}
```

**Database Operations (Transaction):**
1. Create Freelance profile
2. Create FreelanceRequest with mission details
3. Create FreelanceRequestOption records for selected services
4. Link to existing CompanyService providers

### Phase 3: Email Verification

```typescript
// AuthService.finalizeRegistration()
// AuthService.verifyEmailAndSetPassword()
```

**Process:**
1. Generate new verification token
2. Send verification email with secure link
3. User clicks link and sets real password
4. Mark `email_verified: true` and clear token
5. Account ready for activation

## Database Schema Deep Dive

### Core Models

```prisma
model User {
  id             Int              @id @default(autoincrement())
  first_name     String
  last_name      String
  password       String           // bcrypt hashed
  email          String           @unique
  role           Role
  status         Boolean          @default(true)  // Account activation
  phone_number   String?
  email_verified Boolean          @default(false) // Email verification
  verification_token    String?   @unique
  verification_token_expires DateTime?
  created_at     DateTime         @default(now())
  
  // Relations
  platforms      PlatformService[]     // Created services
  freelance      Freelance?           // Freelance profile
  ownedCompany   Company?             // Owned company
  managedCompanies CompanyManager[]   // Managed companies
}

model Company {
  id                Int             @id @default(autoincrement())
  admin_user_id     Int             @unique
  name              String
  description       String?
  siret             String?         @unique  // French business ID
  consultant_count  Int
  management_fees   Float
  admin             User            @relation("CompanyAdmin")
  managers          CompanyManager[]
  services          CompanyService[]  // Available services
  responses         CompanyResponse[] // Responses to freelance requests
}

model Freelance {
  id           Int               @id @default(autoincrement())
  freelance_id Int               @unique
  metier       String           // Profession
  user         User             @relation(fields: [freelance_id])
  requests     FreelanceRequest[] // Service requests
}
```

### Service System Models

```prisma
model PlatformService {
  id               Int             @id @default(autoincrement())
  user_id          Int             // Creator
  label            String
  description      String?
  data_type        DataType        // TEXT, NUMBER, SELECT, RADIO
  requires_data    Boolean         @default(false)
  data_label       String
  data_description String?
  choices          Json?           // For SELECT/RADIO types
  status           ServiceStatus   // ACTIVE, INACTIVE, PENDING
  user             User            @relation(fields: [user_id])
  companyServices  CompanyService[] // Companies offering this service
}

model CompanyService {
  id              Int                    @id @default(autoincrement())
  company_id      Int
  service_id      Int
  is_active       Boolean               // Service availability
  company         Company               @relation(fields: [company_id])
  service         PlatformService       @relation(fields: [service_id])
  requestOptions  FreelanceRequestOption[] // Freelance requests for this service
}

model FreelanceRequest {
  id              Int                    @id @default(autoincrement())
  freelance_id    Int
  mission_status  MissionStatus         // OPEN, CLOSED, PENDING
  client_name     String?
  client_address  String?
  client_sector   String?
  priority        Priority              // HIGH, MEDIUM, LOW
  tjm             Float                 // Daily rate
  days            Float                 // Available days
  freelance       Freelance             @relation(fields: [freelance_id])
  options         FreelanceRequestOption[] // Requested services
  responses       CompanyResponse[]     // Company responses
}

model FreelanceRequestOption {
  id                  Int             @id @default(autoincrement())
  freelance_request_id Int
  service_option_id   Int             // CompanyService ID
  is_required         Boolean         @default(false)
  response_data       Json?           // Service-specific data
  request             FreelanceRequest @relation(fields: [freelance_request_id])
  serviceOption       CompanyService   @relation(fields: [service_option_id])
}
```

## API Implementation

### Registration Endpoints

#### Initial Registration
```typescript
// POST /api/auth/register
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "role": "COMPANY",
  "phone_number": "+33123456789"
}

// Response
{
  "user": { /* user object */ },
  "verificationToken": "64-char-hex-token"
}
```

#### Company Onboarding
```typescript
// POST /api/auth/onboarding/company
{
  "company_name": "Tech Solutions Inc",
  "company_description": "Innovative technology solutions",
  "siret": "12345678901234",
  "consultant_count": 50,
  "management_fees": 15.0,
  "selected_services": [1, 2, 3],
  "service_label": "Custom Development",
  "service_description": "Custom software development services",
  "data_type": "TEXT",
  "requires_data": true,
  "data_label": "Project Requirements",
  "choices": null
}
```

#### Freelance Onboarding
```typescript
// POST /api/auth/onboarding/freelance
{
  "metier": "Full Stack Developer",
  "mission_status": "OPEN",
  "client_name": "Client Corp",
  "client_address": "123 Client St, Paris",
  "client_sector": "Technology",
  "priority": "HIGH",
  "tjm": 500.0,
  "days": 20,
  "selected_services": [
    {
      "serviceId": 1,
      "isRequired": true,
      "responseData": {"experience": "5 years"}
    }
  ]
}
```

### Email Verification
```typescript
// POST /api/auth/verify-email
{
  "token": "verification-token-from-email",
  "password": "SecurePassword123"
}
```

## Service Integration System

### Platform Services

Companies can offer services and freelancers can request them:

```typescript
enum DataType {
  TEXT    // Free text input
  NUMBER  // Numeric input
  SELECT  // Multiple choice (single selection)
  RADIO   // Radio buttons
}

enum ServiceStatus {
  ACTIVE    // Approved and available
  INACTIVE  // Temporarily disabled
  PENDING   // Awaiting approval
}
```

### Service Creation Flow

1. **Company creates service** during onboarding
2. **Service marked as PENDING** for admin approval
3. **Admin reviews and approves** service
4. **Service becomes ACTIVE** and available to freelancers
5. **CompanyService relationship** enables service offerings

### Service Request Flow

1. **Freelance selects services** during onboarding
2. **System finds CompanyService providers** for each service
3. **Creates FreelanceRequestOption** linking request to provider
4. **Companies can respond** with proposals and pricing
5. **Freelancer reviews responses** and selects providers

## Transaction Safety

### Database Transactions

All onboarding operations use database transactions for consistency:

```typescript
// Company onboarding transaction
return await prisma.$transaction(async (tx) => {
  // 1. Create company
  const company = await tx.company.create({ /* ... */ });
  
  // 2. Create service relationships
  const companyServices = await Promise.all(
    data.selected_services.map(serviceId =>
      tx.companyService.create({ /* ... */ })
    )
  );
  
  // 3. Create new platform service if requested
  if (data.service_label) {
    const platformService = await tx.platformService.create({ /* ... */ });
    // Link to company
  }
  
  return { company, companyServices, platformService };
});
```

### Error Handling

- **Rollback on failure**: All operations reversed if any step fails
- **Validation errors**: Early validation before transaction start
- **Unique constraint violations**: Proper error messages for duplicates
- **Foreign key violations**: Graceful handling of missing references

## Security Implementation

### Password Security
- **Temporary passwords**: Crypto-generated during registration
- **bcrypt hashing**: 12 salt rounds for production
- **Password setting**: Only during email verification

### Token Security
- **Crypto-random generation**: `crypto.randomBytes(32)`
- **Unique database constraint**: Prevents token collisions
- **24-hour expiration**: Automatic invalidation
- **Single-use tokens**: Cleared after verification

### Data Validation
- **Input sanitization**: All user inputs validated
- **Email format validation**: RFC-compliant email checking
- **Business logic validation**: SIRET format, reasonable rates, etc.

## Testing Strategy

### Unit Tests
```typescript
describe('AuthService', () => {
  test('should create company with services', async () => {
    const result = await AuthService.completeCompanyOnboarding(userId, companyData);
    expect(result.company).toBeDefined();
    expect(result.companyServices).toHaveLength(3);
  });
  
  test('should handle freelance onboarding', async () => {
    const result = await AuthService.completeFreelanceOnboarding(userId, freelanceData);
    expect(result.freelance).toBeDefined();
    expect(result.freelanceRequest).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Full Onboarding Flow', () => {
  test('should complete company registration flow', async () => {
    // 1. Initial registration
    const { user, verificationToken } = await AuthService.initiateRegistration(userData);
    
    // 2. Company onboarding
    const onboardingResult = await AuthService.completeCompanyOnboarding(user.id, companyData);
    
    // 3. Finalize registration
    await AuthService.finalizeRegistration(user.id);
    
    // 4. Email verification
    await AuthService.verifyEmailAndSetPassword(verificationToken, 'SecurePass123');
    
    // Verify complete flow
    const finalUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(finalUser.email_verified).toBe(true);
  });
});
```

## Monitoring and Analytics

### Key Metrics
- **Registration completion rate**: Users who complete full flow
- **Onboarding abandonment**: Where users drop off
- **Service creation rate**: Companies creating new services
- **Service utilization**: Most requested services
- **Email verification rate**: Email confirmation success

### Logging
```typescript
// Log onboarding completion
console.log(`Company onboarding completed`, {
  userId: user.id,
  companyId: company.id,
  servicesSelected: data.selected_services?.length || 0,
  newServiceCreated: !!data.service_label,
  timestamp: new Date().toISOString()
});
```

## Error Scenarios and Recovery

### Common Errors

1. **Email Already Exists**
   ```
   Error: "Un utilisateur avec cette adresse e-mail existe déjà"
   Recovery: Use different email or login to existing account
   ```

2. **Invalid Verification Token**
   ```
   Error: "Token de vérification invalide ou expiré"
   Recovery: Request new verification email
   ```

3. **Transaction Failure**
   ```
   Error: Database constraint violation
   Recovery: Automatic rollback, user can retry
   ```

4. **Service Not Found**
   ```
   Error: Selected service no longer available
   Recovery: Show updated service list, allow reselection
   ```

## Best Practices

### Development
1. **Always use transactions** for multi-table operations
2. **Validate inputs early** before starting database operations
3. **Handle unique constraint violations** gracefully
4. **Log important events** for debugging and analytics
5. **Test error scenarios** thoroughly

### Security
1. **Never store plaintext passwords**
2. **Use crypto-secure token generation**
3. **Validate all user inputs**
4. **Implement rate limiting** for registration endpoints
5. **Monitor for suspicious patterns**

### User Experience
1. **Clear error messages** in user's language
2. **Progress indicators** for multi-step flows
3. **Save partial progress** where possible
4. **Provide help and support** contact information
5. **Mobile-friendly interfaces**

---

This documentation provides comprehensive coverage of the Lillinker onboarding system based on the actual AuthService implementation and database schema.

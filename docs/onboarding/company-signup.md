# Company Registration and Onboarding Documentation

## Overview

The Lillinker platform implements a comprehensive company onboarding system that handles company user registration through a multi-step, multi-phase approach with email verification, specialized company onboarding flows, and platform service integration. The system follows a clean architecture with separated concerns between frontend UI components, backend API routes, service layers, and comprehensive testing.

## System Architecture

### Frontend Architecture

The company frontend uses a modular component-based approach with React hooks for state management:

```
src/components/onboarding/
├── CompanyModal.tsx           # Main company onboarding orchestrator
├── ModalWrapper.tsx           # Shared UI wrapper with navigation
├── SuccessStep.tsx            # Completion confirmation
├── AddServiceModal.tsx        # Custom service creation
└── company/                   # Company-specific components
    ├── CompanyGeneralInfoStep.tsx
    ├── CompanyConsultantsStep.tsx
    ├── CompanyMetiersStep.tsx
    ├── CompanyAdminStep.tsx
    ├── CompanyServicesStep.tsx
    ├── CompanySummaryStep.tsx
    ├── useCompanyForm.ts      # Company form state management
    └── useStepNavigation.ts   # Step progression logic
```

### Backend Architecture

The backend follows a layered architecture pattern:

```
src/
├── app/api/auth/              # API route handlers
│   ├── register/route.ts      # Initial user registration
│   ├── verify-email/route.ts  # Email verification & password setting
│   └── onboarding/
│       └── company/route.ts   # Company onboarding API
├── services/                  # Business logic layer
│   ├── AuthService.ts         # Authentication operations
│   ├── CompanyService.ts      # Company-specific operations
│   └── PlatformServiceService.ts # Platform service management
├── lib/
│   ├── prisma.ts             # Database client
│   ├── logger.ts             # Structured logging
│   └── validations/
│       └── auth.validation.ts # Request validation schemas
└── types/                     # TypeScript type definitions
```

### Testing Architecture

Comprehensive testing strategy with unit and integration tests:

```
tests/unit/api/auth/
├── company.onboarding.test.ts    # Company API endpoint tests
└── verify-email.test.ts          # Email verification tests
```

## Company Registration Flow

### User Type

```typescript
enum Role {
  COMPANY, // Company administrators
}
```

### Frontend State Management

The company onboarding system uses custom React hooks for state management:

#### Company Onboarding Hooks

```typescript
// useCompanyForm.ts - Form data management
const { formData, updateFormData, clearFormData } = useCompanyForm();

// useStepNavigation.ts - Step progression
const { currentStep, goToNextStep, goToPreviousStep, clearStepProgress } = useStepNavigation(7);

// Form data structure
interface CompanyFormData {
  companyName: string;
  siret: string;
  description: string;
  isPortage: 'yes' | 'no' | '';
  selectedPortages: string[];
  consultantCount: string;
  managementFeeRate: string;
  selectedMetiers: string[];
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  selectedPlatformServices: string[];
  newServices: NewService[];
}
```

## Phase 1: Initial Registration

### Data Collection

```typescript
interface InitialRegistration {
  first_name: string;
  last_name: string;
  email: string;
  role: 'COMPANY';
  phone_number?: string;
}
```

### Registration Process

The AuthService handles initial user registration with secure token generation:

```typescript
// AuthService.initiateRegistration()
static async initiateRegistration(data: InitialRegistration) {
  // 1. Validate email uniqueness
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
  }

  // 2. Generate secure verification token
  const verificationToken = randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 3. Create temporary password for security
  const tempPassword = await hash(randomBytes(32).toString('hex'), 12);

  // 4. Create user record
  const user = await prisma.user.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: tempPassword, // Temporary password
      role: data.role,
      phone_number: data.phone_number,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      status: false, // Activated after onboarding
    },
  });

  return { user, verificationToken };
}
```

### Initial User State

After registration, users have:

- **Temporary password**: Crypto-generated secure placeholder
- **Unverified email**: `email_verified: false`
- **Inactive status**: `status: false`
- **Verification token**: 64-character hex token with 24h expiration

## Phase 2: Company Multi-Step Onboarding

### Company Onboarding Flow (7 Steps)

The company onboarding is handled by `CompanyModal.tsx` with the following steps:

#### Step 1: General Information (`CompanyGeneralInfoStep.tsx`)

```typescript
interface GeneralInfoData {
  companyName: string;
  siret: string;
  description: string;
  isPortage: 'yes' | 'no';
  selectedPortages?: number[]; // If portage company
}
```

#### Step 2: Consultants & Management (`CompanyConsultantsStep.tsx`)

```typescript
interface ConsultantData {
  consultantCount: string;
  managementFeeRate: string; // Percentage as string
}
```

#### Step 3: Supported Métiers (`CompanyMetiersStep.tsx`)

```typescript
interface MetierData {
  selectedMetiers: number[]; // Array of métier IDs
}
```

#### Step 4: Administrator Info (`CompanyAdminStep.tsx`)

```typescript
interface AdminData {
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
}
```

#### Step 5: Platform Services (`CompanyServicesStep.tsx`)

```typescript
interface ServiceData {
  selectedPlatformServices: number[];
  newServices: NewService[];
}

interface NewService {
  label: string;
  description: string;
  dataType: 'text' | 'number' | 'select' | 'radio';
  requiresData: boolean;
  dataLabel: string;
  dataDescription: string;
  choices: string[];
}
```

#### Step 6: Summary (`CompanySummaryStep.tsx`)

- Review all collected data
- Final validation before submission

#### Step 7: Success (`SuccessStep.tsx`)

- Confirmation of successful registration
- Email verification instructions

### Company Backend Processing

The company onboarding API (`/api/auth/onboarding/company`) processes the data through:

```typescript
// CompanyService methods used:
CompanyService.createCompany(userId, validatedData);
CompanyService.linkPlatformServices(companyId, serviceIds);
CompanyService.linkMetiers(companyId, metierIds);
CompanyService.linkPortages(companyId, portageIds);

// PlatformServiceService for new services:
PlatformServiceService.createService(userId, newServiceData);

// AuthService for email verification:
AuthService.sendVerificationEmail(userId);
```

### Database Transaction Pattern

Company onboarding uses database transactions for data integrity:

```typescript
// Company onboarding transaction
await prisma.$transaction(async () => {
  // 1. Check for duplicate SIRET
  const existingCompany = await prisma.company.findUnique({
    where: { siret: validatedData.siret },
  });

  if (existingCompany) {
    throw new Error('Une société avec ce numéro SIRET existe déjà');
  }

  // 2. Create company using CompanyService
  const company = await CompanyService.createCompany(parseInt(userId), validatedData);

  // 3. Handle new platform services creation
  const createdServices = [];
  if (validatedData.new_services && validatedData.new_services.length > 0) {
    for (const newService of validatedData.new_services) {
      const service = await PlatformServiceService.createService(parseInt(userId), newService);
      createdServices.push(service);
    }
  }

  // 4. Link selected and created services to company
  const allServiceIds = [
    ...(validatedData.selected_services || []),
    ...createdServices.map(s => s.id),
  ];

  if (allServiceIds.length > 0) {
    await CompanyService.linkPlatformServices(company.id, allServiceIds);
  }

  // 5. Link métiers to company
  if (validatedData.selected_metiers && validatedData.selected_metiers.length > 0) {
    await CompanyService.linkMetiers(company.id, validatedData.selected_metiers);
  }

  // 6. Link portages if company is a portage company
  if (
    validatedData.is_portage &&
    validatedData.selected_portages &&
    validatedData.selected_portages.length > 0
  ) {
    await CompanyService.linkPortages(company.id, validatedData.selected_portages);
  }

  return { company, createdServices };
});

// 7. Send verification email (outside transaction)
await AuthService.sendVerificationEmail(parseInt(userId));
```

## Phase 3: Email Verification

### Token-Based Verification

Users receive verification emails with crypto-secure tokens:

```typescript
// AuthService.verifyEmailAndSetPassword()
static async verifyEmailAndSetPassword(token: string, password: string) {
  // 1. Find user by valid token
  const user = await prisma.user.findFirst({
    where: {
      verification_token: token,
      verification_token_expires: { gt: new Date() },
      email_verified: false
    },
  });

  if (!user) {
    throw new Error('Token de vérification invalide ou expiré');
  }

  // 2. Hash new password
  const hashedPassword = await hash(password, 12);

  // 3. Update user with verified status
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      email_verified: true,
      verification_token: null,
      verification_token_expires: null,
    },
  });

  return updatedUser;
}
```

## API Endpoints

### Registration Endpoints

```typescript
// POST /api/auth/register
// Initial company user registration
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@company.com",
  "role": "COMPANY",
  "phone_number": "+33123456789"
}

// Response
{
  "success": true,
  "message": "Registration initiated. Check email for verification.",
  "userId": "123456789"
}
```

### Company Onboarding Endpoints

```typescript
// POST /api/auth/onboarding/company
// Complete company onboarding after initial registration
{
  "userId": "123456789",
  "company_name": "Tech Solutions SARL",
  "company_description": "Société de portage salarial spécialisée en IT",
  "siret": "12345678901234",
  "consultant_count": 50,
  "management_fees": 8.5,
  "is_portage": true,
  "selected_services": [1, 2, 3],
  "selected_metiers": [1, 2],
  "selected_portages": [1],
  "new_services": [
    {
      "service_label": "Custom Service",
      "service_description": "Custom service description",
      "data_type": "TEXT",
      "requires_data": true,
      "data_label": "Custom Data",
      "data_description": "Custom data description",
      "choices": ["Option 1", "Option 2"]
    }
  ]
}

// Response
{
  "success": true,
  "message": "Company onboarding completed successfully",
  "companyId": "comp_123456789"
}
```

### Verification Endpoints

```typescript
// GET /api/auth/verify-email?token=abc123
// Redirect endpoint for email verification links
// Redirects to: /auth/set-password?token=abc123

// POST /api/auth/verify-email
// Complete email verification and set password
{
  "token": "a1b2c3d4e5f6...",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

// Response
{
  "success": true,
  "message": "Email vérifié et mot de passe défini avec succès"
}
```

## Database Models and Relationships

### Company-Specific Tables

#### User Table (Company Role)

```sql
User {
  id: String (Primary Key)
  first_name: String
  last_name: String
  email: String (Unique)
  password_hash: String?
  phone_number: String?
  role: Role (COMPANY)
  status: Boolean (Default: false)
  email_verified: Boolean (Default: false)
  created_at: DateTime
  updated_at: DateTime

  // Relations
  company: Company?
  email_verification_tokens: EmailVerificationToken[]
}
```

#### Company Table

```sql
Company {
  id: String (Primary Key)
  user_id: String (Foreign Key → User.id)
  company_name: String
  company_description: String?
  siret: String (Unique)
  consultant_count: Int?
  management_fees: Float?
  is_portage: Boolean (Default: false)
  created_at: DateTime
  updated_at: DateTime

  // Relations
  user: User
  metier_companies: MetierCompany[]
  freelance_request_options: FreelanceRequestOption[]
  selected_services: SelectedPlatformService[]
  selected_portages: SelectedPortage[]
}
```

#### SelectedPlatformService Table (Company)

```sql
SelectedPlatformService {
  id: String (Primary Key)
  company_id: String (Foreign Key → Company.id)
  platform_service_id: Int (Foreign Key → PlatformService.id)
  response_data: Json? // Company's response to the service
  created_at: DateTime
  updated_at: DateTime

  // Relations
  company: Company
  platform_service: PlatformService
}
```

#### SelectedPortage Table (Company)

```sql
SelectedPortage {
  id: String (Primary Key)
  company_id: String (Foreign Key → Company.id)
  portage_id: Int (Foreign Key → Portage.id)
  created_at: DateTime
  updated_at: DateTime

  // Relations
  company: Company
  portage: Portage
}
```

## Security Implementation

### Password Security

- **Temporary passwords**: Crypto-generated during registration
- **Bcrypt hashing**: 12 salt rounds for production security
- **User-defined passwords**: Set during email verification

### Token Security

- **Crypto randomBytes**: 32 bytes converted to 64-character hex
- **Expiration handling**: 24-hour automatic expiration
- **Single-use tokens**: Cleared after successful verification

### Database Security

- **Transaction integrity**: Atomic operations for onboarding
- **Constraint validation**: Unique email and SIRET enforcement
- **Status controls**: Multi-level activation flags

## Error Handling

### Company-Specific Error Scenarios

1. **Duplicate email registration**

   ```typescript
   throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
   ```

2. **Duplicate SIRET registration**

   ```typescript
   throw new Error('Une société avec ce numéro SIRET existe déjà');
   ```

3. **Invalid or expired verification token**

   ```typescript
   throw new Error('Token de vérification invalide ou expiré');
   ```

4. **Onboarding before initial registration**
   ```typescript
   throw new Error('User not found or not in valid state for onboarding');
   ```

## Testing Strategy

### Unit Tests for Company Flow

```typescript
// tests/unit/api/auth/company.onboarding.test.ts
describe('POST /api/auth/onboarding/company', () => {
  it('should successfully complete company onboarding', async () => {
    // Test complete company onboarding flow
  });

  it('should handle duplicate SIRET error', async () => {
    // Test SIRET uniqueness validation
  });

  it('should create and link platform services', async () => {
    // Test service creation and linking
  });

  it('should handle portage company setup', async () => {
    // Test portage-specific functionality
  });
});
```

## Summary

The LilLinker company onboarding system provides a comprehensive, multi-step company registration and onboarding process that ensures:

- **Secure Registration**: Email verification with crypto-secure tokens
- **Comprehensive Company Profiling**: Detailed company information collection including SIRET validation
- **Flexible Service Integration**: Platform services and custom service creation
- **Portage Company Support**: Specialized handling for portage companies
- **Data Integrity**: Database transactions ensure consistent data state
- **Robust Testing**: Comprehensive unit and integration test coverage

This system ensures a smooth company onboarding experience while maintaining data integrity and security throughout the process.

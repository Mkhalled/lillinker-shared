# Freelance Registration and Onboarding Documentation

## Overview

The Lillinker platform implements a comprehensive freelance onboarding system that handles freelance user registration through a multi-step, multi-phase approach with email verification, specialized freelance onboarding flows, and platform service integration. The system follows a clean architecture with separated concerns between frontend UI components, backend API routes, service layers, and comprehensive testing.

## System Architecture

### Frontend Architecture

The freelance frontend uses a modular component-based approach with React hooks for state management:

```
src/components/onboarding/
├── FreelanceModal.tsx         # Main freelance onboarding orchestrator
├── ModalWrapper.tsx           # Shared UI wrapper with navigation
├── SuccessStep.tsx            # Completion confirmation
├── AddServiceModal.tsx        # Custom service creation
└── freelance/                 # Freelance-specific components
    ├── FreelancePersonalInfoStep.tsx
    ├── FreelanceTjmStep.tsx
    ├── FreelancePortageStep.tsx
    ├── FreelancePriorityStep.tsx
    ├── FreelanceServicesStep.tsx
    ├── FreelanceMissionStatusStep.tsx
    ├── FreelanceSummaryStep.tsx
    ├── useFreelanceForm.ts     # Freelance form state
    ├── useFreelanceValidation.ts # Form validation logic
    ├── useFreelanceHandlers.ts  # Event handlers
    ├── useFreelanceNavigation.ts # Step navigation
    └── useFreelanceCompletion.ts # Completion logic
```

### Backend Architecture

The backend follows a layered architecture pattern:

```
src/
├── app/api/auth/              # API route handlers
│   ├── register/route.ts      # Initial user registration
│   ├── verify-email/route.ts  # Email verification & password setting
│   └── onboarding/
│       └── freelance/route.ts # Freelance onboarding API
├── services/                  # Business logic layer
│   ├── auth/auth.service.ts         # Authentication operations
│   ├── freelance/freelance.service.ts    # Freelance-specific operations
│   └── platform/platform.service.ts # Platform service management
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
├── freelance.onboarding.test.ts  # Freelance API endpoint tests
└── verify-email.test.ts          # Email verification tests
```

## Freelance Registration Flow

### User Type

```typescript
enum Role {
  FREELANCE, // Independent contractors
}
```

### Frontend State Management

The freelance onboarding system uses custom React hooks for state management:

#### Freelance Onboarding Hooks

```typescript
// useFreelanceForm.ts - Form state management
const { formData, updateField, clearForm } = useFreelanceForm();

// useFreelanceValidation.ts - Form validation
const { validateStep, isStepValid } = useFreelanceValidation();

// useFreelanceNavigation.ts - Step navigation with validation
const { currentStep, nextStep, prevStep, canProceed } = useFreelanceNavigation();

// useFreelanceCompletion.ts - Submission logic
const { submitOnboarding, isSubmitting, error } = useFreelanceCompletion();

// Form data structure
interface FreelanceFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: 'MALE' | 'FEMALE';
  priority: 'cost' | 'quality' | 'speed';
  dailyRate: number;
  wantSalaried: boolean;
  salary: number;
  startDate: Date;
  isPortageCandidate: boolean;
  selectedPortages: number[];
  metier: number;
  selectedPlatformServices: number[];
  newServices: NewService[];
}
  phone: string;
  dailyRate: number;
  isPortageCandidate: boolean;
  selectedPortages: number[];
  preferredMissions: string[];
  selectedPlatformServices: number[];
  newServices: NewService[];
  currentMissionStatus: 'available' | 'busy' | 'partially_available';
  priority: 'cost' | 'quality' | 'speed';
}
```

## Phase 1: Initial Registration

### Data Collection

```typescript
interface InitialRegistration {
  first_name: string;
  last_name: string;
  email: string;
  role: 'FREELANCE';
  phone_number?: string;
  sex?: 'MALE' | 'FEMALE';
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

// AuthService for email verification:
AuthService.sendVerificationEmail(userId);
```

### Initial User State

After registration, users have:

- **Temporary password**: Crypto-generated secure placeholder
- **Unverified email**: `email_verified: false`
- **Inactive status**: `status: false`
- **Verification token**: 64-character hex token with 24h expiration

## Phase 2: Freelance Multi-Step Onboarding

### Freelance Onboarding Flow (7 Steps)

The freelance onboarding is handled by `FreelanceModal.tsx` with the following steps:

#### Step 1: Personal Information (`FreelancePersonalInfoStep.tsx`)

```typescript
interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  sex: 'MALE' | 'FEMALE';
}
```

#### Step 2: Daily Rate and Employment Preferences (`FreelanceTjmStep.tsx`)

```typescript
interface TjmData {
  dailyRate: number; // TJM (Taux Journalier Moyen)
  wantSalaried: boolean; // Option for salaried employment
  salary: number; // Requested salary if salaried
  startDate: Date; // Preferred start date
}
```

#### Step 3: Portage Interest (`FreelancePortageStep.tsx`)

```typescript
interface PortageData {
  isPortageCandidate: boolean;
  selectedPortages?: number[]; // If interested in portage
}
```

#### Step 4: Mission Preferences (`FreelancePriorityStep.tsx`)

```typescript
interface PriorityData {
  priority: 'cost' | 'quality' | 'speed';
  preferredMissions: string[];
}
```

#### Step 5: Platform Services (`FreelanceServicesStep.tsx`)

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

#### Step 6: Mission Status (`FreelanceMissionStatusStep.tsx`)

```typescript
interface MissionStatusData {
  currentMissionStatus: 'available' | 'busy' | 'partially_available';
}
```

#### Step 7: Summary (`FreelanceSummaryStep.tsx`)

- Review all collected data
- Final validation and submission

### Freelance Backend Processing

The freelance onboarding API (`/api/auth/onboarding/freelance`) processes through:

```typescript
// FreelanceService methods used:
FreelanceService.createFreelanceProfile(userId, validatedData);
FreelanceService.linkPlatformServices(freelanceId, serviceIds);
FreelanceService.linkPortages(freelanceId, portageIds);

// PlatformServiceService for new services:
PlatformServiceService.createService(userId, newServiceData);

```

### Database Transaction Pattern

Freelance onboarding uses database transactions for data integrity:

```typescript
// Freelance onboarding transaction
await prisma.$transaction(async () => {
  // 1. Create freelance profile using FreelanceService
  const freelance = await FreelanceService.createFreelanceProfile(parseInt(userId), validatedData);

  // 2. Handle new platform services creation
  const createdServices = [];
  if (validatedData.new_services && validatedData.new_services.length > 0) {
    for (const newService of validatedData.new_services) {
      const service = await PlatformServiceService.createService(parseInt(userId), newService);
      createdServices.push(service);
    }
  }

  // 3. Link selected and created services to freelance
  const allServiceIds = [
    ...(validatedData.selected_services || []),
    ...createdServices.map(s => s.id),
  ];

  if (allServiceIds.length > 0) {
    await FreelanceService.linkPlatformServices(freelance.id, allServiceIds);
  }

  // 4. Link portages if interested
  if (
    validatedData.is_portage_candidate &&
    validatedData.selected_portages &&
    validatedData.selected_portages.length > 0
  ) {
    await FreelanceService.linkPortages(freelance.id, validatedData.selected_portages);
  }

  return { freelance, createdServices };
});

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
// Initial freelance user registration
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@freelance.com",
  "role": "FREELANCE",
  "phone_number": "+33987654321"
}

// Response
{
  "success": true,
  "message": "Registration initiated. Check email for verification.",
  "userId": "123456789"
}
```

### Freelance Onboarding Endpoints

```typescript
// POST /api/auth/onboarding/freelance
// Complete freelance onboarding after initial registration
{
  "userId": "123456789",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@freelance.com",
  "phone": "+33987654321",
  "daily_rate": 450.00,
  "is_portage_candidate": true,
  "selected_portages": [1, 2],
  "preferred_missions": ["développement web", "consulting"],
  "selected_services": [1, 3, 5],
  "current_mission_status": "available",
  "priority": "quality",
  "new_services": [
    {
      "service_label": "Custom Freelance Service",
      "service_description": "Specialized service offering",
      "data_type": "SELECT",
      "requires_data": true,
      "data_label": "Expertise Level",
      "data_description": "Years of experience",
      "choices": ["Junior", "Mid", "Senior"]
    }
  ]
}

// Response
{
  "success": true,
  "message": "Freelance onboarding completed successfully",
  "freelanceId": "freelance_123456789"
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

### Freelance-Specific Tables

#### User Table (Freelance Role)

```sql
User {
  id: Int (Primary Key)
  first_name: String
  last_name: String
  email: String (Unique)
  password: String
  phone_number: String?
  sex: Sex? (MALE/FEMALE)
  role: Role (FREELANCE)
  status: Boolean (Default: true)
  email_verified: Boolean (Default: false)
  verification_token: String? (Unique)
  verification_token_expires: DateTime?
  reset_token: String? (Unique)
  reset_token_expires: DateTime?
  created_at: DateTime (Default: now())
  image: String?

  // Relations
  freelance: Freelance?
  email_verification_tokens: EmailVerificationToken[]
}
```

#### Freelance Table

```sql
Freelance {
  id: Int (Primary Key)
  freelance_id: Int (Unique)
  metier_id: Int
  
  // Relations
  metier: Metier
  user: User
  requests: FreelanceRequest[]
}
```

#### FreelanceRequest Table (NEW)

```sql
FreelanceRequest {
  id: Int (Primary Key)
  freelance_id: Int
  mission_status: MissionStatus (OPEN/CLOSED/PENDING)
  client_name: String?
  client_address: String?
  client_sector: String?
  priority: Priority (HIGH/MEDIUM/LOW)
  tjm: Float
  want_salaried: Boolean (Default: false)
  salary: Float?
  start_date: DateTime?
  days: Float
  wants_portage: Boolean (Default: false)
  created_at: DateTime (Default: now())
  
  // Relations
  freelance: Freelance
  options: FreelanceRequestOption[]
  responses: CompanyResponse[]
  portages: FreelanceRequestPortage[]
}
```

#### FreelanceRequestOption Table (NEW)

```sql
FreelanceRequestOption {
  id: Int (Primary Key)
  freelance_request_id: Int
  service_option_id: Int
  is_required: Boolean (Default: false)
  response_data: Json?
  
  // Relations
  request: FreelanceRequest
  platformService: PlatformService
}
```

#### FreelanceRequestPortage Table (NEW)

```sql
FreelanceRequestPortage {
  id: Int (Primary Key)
  freelance_request_id: Int
  portage_id: Int
  
  // Relations
  request: FreelanceRequest
  portage: Portage
}
```

#### SelectedPlatformService Table (Freelance)

```sql
SelectedPlatformService {
  id: String (Primary Key)
  freelance_id: String (Foreign Key → Freelance.id)
  platform_service_id: Int (Foreign Key → PlatformService.id)
  response_data: Json? // Freelancer's response to the service
  created_at: DateTime
  updated_at: DateTime

  // Relations
  freelance: Freelance
  platform_service: PlatformService
}
```

#### SelectedPortage Table (Freelance)

```sql
SelectedPortage {
  id: String (Primary Key)
  freelance_id: String (Foreign Key → Freelance.id)
  portage_id: Int (Foreign Key → Portage.id)
  created_at: DateTime
  updated_at: DateTime

  // Relations
  freelance: Freelance
  portage: Portage
}
```

### Platform Services Architecture

#### PlatformService Table

```sql
PlatformService {
  id: Int (Primary Key, Auto-increment)
  service_label: String
  service_description: String?
  data_type: DataType (TEXT | NUMBER | DATE | SELECT | CHECKBOX | RADIO)
  requires_data: Boolean (Default: false)
  data_label: String?
  data_description: String?
  choices: String[] // For SELECT, CHECKBOX, RADIO types
  created_at: DateTime
  updated_at: DateTime

  // Relations
  selected_services: SelectedPlatformService[]
}
```

### Portage System

#### Portage Table

```sql
Portage {
  id: Int (Primary Key, Auto-increment)
  portage_label: String
  portage_description: String?
  created_at: DateTime
  updated_at: DateTime

  // Relations
  selected_portages: SelectedPortage[]
}
```

### Verification System

#### EmailVerificationToken Table

```sql
EmailVerificationToken {
  id: String (Primary Key)
  token: String (Unique)
  user_id: String (Foreign Key → User.id)
  expires_at: DateTime
  used: Boolean (Default: false)
  created_at: DateTime

  // Relations
  user: User
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
- **Constraint validation**: Unique email enforcement
- **Status controls**: Multi-level activation flags

## Error Handling

### Freelance-Specific Error Scenarios

1. **Duplicate email registration**

   ```typescript
   throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
   ```

2. **Invalid or expired verification token**

   ```typescript
   throw new Error('Token de vérification invalide ou expiré');
   ```

3. **Onboarding before initial registration**

   ```typescript
   throw new Error('User not found or not in valid state for onboarding');
   ```

4. **Platform service validation errors**

   ```typescript
   throw new Error('Required platform services not completed');
   ```

5. **Daily rate validation errors**
   ```typescript
   throw new Error('Daily rate must be a positive number');
   ```

## Testing Strategy

### Unit Tests for Freelance Flow

```typescript
// tests/unit/api/auth/freelance.onboarding.test.ts
describe('POST /api/auth/onboarding/freelance', () => {
  it('should successfully complete freelance onboarding', async () => {
    // Test complete freelance onboarding flow
  });

  it('should handle daily rate validation', async () => {
    // Test TJM validation logic
  });

  it('should create and link platform services', async () => {
    // Test service creation and linking
  });

  it('should handle portage candidate setup', async () => {
    // Test portage-specific functionality
  });

  it('should validate mission status options', async () => {
    // Test mission status validation
  });
});
```

### Integration Tests

- Complete freelance registration flow testing
- Email verification workflow for freelancers
- Freelance onboarding completion scenarios
- Freelance-specific error handling and validation

## Freelance-Specific Features

### Daily Rate (TJM) Management

- **Flexible Rate Setting**: Freelancers can set their preferred daily rate
- **Currency Handling**: Support for EUR with proper decimal precision
- **Rate Validation**: Ensures positive numeric values

### Salary and Employment Preferences (NEW)

- **Salaried Employment Option**: Freelancers can opt for salaried employment
- **Salary Specification**: Can specify desired salary amount
- **Start Date Selection**: Can specify preferred start date for missions
- **Days Calculation**: Track mission duration in days

### Mission Status Tracking

- **Available**: Ready for new missions
- **Busy**: Currently engaged in missions
- **Partially Available**: Limited availability

### Priority Preferences

- **High**: Critical priority missions
- **Medium**: Standard priority missions
- **Low**: Lower priority missions

### Portage Integration

- **Candidate Status**: Option to be considered for portage opportunities
- **Multiple Portage Companies**: Can select multiple preferred portage partners
- **Flexible Preferences**: Can change portage status during onboarding

## Summary

The LilLinker freelance onboarding system provides a comprehensive, multi-step freelance registration and onboarding process that ensures:

- **Tailored Freelance Experience**: Specialized for independent contractors and consultants
- **Rate and Preference Management**: Daily rate setting and mission preferences
- **Salaried Employment Options**: Support for freelancers seeking salaried positions
- **Schedule Planning**: Start date and mission duration tracking
- **Gender Information**: Support for gender information for administrative requirements
- **Portage Integration**: Seamless connection with portage companies
- **Flexible Service Selection**: Platform services with custom service creation
- **Mission Status Tracking**: Current availability and work status
- **Data Integrity**: Database transactions ensure consistent data state
- **Robust Testing**: Comprehensive unit and integration test coverage

This system ensures a smooth freelance onboarding experience while capturing all necessary professional information and preferences for effective matching with opportunities.

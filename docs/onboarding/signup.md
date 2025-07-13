# User Registration and Signup Documentation

## Overview

The Lillinker platform implements a comprehensive signup system that handles both Company and Freelance user registration through a multi-phase approach with email verification, role-based onboarding, and platform service integration.

## Signup Architecture

### Registration Phases

1. **Initial Registration**: Basic user information collection
2. **Role-Specific Onboarding**: Detailed profile completion
3. **Email Verification**: Account activation and password setting
4. **Account Activation**: Full platform access

### User Types and Flows

```typescript
enum Role {
  ADMIN     // Platform administrators
  COMPANY   // Company administrators  
  FREELANCE // Independent contractors
  MANAGER   // Company managers
}
```

## Phase 1: Initial Registration

### Data Collection

```typescript
interface InitialRegistration {
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
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

## Phase 2: Role-Based Onboarding

### Company Onboarding

Companies complete detailed business information:

```typescript
// AuthService.completeCompanyOnboarding()
interface CompanyOnboardingData {
  company_name: string;
  company_siret: string;
  address: string;
  postal_code: string;
  city: string;
  country: string;
  company_phone: string;
  website?: string;
  company_description?: string;
  activity_sector?: string;
  company_size?: string;
  logo_url?: string;
  platform_services: Array<{
    service_id: string;
    is_required: boolean;
    response_data?: any;
  }>;
}
```

### Freelance Onboarding

Freelancers provide professional profile details:

```typescript
// AuthService.completeFreelanceOnboarding()
interface FreelanceOnboardingData {
  professional_title: string;
  experience_years?: number;
  rate_per_hour?: number;
  availability?: string;
  skills?: string[];
  portfolio_url?: string;
  bio?: string;
  linkedin_url?: string;
  platform_services: Array<{
    service_id: string;
    is_required: boolean;
    response_data?: any;
  }>;
}
```

### Database Transaction Pattern

Both onboarding flows use database transactions for data integrity:

```typescript
await prisma.$transaction(async (tx) => {
  // Update user status
  const updatedUser = await tx.user.update({
    where: { id: userId },
    data: { status: true }
  });

  // Create role-specific record
  const profile = await tx.company.create({
    data: { ...companyData, user_id: userId }
  });

  // Handle platform services
  for (const service of platform_services) {
    await tx.userPlatformService.create({
      data: {
        user_id: userId,
        platform_service_id: service.service_id,
        is_required: service.is_required,
        response_data: service.response_data || {}
      }
    });
  }

  return { user: updatedUser, profile };
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

### Email Content

Verification emails include:
- **Secure verification link**: `/verify-email?token=${verificationToken}`
- **Token expiration**: 24-hour validity window
- **Account details**: User name and email for reference

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

## API Endpoints

### Registration Endpoints

```typescript
// POST /api/auth/register
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
  "user_id": "user_123456789"
}
```

### Onboarding Endpoints

```typescript
// POST /api/auth/onboarding/company
{
  "user_id": "user_123456789",
  "company_name": "Tech Solutions Inc",
  "company_siret": "12345678901234",
  "address": "123 Business Street",
  "postal_code": "75001",
  "city": "Paris",
  "country": "France",
  "company_phone": "+33987654321",
  "platform_services": [
    {
      "service_id": "service_123",
      "is_required": true,
      "response_data": { "setup": "complete" }
    }
  ]
}

// POST /api/auth/onboarding/freelance
{
  "user_id": "user_123456789",
  "professional_title": "Full Stack Developer",
  "experience_years": 5,
  "rate_per_hour": 75.00,
  "skills": ["React", "Node.js", "TypeScript"],
  "platform_services": [
    {
      "service_id": "service_456",
      "is_required": false,
      "response_data": { "portfolio": "updated" }
    }
  ]
}
```

### Verification Endpoints

```typescript
// POST /api/auth/verify-email
{
  "token": "a1b2c3d4e5f6...",
  "password": "SecurePassword123!"
}

// Response
{
  "success": true,
  "message": "Email verified and password set successfully",
  "user": {
    "id": "user_123456789",
    "email": "john@company.com",
    "email_verified": true,
    "status": true
  }
}
```

## Error Handling

### Common Error Scenarios

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

## Database Schema

### User Model
```prisma
model User {
  id                          String    @id @default(cuid())
  first_name                  String
  last_name                   String  
  email                       String    @unique
  password                    String
  role                        Role
  phone_number                String?
  email_verified              Boolean   @default(false)
  verification_token          String?   @unique
  verification_token_expires  DateTime?
  status                      Boolean   @default(false)
  created_at                  DateTime  @default(now())
  updated_at                  DateTime  @updatedAt
  
  // Relationships
  company                     Company?
  freelance                   Freelance?
  userPlatformServices        UserPlatformService[]
}
```

### Company Model
```prisma
model Company {
  id                  String    @id @default(cuid())
  user_id             String    @unique
  company_name        String
  company_siret       String    @unique
  address             String
  postal_code         String
  city                String
  country             String
  company_phone       String
  website             String?
  company_description String?
  activity_sector     String?
  company_size        String?
  logo_url            String?
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  user                User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### Freelance Model
```prisma
model Freelance {
  id                String    @id @default(cuid())
  user_id           String    @unique
  professional_title String
  experience_years  Int?
  rate_per_hour     Decimal?  @db.Decimal(10, 2)
  availability      String?
  skills            String[]
  portfolio_url     String?
  bio               String?
  linkedin_url      String?
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  user              User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

## Integration Points

### Mailer Service
- Sends verification emails with secure tokens
- Handles email templates and formatting
- Manages delivery status and error handling

### Platform Services
- Modular service system for extended functionality
- Required vs. optional service differentiation
- Custom response data handling per service

### Authentication Provider
- NextAuth integration for session management
- Custom credential provider using AuthService
- JWT token handling for authenticated sessions

## Testing Strategy

### Unit Tests
- AuthService method validation
- Token generation and verification
- Password hashing and validation
- Database transaction integrity

### Integration Tests
- Complete registration flow testing
- Email verification workflow
- Onboarding completion scenarios
- Error handling and edge cases

### Security Tests
- Token expiration validation
- Password strength enforcement
- SQL injection prevention
- XSS protection in form inputs

## Monitoring and Logging

### Registration Events
- User creation attempts and results
- Email verification success/failure rates
- Onboarding completion tracking
- Security event logging (failed verifications, etc.)

### Performance Metrics
- Registration completion times
- Email delivery success rates
- Database transaction performance
- Token generation efficiency

This comprehensive signup system provides secure, scalable user registration with role-based onboarding and robust verification mechanisms.

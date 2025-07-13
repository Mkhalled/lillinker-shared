# Email Validation Documentation

## Overview

The Lillinker platform implements a secure email validation system using crypto-generated tokens, bcrypt password hashing, and a comprehensive verification flow. The system ensures email authenticity and account security before allowing users to access platform features.

## Email Validation Architecture

### Core Components

- **AuthService**: Handles registration, verification, and onboarding processes
- **Crypto Token Generation**: Uses Node.js `crypto.randomBytes()` for secure tokens
- **Prisma Database**: Manages user verification state and token storage
- **Email Service**: Sends verification emails via the mailer system

## Complete Verification Flow

### 1. Initial Registration

The registration process creates a user with a temporary password and verification token:

```typescript
// AuthService.initiateRegistration()
static async initiateRegistration(data: InitialRegistration) {
  // Check for existing user
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Un utilisateur avec cette adresse e-mail existe déjà');
  }

  // Generate secure verification token
  const verificationToken = randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create temporary password for security
  const tempPassword = await hash(randomBytes(32).toString('hex'), 12);

  // Create user record
  const user = await prisma.user.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: tempPassword, // Temporary - replaced during verification
      role: data.role,
      phone_number: data.phone_number,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      status: false, // Activated after onboarding completion
    },
  });

  return { user, verificationToken };
}
```

**User States During Registration:**
- `email_verified: false` - Email not yet verified
- `status: false` - Account not activated
- `verification_token: string` - 64-character hex token
- `verification_token_expires: DateTime` - 24-hour expiration

### 2. Email Verification Process

#### Token Security Features
- **Crypto-secure generation**: Uses `crypto.randomBytes(32)` for 256-bit entropy
- **Hex encoding**: 64-character hexadecimal string
- **Expiration**: 24-hour validity window
- **Single-use**: Token cleared after successful verification

#### Verification Link Format
```
https://yourdomain.com/auth/verify-email?token=a1b2c3d4e5f6...64chars
```

### 3. Email Verification and Password Setting

Users verify their email and set their actual password:

```typescript
// AuthService.verifyEmailAndSetPassword()
static async verifyEmailAndSetPassword(token: string, password: string) {
  // Find user with valid token
  const user = await prisma.user.findUnique({
    where: { 
      verification_token: token,
      verification_token_expires: {
        gt: new Date(), // Token not expired
      },
    },
  });

  if (!user) {
    throw new Error('Token de vérification invalide ou expiré');
  }

  // Hash the real password
  const hashedPassword = await hash(password, 12);

  // Update user with verified status
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword, // Replace temporary password
      email_verified: true,
      verification_token: null, // Clear token
      verification_token_expires: null,
    },
  });

  return { success: true, message: 'Email vérifié et mot de passe défini avec succès' };
}
```

### Email Validation Endpoint

The validation endpoint handles the verification process when a user clicks the link:

```typescript
// API Endpoint: /api/auth/verify-email
// Method: POST
{
  "token": "64-character-hex-token",
  "password": "user-chosen-password"
}
```

**Process:**
1. Validate token exists and hasn't expired
2. Hash the new password with bcrypt (12 rounds)
3. Update user: set password, mark email_verified=true, clear token
4. Return success message

## Database Schema

```prisma
model User {
  id             Int              @id @default(autoincrement())
  first_name     String
  last_name      String
  email          String           @unique
  password       String
  role           Role
  status         Boolean          @default(true)
  email_verified        Boolean   @default(false)
  verification_token    String?   @unique
  verification_token_expires DateTime?
  // ... other fields
}
```

## Security Features

- **Crypto-secure tokens**: `crypto.randomBytes(32).toString('hex')`
- **24-hour expiration**: Automatic token invalidation
- **Temporary passwords**: Initial secure placeholder until verification
- **Single-use tokens**: Cleared after successful verification
- **bcrypt hashing**: 12 salt rounds for production security

## Error Handling

The verification endpoint handles several error cases:

- **Missing Token**: If no token is provided in the URL
- **Invalid Token**: If the token doesn't match any user in the database
- **Expired Token**: If the token has passed its expiration time

## User Experience

After clicking the verification link, users should be redirected to a confirmation page indicating whether the verification was successful or if there was an error.

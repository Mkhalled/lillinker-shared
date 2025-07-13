# Login Access Control and User Blocking

## Overview

The Lillinker platform implements comprehensive access control mechanisms that prevent unauthorized or incomplete user accounts from accessing the system. This security layer ensures only fully verified and onboarded users can authenticate.

## Access Control Rules

### Primary Blocking Conditions

Users are blocked from login when they have:

1. **Unverified Email**: `email_verified: false`
2. **Inactive Status**: `status: false` 
3. **Expired Verification Token**: Token past 24-hour expiration
4. **Incomplete Onboarding**: Missing role-specific profile data

### Authentication Flow Validation

```typescript
// From NextAuth authorize function in auth.ts
const authorize = async (credentials: any) => {
  try {
    const user = await AuthService.authenticateUser(
      credentials.email,
      credentials.password
    );

    // Block access for unverified users
    if (!user.email_verified) {
      throw new Error('Please verify your email before logging in');
    }

    // Block access for inactive users  
    if (!user.status) {
      throw new Error('Account is not activated. Complete onboarding first');
    }

    return {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
};
```

## User State Management

### Registration State Flow

```
Initial Registration → [email_verified: false, status: false]
       ↓
Email Verification → [email_verified: true, status: false]
       ↓
Complete Onboarding → [email_verified: true, status: true]
       ↓
Login Allowed
```

### Database Status Fields

```typescript
// User model status fields
interface UserStatus {
  email_verified: boolean;          // Email verification completed
  status: boolean;                  // Account activation status
  verification_token: string | null; // Active verification token
  verification_token_expires: Date | null; // Token expiration
}
```

## Blocking Scenarios

### 1. Unverified Email Account

**Condition**: User registered but hasn't verified email
```typescript
// User state
{
  email_verified: false,
  status: false,
  verification_token: "a1b2c3d4e5f6...",
  verification_token_expires: "2024-01-15T10:30:00Z"
}
```

**Error Message**: "Please verify your email before logging in"

**Resolution**: User must click verification link in email and set password

### 2. Incomplete Onboarding

**Condition**: Email verified but onboarding not completed
```typescript
// User state  
{
  email_verified: true,
  status: false,
  verification_token: null,
  verification_token_expires: null
}
```

**Error Message**: "Account is not activated. Complete onboarding first"

**Resolution**: User must complete role-specific onboarding flow

### 3. Expired Verification Token

**Condition**: Verification token past 24-hour expiration
```typescript
// User state
{
  email_verified: false,
  status: false,
  verification_token: "expired_token",
  verification_token_expires: "2024-01-14T10:30:00Z" // Past date
}
```

**Error Message**: "Verification token expired. Request new verification email"

**Resolution**: User must request new verification email

## Implementation Details

### AuthService Authentication

```typescript
// AuthService.authenticateUser()
static async authenticateUser(email: string, password: string) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: true,
      freelance: true,
      userPlatformServices: {
        include: { platformService: true }
      }
    }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check email verification
  if (!user.email_verified) {
    throw new Error('Please verify your email before logging in');
  }

  // Check account activation
  if (!user.status) {
    throw new Error('Account is not activated. Complete onboarding first');
  }

  return user;
}
```

### NextAuth Configuration

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await AuthService.authenticateUser(
            credentials.email,
            credentials.password
          );

          return {
            id: user.id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  // ... additional configuration
};
```

## Security Considerations

### Token Security
- **Secure generation**: Crypto.randomBytes for verification tokens
- **Time-limited access**: 24-hour token expiration
- **Single-use tokens**: Cleared after successful verification

### Password Security
- **Temporary passwords**: Crypto-generated during registration
- **Bcrypt hashing**: 12 salt rounds for production
- **User-defined passwords**: Set during email verification

### Session Security
- **JWT tokens**: Stateless session management
- **Role-based access**: Token includes user role information
- **Automatic expiration**: Session timeout handling

## Related Files

| File | Responsibility |
|------|----------------|
| `src/lib/auth.ts` | NextAuth configuration and credential validation |
| `src/services/auth.service.ts` | User authentication logic and validation |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |
| `tests/unit/auth/credentials.ts` | Authentication unit tests |
| `prisma/schema.prisma` | User model with status fields |

## Testing Strategy

### Unit Tests
```typescript
describe('Login Access Control', () => {
  test('blocks unverified email users', async () => {
    const user = await createTestUser({ email_verified: false });
    await expect(AuthService.authenticateUser(user.email, 'password'))
      .rejects.toThrow('Please verify your email before logging in');
  });

  test('blocks inactive status users', async () => {
    const user = await createTestUser({ email_verified: true, status: false });
    await expect(AuthService.authenticateUser(user.email, 'password'))
      .rejects.toThrow('Account is not activated. Complete onboarding first');
  });
});
```

This comprehensive access control system ensures platform security while providing clear user guidance for account completion.

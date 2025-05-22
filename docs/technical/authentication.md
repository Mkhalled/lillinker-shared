# Authentication Documentation

## Overview

Our authentication system uses NextAuth.js with a custom credentials provider and JWT strategy. We support both email/password and OAuth authentication flows.

## Authentication Flow

### Registration

We use a unified registration endpoint that dispatches to role-specific registration handlers:

1. User submits registration form with:

   - Email
   - Password
   - First name
   - Last name
   - Role-specific data:
     - Consultant: Basic profile information
     - Company Admin: Company details (name, SIRET, address)
     - Company Manager: Company ID and manager details

2. System:

   - Validates input data
   - Hashes password
   - Creates user record with appropriate role
   - Generates email verification token
   - Sends verification email

3. User:
   - Receives verification email
   - Clicks verification link
   - Account is activated

### API Endpoints

#### Unified Registration Route

```typescript
// app/api/auth/register/route.ts
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { role } = data;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    let user;
    switch (role) {
      case 'CONSULTANT':
        user = await AuthService.registerConsultant(data);
        break;
      case 'COMPANY_ADMIN':
        user = await AuthService.registerCompanyAdmin(data);
        break;
      case 'COMPANY_MANAGER':
        user = await AuthService.registerCompanyManager(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

#### Role-Specific Registration Services

```typescript
// src/services/auth.service.ts
export class AuthService {
  static async registerConsultant(data: {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
  }) {
    // Implementation details...
  }

  static async registerCompanyAdmin(data: {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
    companyName: string;
    companySiret: string;
    companyAddress: string;
  }) {
    // Implementation details...
  }

  static async registerCompanyManager(data: {
    firstname: string;
    lastname: string;
    email: string;
    username: string;
    password: string;
    phone?: string;
    companyId: string;
  }) {
    // Implementation details...
  }
}
```

## Security Measures

1. **Password Security**

   - BCrypt hashing
   - Minimum length requirements
   - Complexity requirements
   - Rate limiting

2. **Session Security**

   - JWT-based sessions
   - Secure cookie settings
   - CSRF protection
   - Session timeout

3. **Email Verification**

   - Unique verification tokens
   - Token expiration
   - Rate limiting

4. **Access Control**
   - Role-based permissions
   - Company-based isolation
   - API key authentication

## Testing Authentication

### Unit Tests

```typescript
describe('Authentication', () => {
  it('should validate credentials correctly', async () => {
    const user = await createTestUser();
    const result = await validateCredentials({
      email: user.email,
      password: 'password123',
    });
    expect(result).toBeTruthy();
  });
});
```

### Integration Tests

```typescript
describe('Auth Flow', () => {
  it('should complete registration and login flow', async () => {
    // Registration
    const userData = generateUserData();
    await registerUser(userData);

    // Login
    const session = await loginUser({
      email: userData.email,
      password: 'password123',
    });

    expect(session).toBeDefined();
  });
});
```

## Error Handling

Common authentication errors:

1. **Invalid Credentials**

   - Email not found
   - Password incorrect
   - Account locked

2. **Validation Errors**

   - Invalid email format
   - Password too weak
   - Required fields missing

3. **System Errors**
   - Database connection issues
   - Email service failures
   - Token generation failures

## Best Practices

1. **Password Management**

   - Never store plain text passwords
   - Use strong hashing algorithms
   - Implement password reset flow
   - Enforce password policies

2. **Session Management**

   - Use secure session storage
   - Implement session timeout
   - Handle concurrent sessions
   - Provide session revocation

3. **Error Handling**

   - Use consistent error formats
   - Log security events
   - Implement rate limiting
   - Provide clear error messages

4. **Testing**
   - Test all authentication flows
   - Verify security measures
   - Test error scenarios
   - Maintain test coverage

## Configuration

### Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user
EMAIL_SERVER_PASSWORD=password
EMAIL_FROM=noreply@example.com
```

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    // ... providers
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  events: {
    async signIn(message) {
      // Handle successful sign in
    },
    async signOut(message) {
      // Handle sign out
    },
  },
};
```

## Troubleshooting

Common issues and solutions:

1. **Authentication Failures**

   - Check credentials format
   - Verify database connection
   - Check environment variables
   - Review error logs

2. **Session Issues**

   - Verify JWT configuration
   - Check cookie settings
   - Review session storage
   - Test session timeout

3. **Email Problems**

   - Verify SMTP settings
   - Check email templates
   - Review rate limits
   - Test email delivery

4. **Performance Issues**
   - Monitor authentication times
   - Check database queries
   - Review caching strategy
   - Optimize token handling

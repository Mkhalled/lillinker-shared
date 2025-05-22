# Authentication Documentation

## Overview

Our authentication system uses NextAuth.js with a custom credentials provider and JWT strategy. We support both email/password and OAuth authentication flows.

## Authentication Flow

### Registration

1. User submits registration form with:

   - Email
   - Password
   - First name
   - Last name
   - Phone (optional)
   - Company details (for company users)

2. System:

   - Validates input data
   - Hashes password
   - Creates user record
   - Generates email verification token
   - Sends verification email

3. User:
   - Receives verification email
   - Clicks verification link
   - Account is activated

### Login

1. User submits credentials:

   - Email
   - Password

2. System:

   - Validates credentials
   - Checks account status
   - Generates JWT
   - Creates session
   - Returns user data

3. User:
   - Is redirected to dashboard
   - Receives session cookie

## API Endpoints

### Authentication Routes

```typescript
// app/api/auth/[...nextauth]/route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials
        // Return user object or null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add custom claims to JWT
      return token;
    },
    async session({ session, token }) {
      // Add custom data to session
      return session;
    },
  },
};
```

### User Registration Routes

```typescript
// app/api/auth/register-user/route.ts
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await AuthService.registerUser(data);
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
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
describe('User Registration', () => {
  it('should register a new user successfully', async () => {
    const userData = generateUserRegistrationData();
    const result = await AuthService.registerUser(userData);
    expect(result).toBeDefined();
    expect(result.email).toBe(userData.email);
  });
});
```

### Integration Tests

```typescript
describe('Auth Flow', () => {
  it('should complete registration and login flow', async () => {
    // Registration
    const userData = generateUserRegistrationData();
    await registerUser(userData);

    // Login
    const session = await loginUser({
      email: userData.email,
      password: userData.password,
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
   - Duplicate email/username

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

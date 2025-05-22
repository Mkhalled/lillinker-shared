# Technical Architecture

## System Overview

Lillinker is built as a modern web application using Next.js, with a focus on security, scalability, and privacy.

## Application Architecture

### Layered Architecture

Our application follows a three-layer architecture pattern to ensure separation of concerns, maintainability, and testability:

```
src/
├── app/                    # Next.js app router
│   └── api/               # API routes
├── dao/                    # Data Access Objects
├── services/              # Business logic
└── lib/                   # Shared utilities
```

#### 1. Data Access Layer (DAO)

The DAO layer is responsible for all database interactions:

```typescript
// src/dao/user.dao.ts
export class UserDAO {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async create(data: UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }
}
```

Responsibilities:

- Database operations
- Data validation
- Query optimization
- Transaction management

#### 2. Service Layer

The service layer contains business logic and orchestrates DAO operations:

```typescript
// src/services/auth.service.ts
export class AuthService {
  static async registerConsultant(data: RegisterConsultantInput) {
    // Business logic
    const existingUser = await UserDAO.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Data transformation
    const hashedPassword = await hash(data.password, 10);

    // Orchestration
    return UserDAO.create({
      ...data,
      password: hashedPassword,
      roleId: CONSULTANT_ROLE_ID,
    });
  }
}
```

Responsibilities:

- Business logic implementation
- Data transformation
- Service orchestration
- Error handling
- Input validation

#### 3. Route Layer

The route layer handles HTTP requests and delegates to services:

```typescript
// src/app/api/auth/register-consultant/route.ts
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await AuthService.registerConsultant(data);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

Responsibilities:

- Request handling
- Response formatting
- Error handling
- Input validation
- Authentication/Authorization

### Benefits of Layered Architecture

1. **Testability**

   - Each layer can be tested independently
   - Easy to mock dependencies
   - Clear separation of concerns

2. **Maintainability**

   - Changes in one layer don't affect others
   - Clear responsibility boundaries
   - Easier to debug and modify

3. **Flexibility**

   - Easy to swap implementations
   - Can change database without affecting business logic
   - Can modify business rules without touching routes

4. **Scalability**
   - Each layer can be scaled independently
   - Easy to add caching at any layer
   - Clear performance boundaries

### Best Practices

1. **Naming Conventions**

   - DAO classes: `[Entity]DAO` (e.g., `UserDAO`)
   - Service classes: `[Domain]Service` (e.g., `AuthService`)
   - Route files: `[resource]/route.ts`

2. **Error Handling**

   - DAOs: Throw database-specific errors
   - Services: Transform errors into business exceptions
   - Routes: Handle errors and return appropriate HTTP responses

3. **Type Safety**

   - Use Prisma-generated types in DAOs
   - Define clear interfaces for service inputs/outputs
   - Validate request data at route level

4. **Testing Strategy**
   - DAOs: Test database operations
   - Services: Test business logic
   - Routes: Test HTTP handling

## Core Components

### 1. Authentication and Authorization

- NextAuth.js for authentication
- Role-based access control
- Secure session management
- Email verification system

### 2. Data Layer

- PostgreSQL database
- Prisma ORM
- Data validation and sanitization
- Secure data storage

### 3. Privacy and Anonymity Layer

- Pseudonym generation service
- Identity masking system
- Controlled information disclosure
- Audit logging

## Privacy Architecture

### Identity Management

```
┌─────────────────┐     ┌─────────────────┐
│  Real Identity  │     │  Public Profile │
│  (Secure Store) │◄───►│  (Masked Data)  │
└─────────────────┘     └─────────────────┘
```

### Data Flow

1. **Registration**

   - Real identity information stored securely
   - Public profile created with masked/pseudonymized data
   - Unique identifiers generated for matching

2. **Matching Phase**

   - All communications use pseudonyms
   - No real identity information exposed
   - Secure message routing

3. **Information Disclosure**
   - Controlled release of information
   - Explicit user consent required
   - Audit trail maintained

### Security Measures

- End-to-end encryption for sensitive communications
- Secure storage of real identities
- Regular security audits
- Compliance with data protection regulations

## Database Design Considerations

### Privacy-First Schema

- Separate tables for real and public identities
- Encrypted storage of sensitive information
- Audit tables for tracking information disclosure
- Pseudonym mapping tables

### Performance Considerations

- Efficient pseudonym generation
- Optimized querying for masked data
- Caching strategies for public profiles
- Scalable audit logging

## API Design

### Privacy-Aware Endpoints

- Separate endpoints for real and public data
- Role-based access control
- Rate limiting
- Input validation and sanitization

### Response Formatting

- Automatic masking of sensitive information
- Clear indication of anonymity status
- Consistent pseudonym presentation
- Audit information in responses

## Future Considerations

- Advanced privacy controls
- Customizable anonymity levels
- Enhanced audit capabilities
- Integration with privacy-focused services

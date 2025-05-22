# Prisma Setup

## Overview

This document outlines the Prisma setup and configuration for the Lillinker Platform. Prisma is used as our ORM (Object-Relational Mapping) tool to interact with our PostgreSQL database.

## Configuration

### Schema Location

The Prisma schema is located at `prisma/schema.prisma`. This file contains:

- Database connection configuration
- Model definitions
- Indexes and constraints
- Relations between models

### Database Connection

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The database URL should be set in your `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lillinker?schema=public"
```

## Models

Our schema includes the following models:

1. **User**

   - Base user entity
   - Authentication and profile data
   - Role and company associations

2. **Role**

   - User roles and permissions
   - System and custom roles
   - Role hierarchy

3. **Permission**

   - Granular access controls
   - System and custom permissions
   - Permission scopes

4. **Company**

   - Organization data
   - Company hierarchy
   - Business metrics

5. **NextAuth Models**
   - Account
   - Session
   - Verification tokens

## Migrations

### Creating Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to production
npx prisma migrate deploy
```

### Migration Files

Migrations are stored in `prisma/migrations/`. Each migration includes:

- SQL statements for schema changes
- Migration metadata
- Rollback instructions

## Prisma Client

### Generation

```bash
# Generate Prisma Client
npx prisma generate
```

### Usage

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example query
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { role: true },
});
```

## Testing

### Test Database Setup

1. Create a test database
2. Set `DATABASE_URL` in `.env.test`
3. Run migrations

```bash
# Run migrations for test database
DATABASE_URL="postgresql://user:password@localhost:5432/lillinker_test?schema=public" npx prisma migrate deploy
```

### Test Utilities

```typescript
// tests/helpers/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const cleanupDatabase = async () => {
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
    }
  }
};
```

## Best Practices

1. **Schema Changes**

   - Always create migrations for schema changes
   - Test migrations before deploying
   - Keep migrations atomic and reversible

2. **Query Optimization**

   - Use appropriate indexes
   - Limit the number of relations in queries
   - Use select statements for large tables

3. **Error Handling**

   - Handle Prisma errors appropriately
   - Use transactions for multiple operations
   - Implement proper error logging

4. **Testing**
   - Use a separate test database
   - Clean up test data after each test
   - Mock Prisma client for unit tests

## Environment Setup

### Development

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lillinker_dev?schema=public"
```

### Testing

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lillinker_test?schema=public"
```

### Production

```env
DATABASE_URL="postgresql://user:password@production-host:5432/lillinker?schema=public"
```

## Troubleshooting

### Common Issues

1. **Connection Issues**

   - Verify database URL
   - Check database credentials
   - Ensure database is running

2. **Migration Problems**

   - Check for conflicting migrations
   - Verify migration order
   - Test migrations locally first

3. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Monitor connection pool

### Debugging

```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma GitHub](https://github.com/prisma/prisma)

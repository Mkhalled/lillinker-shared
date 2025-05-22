# Testing Documentation

## Overview

This document outlines the testing strategy and setup for the Lillinker platform.

## Test Environment Setup

### Database Configuration

The test environment uses a dedicated PostgreSQL database:

```env
DATABASE_URL="postgresql://lillinker:lillinker123@localhost:5432/lillinker_test"
NODE_ENV="test"
LOG_LEVEL="error"
```

### Docker Setup

The test database is automatically created using Docker:

```yaml
services:
  postgres:
    environment:
      POSTGRES_MULTIPLE_DATABASES: lillinker_dev,lillinker_test
    volumes:
      - ./docker-entrypoint-initdb.d:/docker-entrypoint-initdb.d
```

## Test Structure

### Model Tests

Located in `src/__tests__/models/`, these tests verify:

- ID strategy implementation
- Model relationships
- Data validation
- Constraints enforcement

Example test structure:

```typescript
describe('User Model', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();
  });

  // Test cases...
});
```

### Test Utilities

The platform provides test utilities in `src/lib/test-utils.ts`:

- `setupTestDatabase()`: Prepares the test database
- `teardownTestDatabase()`: Cleans up after tests
- Database connection management
- Test data seeding

#### Safety Measures

The `clearDatabase()` function includes a critical safety check:

```typescript
if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    'clearDatabase() can only be called in test environment. Current NODE_ENV: ' +
      process.env.NODE_ENV
  );
}
```

This prevents accidental database truncation in development or production environments. The function will only execute when:

- `NODE_ENV` is explicitly set to 'test'
- The application is running in a test context

## Environment Configuration

### Required Environment Variables

The testing environment requires specific environment variables to be set:

```env
NODE_ENV="test"              # Must be set to 'test' for test-specific features
DATABASE_URL="..."          # Connection string for test database
LOG_LEVEL="error"           # Reduced logging during tests
```

### Environment-Specific Behavior

Several features are environment-aware and behave differently based on `NODE_ENV`:

1. **Database Operations**

   - `clearDatabase()` only works when `NODE_ENV=test`
   - Development seeding requires `NODE_ENV=development`
   - Production operations require `NODE_ENV=production`

2. **Logging**
   - Test environment uses minimal logging
   - Development environment includes debug information
   - Production environment focuses on critical logs

### NPM Scripts

The following scripts automatically set the correct environment:

```bash
# Test scripts (NODE_ENV=test)
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Development scripts (NODE_ENV=development)
npm run prisma:seed   # Seed development database
npm run db:seed       # Seed database using Prisma
npm run db:reset      # Reset and seed database
```

### Manual Environment Setting

When running commands manually, always specify the environment:

```bash
# For testing
NODE_ENV=test npm run your-script

# For development
NODE_ENV=development npm run your-script

# For production
NODE_ENV=production npm run your-script
```

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Database Management

The test database is:

- Created automatically when Docker starts
- Migrated using Prisma migrations
- Cleaned between test runs
- Seeded with necessary data (roles, permissions)

## Best Practices

1. **Test Isolation**

   - Each test should be independent
   - Clean up data after each test
   - Use beforeEach/afterEach for setup/teardown

2. **Data Management**

   - Create test data in beforeEach
   - Clean up in afterEach
   - Use meaningful test data

3. **Testing Strategy**

   - Test ID strategy implementation
   - Verify relationships
   - Check constraints
   - Validate business rules

4. **Performance**
   - Use transactions for data cleanup
   - Minimize database operations
   - Clean up resources properly

## Common Test Patterns

### Testing ID Strategy

```typescript
it('should use CUID for user IDs', async () => {
  const user = await prisma.user.create({
    data: {
      /* ... */
    },
  });
  expect(user.id).toBeValidCuid();
});
```

### Testing Relationships

```typescript
it('should maintain proper relationship with Role', async () => {
  const role = await prisma.role.create({
    /* ... */
  });
  const user = await prisma.user.create({
    data: { roleId: role.id /* ... */ },
  });
  const userWithRole = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });
  expect(userWithRole?.role.id).toBe(role.id);
});
```

### Testing Constraints

```typescript
it('should enforce unique username constraint', async () => {
  await prisma.user.create({
    /* ... */
  });
  await expect(
    prisma.user.create({
      /* same username ... */
    })
  ).rejects.toThrow();
});
```

## Custom Jest Matchers

This project includes custom Jest matchers to make testing more expressive and type-safe. These matchers are defined in `jest.setup.ts` and are automatically available in all test files.

### Available Custom Matchers

#### `toBeValidCuid()`

Tests whether a string is a valid CUID (Collision-resistant Unique IDentifier).

```typescript
expect('cln1234567890123456789012').toBeValidCuid(); // passes
expect('invalid').toBeValidCuid(); // fails
```

### Adding New Custom Matchers

To add a new custom matcher:

1. Add the type definition in `jest.setup.ts`:

```typescript
declare global {
  namespace jest {
    interface Matchers<R> {
      yourNewMatcher(): R;
    }
  }
}
```

2. Implement the matcher in `jest.setup.ts`:

```typescript
expect.extend({
  yourNewMatcher(received) {
    // implementation
  },
});
```

3. Export the matcher type for use in test files:

```typescript
export type YourNewMatcher = jest.Matchers<void>['yourNewMatcher'];
```

### Type Safety

The custom matchers are fully type-safe. When using them in test files, TypeScript will provide proper type checking and autocompletion.

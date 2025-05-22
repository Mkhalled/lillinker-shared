# Testing Documentation

## Overview

Our testing strategy follows a comprehensive approach with unit tests, integration tests, and end-to-end tests. We use Jest as our test runner and maintain a clean, maintainable test structure.

## Test Structure

```
tests/
├── fixtures/         # Data generation utilities using Faker
├── helpers/         # Test utilities and setup functions
├── mocks/          # Mock implementations for external services
├── unit/           # Unit tests for individual components
└── integration/    # Integration tests for component interactions
```

## Test Setup

### Jest Configuration

We use a single `jest.setup.ts` file in the root directory that handles:

- Environment setup
- Prisma client initialization and mocking
- Custom matchers (e.g., `toBeValidCuid`)
- Next.js and NextAuth mocks
- Global test cleanup

### Fixtures

Fixtures are our single source of truth for test data generation:

```typescript
// Example: tests/fixtures/user.ts
export function generateUserRegistrationData(overrides = {}) {
  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
    password: faker.internet.password({ length: 12 }),
    phone: faker.phone.number(),
    ...overrides,
  };
}
```

### Mocks

We maintain mocks for external services:

```typescript
// Example: tests/mocks/prisma.ts
export const mockPrisma = (prisma: PrismaClient) => {
  prisma.user.findFirst = jest.fn().mockImplementation(args => {
    return Promise.resolve(generateUserRegistrationData());
  });
  // ... other mocks
};
```

### Test Utilities

Essential test utilities are consolidated in `test-utils.ts`:

```typescript
// Example: tests/helpers/test-utils.ts
export async function setupTestEnvironment() {
  const role = await prisma.role.create({
    data: generateRoleData(),
  });
  const company = await prisma.company.create({
    data: generateCompanyData(),
  });
  return { role, company };
}
```

## Writing Tests

### Unit Tests

Unit tests focus on individual components and services:

```typescript
describe('Auth Service', () => {
  it('should register a new user successfully', async () => {
    const userData = generateUserRegistrationData();
    const result = await AuthService.registerUser(userData);

    expect(result).toBeDefined();
    expect(result.email).toBe(userData.email);
    expect(result.firstname).toBe(userData.firstname);
    expect(result.lastname).toBe(userData.lastname);
  });
});
```

### Integration Tests

Integration tests verify component interactions and database operations:

```typescript
describe('User Model', () => {
  let roleId: number;
  let companyId: string | null;

  beforeEach(async () => {
    await cleanupTestData();
    const { role, company } = await setupTestEnvironment();
    roleId = role.id;
    companyId = company.id;
  });

  it('should create a user with valid data', async () => {
    const userData = generateUserData({
      roleId,
      companyId,
      password: await hash('password123', 10),
    });

    const user = await prisma.user.create({
      data: userData,
      include: {
        role: true,
        company: true,
      },
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.roleId).toBe(roleId);
    expect(user.companyId).toBe(companyId);
  });
});
```

## Best Practices

1. **Use Fixtures for Data Generation**

   - Always use fixture functions for test data
   - Override specific fields when needed
   - Keep fixtures as the single source of truth

2. **Test Isolation**

   - Clean up test data after each test
   - Use unique identifiers for test data
   - Mock external services appropriately

3. **Test Organization**

   - Group related tests in describe blocks
   - Use clear, descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Place database-dependent tests in integration directory

4. **Mocking Strategy**
   - Mock at the appropriate level
   - Use realistic mock data
   - Document mock behavior

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test tests/unit/auth/register-user.test.ts

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## CI/CD Integration

Tests are automatically run in our CI pipeline:

1. Linting and type checking
2. Unit tests
3. Integration tests
4. Coverage reporting

## Coverage Requirements

- Minimum 80% line coverage
- Minimum 90% branch coverage for critical paths
- All new code must have corresponding tests

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**

   - Ensure test database is running
   - Check DATABASE_URL in .env.test
   - Verify Prisma client initialization

2. **Mock Issues**

   - Check mock implementations
   - Verify mock setup in jest.setup.ts
   - Ensure proper cleanup between tests

3. **Test Isolation Problems**
   - Use cleanupTestData()
   - Check for shared state
   - Verify beforeEach/afterEach hooks

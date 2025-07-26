# Test Documentation

This directory contains comprehensive documentation for all test suites in the LilLinker application.

## Documentation Structure

### [`auth.md`](./auth.md)

Complete documentation for the authentication system test suite, covering:

- Core authentication service tests
- Company onboarding flow tests
- Freelance onboarding flow tests
- Email verification API tests
- NextAuth configuration tests

## Test Organization

Our tests are organized by feature and layer:

```
tests/
├── unit/                    # Unit tests
│   ├── api/                # API endpoint tests
│   ├── lib/                # Library/utility tests
│   └── services/           # Service layer tests
├── integration/            # Integration tests
└── helpers/               # Test utilities and fixtures
```

## Running Tests

### Full Test Suite

```bash
npm test
```

### Specific Test Categories

```bash
# Authentication tests
npm test auth

# API tests
npm test /api

# Service tests
npm test services
```

### Individual Test Files

```bash
# Specific test file
npm test tests/unit/api/auth/auth.onboarding.test.ts

# Watch mode for development
npm test -- --watch
```

## Test Standards

### Naming Conventions

- Test files: `*.test.ts`
- Test descriptions: Should clearly describe the behavior being tested
- Mock objects: Prefix with `mock` (e.g., `mockUser`, `mockPrisma`)

### Documentation Requirements

Each test suite should have:

1. **Purpose statement**: What the test suite validates
2. **Test scenarios**: Detailed description of each test case
3. **Mock strategy**: How external dependencies are mocked
4. **Business logic**: What business rules are being validated

### Coverage Requirements

- **Functional coverage**: All main user flows
- **Error handling**: All error scenarios and edge cases
- **Security validation**: Authentication, authorization, data validation
- **Integration points**: Service boundaries and external dependencies

## Mock Strategy

### Database Mocking

We use comprehensive Prisma mocking that includes:

- CRUD operations
- Transaction support
- Relationship handling
- Error simulation

### External Service Mocking

- **Email services**: Verification and notification emails
- **Authentication providers**: NextAuth configuration
- **Crypto operations**: Token generation and password hashing
- **Logging services**: Comprehensive log verification

## Writing New Tests

### Test Structure Template

```typescript
import {} from /* dependencies */ '@/lib/...';

// Mock dependencies
jest.mock('@/lib/dependency', () => ({
  // mock implementation
}));

describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mocks
  });

  describe('methodName', () => {
    it('should handle success scenario', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error scenario', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Best Practices

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive names**: Test names should read like specifications
3. **Single responsibility**: One behavior per test
4. **Complete scenarios**: Test both success and failure paths
5. **Mock verification**: Verify all external calls and logging
6. **Data isolation**: Each test should be independent

## Documentation Maintenance

When adding new test suites:

1. Create detailed documentation in this folder
2. Update the main README with new test categories
3. Include examples of complex test scenarios
4. Document any new mocking strategies
5. Update coverage requirements if needed

## Debugging Tests

### Common Issues

1. **Mock misalignment**: Verify mock setup matches actual implementation
2. **Token format issues**: Check expected vs actual token formats
3. **Logging expectations**: Ensure log calls match expectations
4. **Async timing**: Verify proper async/await usage

### Debugging Tools

- Jest verbose mode: `npm test -- --verbose`
- Watch mode: `npm test -- --watch`
- Coverage report: `npm test -- --coverage`
- Specific test patterns: `npm test -- --testNamePattern="pattern"`

## Contributing

When contributing tests:

1. Follow existing patterns and conventions
2. Include comprehensive error scenario testing
3. Document complex business logic validation
4. Ensure all external dependencies are properly mocked
5. Update documentation to reflect new test capabilities

## Quality Gates

All tests must:

- ✅ Pass consistently
- ✅ Have meaningful assertions
- ✅ Cover error scenarios
- ✅ Mock external dependencies
- ✅ Include proper logging verification
- ✅ Follow naming conventions
- ✅ Be properly documented

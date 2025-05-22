# Lillinker Platform

A modern, scalable platform for connecting freelancers with umbrella companies.

## Documentation

- [Development Environment Setup](docs/technical/setup.md)
- [Development Standards](docs/technical/development-standards.md)
- [Logging System](docs/technical/logging.md)
- [Database Setup](docs/technical/database-setup.md)
- [Data Model](docs/technical/data-model.md)
- [ID Strategy](docs/ID_STRATEGY.md)
- [Testing](docs/technical/testing.md)
- [Git Workflow](docs/technical/git-workflow.md)

## Features

- User authentication and role-based access control (RBAC)
- Company hierarchy support
- Secure data handling with CUID-based IDs
- Comprehensive logging
- Automated testing with dedicated test database

## Getting Started

### Prerequisites

- Node.js 20.x
- pnpm 8.x
- Docker and Docker Compose
- PostgreSQL 15.x (via Docker)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mkhalled/lillinker-shared.git
   cd lillinker-shared
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development environment:

   ```bash
   docker-compose up -d
   npm run prisma:migrate
   npm run prisma:seed
   npm run dev
   ```

## Development

### Development Environment

The platform uses a comprehensive development setup:

#### Database

- PostgreSQL 15 running in Docker
- Automatic test database creation
- Prisma for database management
- Migration and seeding support
- See [Database Setup](docs/technical/database-setup.md) for detailed configuration

#### Logging

- Winston-based logging system
- File-based logging with rotation
- Request-scoped logging
- Multiple log levels (error, warn, info, debug)
- Environment-specific configurations
- See [Logging System](docs/technical/logging.md) for detailed setup

#### Testing

- Jest for testing
- Dedicated test database
- Automatic test setup and teardown
- Comprehensive model testing
- Relationship validation
- See [Testing Documentation](docs/technical/testing.md) for detailed information

### Running Tests

The platform uses Jest for testing with a dedicated test database:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

For detailed testing information, see [Testing Documentation](docs/technical/testing.md).

### Database Management

```bash
# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

For detailed database setup and management, see [Database Setup](docs/technical/database-setup.md).

### Code Quality

```bash
# Run type checking
npm run type-check

# Check formatting
npm run format:check

# Run linter
npm run lint
```

For development standards and best practices, see [Development Standards](docs/technical/development-standards.md).

## Architecture

### Data Model

The platform uses a robust data model with:

- User management with role-based access control
- Company hierarchy support
- Permission-based authorization
- Secure ID strategy (CUID for business entities, auto-increment for reference data)

For detailed information, see [Data Model](docs/technical/data-model.md) and [ID Strategy](docs/ID_STRATEGY.md).

### Testing Strategy

- Dedicated test database
- Automated test setup and teardown
- Comprehensive model testing
- Relationship validation
- Constraint enforcement

For detailed information, see [Testing Documentation](docs/technical/testing.md).

## Contributing

Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

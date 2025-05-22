# Development Tools and Configuration

This document outlines the development tools and configurations used in the Lillinker platform.

## Package Management

We use pnpm as our package manager. The project includes:

- `package.json`: Main package configuration
- `pnpm-lock.yaml`: Lock file for deterministic installations

## Development Scripts

All development scripts are defined in `package.json`:

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm type-check   # Run TypeScript checks
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate test coverage
```

## TypeScript Configuration

- Configuration: `tsconfig.json`
- Features:
  - Strict type checking
  - Path aliases (@/\*)
  - Modern TypeScript features
  - Next.js integration

## ESLint Configuration

- Configuration: `.eslintrc.json`
- Plugins:
  - TypeScript
  - React
  - React Hooks
  - Import
  - JSX A11y
- Rules:
  - TypeScript best practices
  - React best practices
  - Accessibility guidelines
  - Import order
  - Code formatting

## Prettier Configuration

- Configuration: `.prettierrc`
- Plugins:
  - prettier-plugin-tailwindcss
- Settings:
  - Single quotes
  - 2-space indentation
  - 100-character line length
  - Trailing commas

## Tailwind CSS

- Configuration: `tailwind.config.ts`
- Features:
  - Dark mode support
  - Custom color system
  - Animation utilities
  - Container queries
- Plugins:
  - tailwindcss-animate

## Testing Setup

- Framework: Jest
- Configuration: `jest.setup.ts`
- Features:
  - JSDOM environment
  - React Testing Library
  - Mock configurations
  - Coverage reporting

## Git Workflow

- Husky for Git hooks
- Commitlint for conventional commits
- Protected branches (main, develop)
- Feature branch workflow

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. Setup:

   - Node.js 20
   - pnpm 8

2. Quality Checks:
   - TypeScript validation
   - ESLint checks
   - Prettier formatting
   - Jest tests
   - Build verification

## Development Environment

- Node.js 20.x
- pnpm 8.x
- Modern IDE with TypeScript support
- Git for version control

## Best Practices

1. Code Quality:

   - Follow TypeScript best practices
   - Use ESLint and Prettier
   - Write tests for new features
   - Keep dependencies updated

2. Git Workflow:

   - Use conventional commits
   - Create feature branches
   - Review code before merging
   - Keep commits atomic

3. Development:
   - Run all checks before committing
   - Test locally before pushing
   - Document new features
   - Follow accessibility guidelines

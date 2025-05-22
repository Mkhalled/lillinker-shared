# Project Setup

This document outlines the setup process for the Lillinker platform development environment.

## Prerequisites

- Node.js 20.x
- pnpm 8.x
- Git
- A modern IDE with TypeScript support (recommended: VS Code)

## Installation Steps

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

4. Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:3000 (or the next available port).

## Project Structure

```
lillinker-shared/
├── .github/               # GitHub Actions workflows
├── docs/                  # Project documentation
│   ├── technical/        # Technical documentation
│   ├── project/          # Project-specific docs
│   ├── business/         # Business documentation
│   └── sprints/          # Sprint planning and tracking
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/                  # Source code
│   ├── app/             # Next.js app directory
│   ├── components/      # Reusable UI components
│   ├── lib/             # Shared utilities
│   └── types/           # TypeScript type definitions
├── .eslintrc.json       # ESLint configuration
├── .prettierrc          # Prettier configuration
├── commitlint.config.js # Commit message rules
├── jest.setup.ts        # Jest configuration
├── next.config.mjs      # Next.js configuration
├── package.json         # Project dependencies
├── postcss.config.mjs   # PostCSS configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Development Tools

### Package Management

- **pnpm**: Fast, disk space efficient package manager
- **Lock File**: `pnpm-lock.yaml` for deterministic installations

### Code Quality

- **TypeScript**: Static type checking
- **ESLint**: Code linting with import order rules
  - Built-in modules first
  - External packages second
  - Internal aliases third
  - Parent imports fourth
  - Sibling imports fifth
  - Index imports last
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

### Styling

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **Radix UI**: Unstyled, accessible components

## Development Scripts

All scripts are defined in `package.json`:

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

## IDE Setup

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- GitLens
- Error Lens

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Environment Variables

Required environment variables are defined in `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/lillinker"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Other
NODE_ENV="development"
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**

   - Run `pnpm type-check` to identify issues
   - Check `tsconfig.json` for configuration

2. **ESLint/Prettier Conflicts**

   - Ensure VS Code extensions are installed
   - Check `.eslintrc.json` and `.prettierrc`

3. **Dependency Issues**

   - Delete `node_modules` and `pnpm-lock.yaml`
   - Run `pnpm install`

4. **Build Errors**
   - Check TypeScript and ESLint output
   - Verify environment variables

### Getting Help

- Check the [technical documentation](technical/)
- Review [GitHub Issues](https://github.com/Mkhalled/lillinker-shared/issues)
- Contact the development team

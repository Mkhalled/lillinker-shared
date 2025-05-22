# Code Quality Setup

This document provides detailed information about the code quality tools and configurations used in the project.

## Table of Contents

- [ESLint Configuration](#eslint-configuration)
- [Prettier Configuration](#prettier-configuration)
- [Git Hooks](#git-hooks)
- [Commit Message Convention](#commit-message-convention)

## ESLint Configuration

The project uses ESLint with the following configuration:

### Key Features

- TypeScript support
- React and React Hooks rules
- Accessibility (a11y) rules
- Import order enforcement
- Prettier integration

### Configuration File

The ESLint configuration is defined in `.eslintrc.json`. Key rules include:

- Disabled prop-types checking (using TypeScript instead)
- Allowed unused variables that start with underscore
- Enforced import order
- React and accessibility best practices

## Prettier Configuration

Prettier is used for code formatting with the following settings:

### Key Settings

- Single quotes
- 2-space indentation
- 100-character line length
- No trailing commas in function parameters
- Unix-style line endings

### Configuration File

The Prettier configuration is defined in `.prettierrc`.

## Git Hooks

The project uses Husky and commitlint to enforce commit message conventions.

### Setup

1. Husky is installed as a dev dependency
2. Git hooks are automatically installed via the `prepare` script in `package.json`
3. The commit-msg hook runs commitlint to validate commit messages

### Configuration

- Husky configuration is in the `.husky` directory
- Commitlint rules are defined in `commitlint.config.js`

## Commit Message Convention

### Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI configuration changes
- `perf`: Performance improvements
- `revert`: Reverting changes

### Rules

- Maximum line length: 100 characters
- Scope must be in lower-case
- Subject must not be empty
- Type must be one of the allowed types
- No period at the end of the subject

### Examples

```
feat(auth): add user authentication
fix(api): resolve login form validation
docs: update README with installation instructions
style: format code according to prettier
refactor: improve error handling in API routes
```

## Best Practices

1. Always run `pnpm lint` before committing
2. Use meaningful commit messages
3. Keep commits focused and atomic
4. Reference issues in commit messages when applicable
5. Write clear and concise commit subjects

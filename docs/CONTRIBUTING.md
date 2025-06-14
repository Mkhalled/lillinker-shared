# Contributing to Lillinker

Thank you for your interest in contributing to Lillinker! This document provides guidelines and instructions for contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Requests](#pull-requests)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the Repository**

   - Click the "Fork" button on the GitHub repository page
   - Clone your forked repository:
     ```bash
     git clone https://github.com/your-username/lillinker-shared.git
     cd lillinker-shared
     ```

2. **Set Up Development Environment**

   - Install Node.js 20.x
   - Install pnpm 8.x
   - Install dependencies:
     ```bash
     pnpm install
     ```
   - Set up environment variables:
     ```bash
     cp .env.example .env
     ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Development Workflow

1. **Create a Branch**

   - Create a new branch from `develop`:
     ```bash
     git checkout -b feature/your-feature-name
     ```
   - Branch naming conventions:
     - `feature/` - New features
     - `bugfix/` - Bug fixes
     - `hotfix/` - Urgent production fixes
     - `docs/` - Documentation updates

2. **Make Changes**

   - Follow our [development standards](docs/technical/development-standards.md)
   - Write tests for new features
   - Update documentation as needed

3. **Commit Changes**

   - Follow conventional commits format:

     ```
     <type>(<scope>): <description>

     [optional body]

     [optional footer]
     ```

   - Types:
     - `feat`: New feature
     - `fix`: Bug fix
     - `docs`: Documentation changes
     - `style`: Code style changes
     - `refactor`: Code refactoring
     - `test`: Test-related changes
     - `chore`: Maintenance tasks

4. **Push Changes**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- Follow our [TypeScript guidelines](docs/technical/development-standards.md#typescript)
- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Write clear and concise comments

## Testing

- Write unit tests for new features
- Ensure all tests pass:
  ```bash
  pnpm test
  ```
- Maintain or improve test coverage
- Test your changes in different environments

## Documentation

- Update relevant documentation
- Add JSDoc comments for new functions
- Update API documentation if needed
- Keep the README up to date

## Pull Requests

1. **Create Pull Request**

   - Open a pull request from your branch to `develop`
   - Use the PR template
   - Link related issues
   - Provide a clear description

2. **PR Checklist**

   - [ ] Code follows style guidelines
   - [ ] Tests are written and passing
   - [ ] Documentation is updated
   - [ ] Changes are tested in different environments
   - [ ] All CI checks are passing

3. **Review Process**
   - Address review comments
   - Keep PR up to date with develop
   - Squash commits if requested

## Release Process

1. **Version Bumping**

   - Follow semantic versioning
   - Update version in package.json
   - Update CHANGELOG.md

2. **Release Checklist**

   - [ ] All tests are passing
   - [ ] Documentation is updated
   - [ ] Version is bumped
   - [ ] CHANGELOG is updated
   - [ ] Release notes are prepared

3. **Deployment**
   - Create release tag
   - Deploy to staging
   - Verify in staging
   - Deploy to production

## Getting Help

- Check our [technical documentation](docs/technical/)
- Open an issue on GitHub
- Join our community chat
- Contact the maintainers

## Acknowledgments

Thank you for contributing to Lillinker! Your contributions help make this project better for everyone.

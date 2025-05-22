# Git Workflow

This document outlines the Git workflow strategy for the Lillinker project.

## Branch Strategy

### Protected Branches

1. **main**

   - Production-ready code
   - Protected branch (no direct pushes)
   - Only merged via pull requests
   - Tagged with version numbers

2. **develop**
   - Integration branch for features
   - Protected branch (no direct pushes)
   - Merged into main for releases
   - Always deployable

### Feature Branches

1. **Feature Development**

   - Branch from: `develop`
   - Naming: `feat/description`
   - Example: `feat/user-authentication`
   - Merge back to: `develop`

2. **Hotfixes**

   - Branch from: `main`
   - Naming: `hotfix/description`
   - Example: `hotfix/login-bug`
   - Merge back to: `main` and `develop`

3. **Release Preparation**
   - Branch from: `develop`
   - Naming: `release/vX.Y.Z`
   - Example: `release/v1.0.0`
   - Merge back to: `main` and `develop`

## Pull Request Process

1. **Creating a PR**

   - Target the appropriate branch
   - Follow PR template
   - Link related issues
   - Add reviewers

2. **PR Requirements**

   - All tests pass
   - Code review approval
   - No merge conflicts
   - Follows coding standards
   - Documentation updated

3. **Review Process**
   - At least one approval required
   - Address review comments
   - Keep PR focused and small
   - Update branch if develop changes

## Versioning

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

### Release Process

1. Create release branch
2. Update version numbers
3. Update CHANGELOG.md
4. Create pull request
5. Merge to main
6. Create Git tag
7. Merge to develop

## Commit Message Convention

Follow conventional commits:

```
type(scope): description

body

footer
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

## Best Practices

1. **Branch Management**

   - Keep branches up to date
   - Delete merged branches
   - Use descriptive names
   - Keep branches focused

2. **Commit Hygiene**

   - Atomic commits
   - Meaningful messages
   - No large commits
   - Follow conventions

3. **Code Review**

   - Be constructive
   - Review promptly
   - Explain decisions
   - Consider security

4. **Documentation**
   - Update README
   - Document breaking changes
   - Keep CHANGELOG current
   - Comment complex code

## CI/CD Integration

The Git workflow integrates with our CI/CD pipeline:

1. **On Push/PR**

   - TypeScript checks
   - ESLint
   - Prettier
   - Tests
   - Build

2. **On Merge to Main**
   - All checks
   - Version tagging
   - Documentation generation
   - (Future) Deployment

## Tools and Automation

1. **Husky**

   - Pre-commit hooks
   - Commit message validation

2. **GitHub Actions**

   - Automated checks
   - Build pipeline
   - (Future) Deployment

3. **Version Management**
   - Semantic versioning
   - Automated tagging
   - Release notes

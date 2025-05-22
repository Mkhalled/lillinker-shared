# Development Workflow

This document provides a comprehensive guide to our development workflow, including Git Flow, pull request process, and branch protection rules.

## Table of Contents

- [Git Flow](#git-flow)
- [Branch Protection Rules](#branch-protection-rules)
- [Pull Request Process](#pull-request-process)
- [Development Setup](#development-setup)
- [Best Practices](#best-practices)

## Git Flow

### Branch Structure

```
main (production)
  ↑
release/* (release preparation)
  ↑
develop (integration)
  ↑
feature/* (feature development)
```

### Branch Types

1. **Main Branch**

   - Production-ready code
   - Protected branch (no direct pushes)
   - Only merged via pull requests
   - Tagged with version numbers

2. **Develop Branch**

   - Integration branch for features
   - Protected branch (no direct pushes)
   - Merged into main for releases
   - Always deployable

3. **Feature Branches**

   - Branch from: `develop`
   - Naming: `feat/description`
   - Example: `feat/user-authentication`
   - Merge back to: `develop`

4. **Hotfix Branches**

   - Branch from: `main`
   - Naming: `hotfix/description`
   - Example: `hotfix/login-bug`
   - Merge back to: `main` and `develop`

5. **Release Branches**
   - Branch from: `develop`
   - Naming: `release/vX.Y.Z`
   - Example: `release/v1.0.0`
   - Merge back to: `main` and `develop`

## Branch Protection Rules

### Setup Instructions

1. **Access Branch Protection Settings**

   - Go to your GitHub repository
   - Click on "Settings"
   - Select "Branches" from the left sidebar
   - Under "Branch protection rules", click "Add rule"

2. **Configure Protection for Main Branch**

   - Branch name pattern: `main`
   - Enable the following protections:
     - ✓ Require a pull request before merging
     - ✓ Require approvals (set to 1)
     - ✓ Require status checks to pass before merging
     - ✓ Require branches to be up to date before merging
     - ✓ Include administrators
     - ✓ Allow force pushes: Disabled
     - ✓ Allow deletions: Disabled

3. **Configure Protection for Develop Branch**

   - Branch name pattern: `develop`
   - Enable the same protections as main branch
   - Adjust settings as needed for your team's workflow

4. **Required Status Checks**
   - Add the following required checks:
     - `quality-checks` (from CI workflow)
     - Any other relevant checks

### Protection Rules Summary

| Protection            | Main | Develop |
| --------------------- | ---- | ------- |
| Require PR            | ✓    | ✓       |
| Require Approvals     | ✓    | ✓       |
| Require Status Checks | ✓    | ✓       |
| Require Up-to-date    | ✓    | ✓       |
| Include Admins        | ✓    | ✓       |
| Allow Force Push      | ✗    | ✗       |
| Allow Deletions       | ✗    | ✗       |

## Pull Request Process

### Creating a Pull Request

1. **Branch Creation**

   ```bash
   # Create and switch to a new feature branch
   git checkout -b feat/feature-name
   ```

2. **Development**

   - Make your changes
   - Commit following conventional commits
   - Push your branch
   - Create PR targeting `develop` or `main`

3. **PR Requirements**
   - Follow PR template
   - Link related issues
   - Add reviewers
   - Ensure all checks pass
   - Address review comments

### Review Process

1. **Reviewer Responsibilities**

   - Check code quality
   - Verify tests
   - Ensure documentation
   - Consider security implications

2. **Author Responsibilities**
   - Respond to comments
   - Update branch if needed
   - Keep PR focused
   - Update documentation

## Development Setup

### Local Environment

1. **Initial Setup**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd <repository-name>

   # Install dependencies
   pnpm install

   # Setup git hooks
   pnpm prepare
   ```

2. **Starting Development**

   ```bash
   # Create feature branch
   git checkout develop
   git pull
   git checkout -b feat/feature-name

   # Start development server
   pnpm dev
   ```

### Git Configuration

1. **Global Git Configuration**

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **Repository-specific Configuration**
   ```bash
   git config --local core.editor "code --wait"
   ```

## Best Practices

### Code Quality

- Follow ESLint and Prettier rules
- Write meaningful commit messages
- Keep PRs focused and small
- Document complex logic

### Git Hygiene

- Keep branches up to date
- Delete merged branches
- Use meaningful branch names
- Make atomic commits

### Documentation

- Update README when needed
- Document breaking changes
- Keep CHANGELOG current
- Comment complex code

### Security

- Never commit secrets
- Review dependencies
- Follow security guidelines
- Report vulnerabilities

## Troubleshooting

### Common Issues

1. **Branch Protection Issues**

   - Ensure all checks pass
   - Get required approvals
   - Update branch if needed

2. **Merge Conflicts**

   - Update branch
   - Resolve conflicts
   - Test changes
   - Get re-approval if needed

3. **CI/CD Failures**
   - Check logs
   - Fix issues locally
   - Push fixes
   - Wait for checks

### Getting Help

- Check documentation
- Ask team members
- Review GitHub issues
- Contact maintainers

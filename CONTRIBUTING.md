# Contributing to Campus Night Market

Thank you for your interest in contributing to Campus Night Market! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Conventions](#commit-message-conventions)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Standards

- **Be respectful**: Treat all contributors with respect and professionalism
- **Be inclusive**: Welcome diverse perspectives and experiences
- **Be collaborative**: Work together constructively
- **Be patient**: Remember that everyone has different skill levels and backgrounds

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Firebase CLI**: `npm install -g firebase-tools`
- **Vercel CLI**: `npm install -g vercel` (optional)
- **Git**: Latest stable version

### Initial Setup

1. **Fork the Repository**

   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/campus-nightmarket.git
   cd campus-nightmarket
   ```

2. **Install Dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install functions dependencies
   npm --prefix functions install
   ```

3. **Set Up Environment Variables**

   ```bash
   # Copy example env file (if provided)
   cp .env.example .env

   # Add your Firebase config values to .env
   # Contact maintainers for development credentials if needed
   ```

4. **Run Development Server**

   ```bash
   # Start frontend dev server
   npm run dev

   # In another terminal, start Firebase emulators (optional)
   firebase emulators:start
   ```

5. **Verify Setup**
   - Frontend should be running at `http://localhost:5173`
   - Firebase emulators at `http://localhost:4000` (if started)

---

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features (if exists)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `docs/*`: Documentation updates

### Creating a Branch

```bash
# Create and checkout a new feature branch
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/update-readme
```

### Making Changes

1. **Make your changes** in the appropriate files
2. **Test locally** (see Testing Requirements below)
3. **Lint your code**:

   ```bash
   npm run lint
   ```

4. **Fix linting issues**:

   ```bash
   npm run lint:fix
   ```

5. **Build to verify**:

   ```bash
   npm run build
   npm --prefix functions run build
   ```

---

## Code Style Guidelines

### TypeScript

- **Prefer TypeScript**: All new code should be TypeScript (`.ts`, `.tsx`)
- **Type Safety**: Avoid `any` types; use proper type definitions
- **Interfaces over Types**: Prefer `interface` for object shapes
- **Explicit Return Types**: Always specify return types for functions

**Example**:

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: 'buyer' | 'seller';
}

function getUser(userId: string): Promise<User> {
  // ...
}

// Avoid
function getUser(userId: any) {
  // No return type, any parameter
}
```

### React Components

- **Functional Components**: Use function components with hooks
- **Named Exports**: Prefer named exports over default exports (except for pages)
- **Props Interface**: Always define props interface

**Example**:

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{label}</button>;
}
```

### File Naming

- **Components**: PascalCase (e.g., `ListingCard.tsx`)
- **Utilities/Services**: camelCase (e.g., `authService.ts`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Types**: camelCase (e.g., `index.ts` in `types/` folder)

### Imports Order

1. React/external libraries
2. Internal utilities/services
3. Components
4. Types
5. Styles

**Example**:

```typescript
import { useState, useEffect } from 'react';
import { collection, query, where } from 'firebase/firestore';

import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';

import { ListingCard } from '@/components/ListingCard';

import type { Listing } from '@/types';

import './styles.css';
```

### Code Formatting

- **Prettier**: Code is auto-formatted with Prettier
- **Line Length**: Max 100 characters (enforced by Prettier)
- **Indentation**: 2 spaces (not tabs)
- **Semicolons**: Required
- **Quotes**: Single quotes for strings (except JSX)

---

## Testing Requirements

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- useAuth.test.ts

# Run tests with coverage
npm test -- --coverage
```

### Test Guidelines

1. **Test Coverage**: Aim for >80% coverage on new code
2. **Unit Tests**: Required for:
   - Services (`services/`)
   - Hooks (`hooks/`)
   - Utilities (`utils/`)
3. **Component Tests**: Recommended for:
   - Reusable components (`components/`)
   - Complex UI logic
4. **Integration Tests**: For critical flows (login, checkout, etc.)

### Writing Tests

**Services/Utilities**:

```typescript
import { validateEmail } from './validation';

describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

**React Hooks**:

```typescript
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return user when authenticated', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeDefined();
  });
});
```

**Components**:

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('should render with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**: `npm test`
2. **Ensure linting passes**: `npm run lint`
3. **Build succeeds**: `npm run build`
4. **Update documentation**: If you changed APIs or added features
5. **Add tests**: For new features or bug fixes
6. **Rebase on main**: Keep your branch up to date

   ```bash
   git fetch origin
   git rebase origin/main
   ```

### Creating a Pull Request

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**:
   - Use a clear, descriptive title
   - Fill out the PR template (if provided)
   - Link related issues (e.g., "Fixes #123")

3. **PR Description Should Include**:
   - **What**: What does this PR do?
   - **Why**: Why is this change needed?
   - **How**: How does it work?
   - **Testing**: How did you test this?
   - **Screenshots**: If UI changes, include before/after screenshots

**Example PR Description**:

```markdown
## What

Adds keyboard navigation to the listing cards component.

## Why

Improves accessibility for keyboard-only users (Fixes #45).

## How

- Added `tabIndex` to card elements
- Added `onKeyDown` handler for Enter/Space keys
- Added focus styling with Tailwind ring utilities

## Testing

- Manually tested Tab navigation through cards
- Verified Enter/Space triggers card click
- Tested with screen reader (NVDA)

## Screenshots

[Before/After screenshots]
```

### Review Process

1. **Automated Checks**: Wait for CI to pass (linting, tests, build)
2. **Code Review**: Maintainers will review your code
3. **Address Feedback**: Make requested changes and push updates
4. **Approval**: Once approved, your PR will be merged

### PR Guidelines

- **Keep PRs small**: Aim for <500 lines changed
- **One feature per PR**: Don't mix unrelated changes
- **Descriptive commits**: Follow commit message conventions (see below)
- **Respond to feedback**: Address review comments promptly

---

## Commit Message Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

### Format

```text
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring (no feature/bug change)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling

### Examples

```bash
# Feature
git commit -m "feat(listings): add filtering by location"

# Bug fix
git commit -m "fix(auth): resolve login rate limiting issue"

# Documentation
git commit -m "docs(readme): update setup instructions"

# With body
git commit -m "feat(checkout): add order confirmation email

- Send email via SendGrid after order placement
- Include order details and seller contact info
- Add email template with campus branding

Closes #123"
```

### Scope

- `auth`: Authentication
- `listings`: Listing management
- `orders`: Order processing
- `checkout`: Checkout flow
- `dashboard`: Seller/buyer dashboards
- `ui`: UI components
- `api`: Cloud Functions
- `db`: Firestore/database
- `config`: Configuration files

---

## Issue Reporting

### Bug Reports

When reporting bugs, include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**:
   - Step 1
   - Step 2
   - Expected result
   - Actual result
3. **Environment**:
   - Browser/version
   - OS
   - Device (mobile/desktop)
4. **Screenshots**: If applicable
5. **Console Errors**: Browser console logs

**Example**:

```markdown
**Description**
Login fails with "Invalid credentials" even with correct password.

**Steps to Reproduce**

1. Navigate to /login
2. Enter email: test@example.com
3. Enter password: Test123!
4. Click "Login"
5. See error message

**Expected Result**
User should be logged in and redirected to dashboard.

**Actual Result**
Error message: "Invalid credentials. Please try again."

**Environment**

- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop

**Console Errors**
`FirebaseError: auth/invalid-credential`
```

### Feature Requests

When requesting features, include:

1. **Problem**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions you considered
4. **Additional Context**: Screenshots, mockups, examples

---

## Additional Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Documentation](./functions/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)

---

## Questions?

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: Contact maintainers at [your-email@example.com]

---

Thank you for contributing to Campus Night Market! 🎉

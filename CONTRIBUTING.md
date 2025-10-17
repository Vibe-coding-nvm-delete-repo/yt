# Contributing to YouTube Tools

Thank you for your interest in contributing to YouTube Tools! This guide will help you get started.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: Latest stable version

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/yt.git
cd yt
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/Vibe-coding-nvm-delete-repo/yt.git
```

### Install Dependencies

```bash
npm install
```

This will install all dependencies and set up Husky pre-commit hooks.

### Verify Setup

```bash
npm run check:ci
```

All checks should pass before you start making changes.

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🔄 Development Workflow

### 1. Create a Feature Branch

**Never push directly to `main`!** Always create a new branch:

```bash
# Sync with upstream main
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/<description>` - New features
- `fix/<description>` - Bug fixes
- `docs/<description>` - Documentation updates
- `refactor/<description>` - Code refactoring

### 2. Make Your Changes

- Make small, focused commits
- Add tests for new functionality
- Update documentation as needed
- Follow the [Coding Standards](#coding-standards)

### 3. Test Your Changes

```bash
# Lint your code
npm run lint

# Type check
npm run typecheck

# Run tests
npm test -- --runInBand

# Full CI check
npm run check:ci
```

### 4. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add image batch processing feature"
```

Pre-commit hooks will automatically format your code and run linting.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

## 💅 Coding Standards

### TypeScript

- **Strict Mode**: TypeScript strict mode is enabled
- **No `any`**: Avoid using `any` type; use proper types or `unknown`
- **Type Exports**: Export types/interfaces from modules

Example:
```typescript
// ✅ Good
interface UserSettings {
  apiKey: string;
  selectedModels: string[];
}

export function updateSettings(settings: UserSettings): void {
  // Implementation
}

// ❌ Bad
export function updateSettings(settings: any) {
  // Implementation
}
```

### React/JSX

- **Functional Components**: Use functional components with hooks
- **Props Types**: Always type component props
- **Accessibility**: Ensure all interactive elements are accessible
  - Each page must have exactly one `<h1>`
  - All buttons/inputs must have proper labels

Example:
```typescript
interface MyComponentProps {
  title: string;
  onSubmit: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSubmit }) => {
  return (
    <div>
      <h1>{title}</h1>
      {/* Component content */}
    </div>
  );
};
```

### Code Style

- **ESLint**: Follow ESLint rules (run `npm run lint`)
- **Prettier**: Code is auto-formatted (run `npm run format`)
- **No Console Logs**: Avoid `console.log` in production code
- **Error Handling**: Use `console.warn`/`console.error` for error reporting

### Architecture

- **Component Boundaries**: UI components must NOT import server/DB logic
- **Domain Logic**: Keep business logic in `src/domain/*`
- **Utilities**: Shared utilities go in `src/lib/*`
- **No Circular Dependencies**: Avoid circular imports

## 🧪 Testing Guidelines

### Test Requirements

- **Coverage**: Maintain ≥60% test coverage
- **New Features**: Add tests for all new functionality
- **Bug Fixes**: Add tests to prevent regression

### Writing Tests

Use Jest and React Testing Library:

```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders with correct title', () => {
    render(<MyComponent title="Test Title" onSubmit={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## 📝 Pull Request Process

### Before Creating a PR

1. ✅ All tests pass (`npm test`)
2. ✅ Linting passes (`npm run lint`)
3. ✅ Type checking passes (`npm run typecheck`)
4. ✅ Build succeeds (`npm run build`)
5. ✅ Documentation updated (if needed)

### PR Title Format

Use Conventional Commits format:

```
feat: add batch image processing
fix: resolve race condition in model selection
docs: update API documentation
refactor: simplify cost calculation logic
test: add tests for error boundary
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass locally
- [ ] Manual testing performed

## Checklist
- [ ] Lint + typecheck pass locally
- [ ] Build passes locally
- [ ] Docs updated if needed
- [ ] No console.log or debug code
```

## 📏 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat: add support for batch image processing
fix: resolve race condition in model selection
docs: update API documentation for cost calculation
```

## 🚫 What NOT to Do

- ❌ Push directly to `main` branch
- ❌ Commit `.env` files or API keys
- ❌ Make changes to `.github/` or `scripts/` directories
- ❌ Add `console.log` statements in production code
- ❌ Submit PRs without tests
- ❌ Ignore ESLint or TypeScript errors

## 📚 Additional Resources

- [Engineering Standards](docs/ENGINEERING_STANDARDS.md) - Detailed development standards
- [Design System](docs/DESIGN_SYSTEM.md) - UI/UX guidelines
- [API Reference](docs/API_REFERENCE.md) - Technical documentation

## ❓ Questions?

- Check [GitHub Issues](https://github.com/Vibe-coding-nvm-delete-repo/yt/issues)
- Start a [GitHub Discussion](https://github.com/Vibe-coding-nvm-delete-repo/yt/discussions)
- Review project documentation in the `docs/` directory

---

Happy coding! 🚀

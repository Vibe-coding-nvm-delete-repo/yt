# 🛠️ Development Guide

Comprehensive guide for setting up and working with the development environment.

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Vibe-coding-nvm-delete-repo/yt.git
cd yt

# Run automated setup
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh
```

The setup script will:
- ✅ Verify prerequisites (Node.js 20+, Git)
- ✅ Install dependencies with verification
- ✅ Configure Git hooks (Husky)
- ✅ Set up VS Code workspace
- ✅ Create environment templates
- ✅ Run health checks

### Manual Setup

1. **Prerequisites**
   ```bash
   node --version  # Should be 20.0.0 or higher
   npm --version   # Should be 10.0.0 or higher
   git --version   # Any recent version
   ```

2. **Install Dependencies**
   ```bash
   npm ci
   npm run prepare  # Setup Git hooks
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Add your OpenRouter API key
   ```

## 🏃‍♂️ Development Workflow

### Daily Development

```bash
# Start development server with hot reload
npm run dev

# Development with debugging
npm run dev:debug

# Clean development (clears cache)
npm run dev:clean
```

### Code Quality

```bash
# Fix linting and formatting issues
npm run lint:fix
npm run format

# Run comprehensive checks (what CI runs)
npm run check:ci

# Pre-commit checks (runs automatically)
npm run check:pre-commit
```

### Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

### Performance Analysis

```bash
# Bundle analysis
npm run bundle:analyze

# Check bundle size limits
npm run bundle:size

# Lighthouse performance audit
npm run perf:lighthouse

# Profiling build
npm run perf:profile
```

### Security & Dependencies

```bash
# Security audit
npm run security:audit

# Check outdated dependencies
npm run deps:check

# Update dependencies
npm run deps:update
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components
│   └── settings/       # Settings-specific components
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
├── styles/             # Global styles and Tailwind config
└── pages/              # Next.js pages (if using pages router)

scripts/                # Development and build scripts
.github/                # GitHub Actions workflows
.husky/                 # Git hooks
docs/                   # Documentation
reports/                # Generated reports (coverage, lint, etc.)
```

## 🔧 Development Tools

### Pre-commit Hooks

Automatically runs on every commit:
- ✅ Architecture compliance
- ✅ TypeScript type checking
- ✅ Security audit (high/critical only)
- ✅ ESLint + Prettier via lint-staged
- ✅ Type contract validation
- ✅ Bundle size checking
- ✅ Git hooks integrity validation

### VS Code Configuration

Optimal settings are automatically configured:
- Format on save with Prettier
- ESLint auto-fix on save
- TypeScript strict mode
- Tailwind CSS IntelliSense
- Recommended extensions

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit (hooks will run)
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/your-feature-name
```

## 🐛 Debugging

### Development Server

```bash
# Debug Next.js with Chrome DevTools
npm run dev:debug
# Open chrome://inspect and click "Open dedicated DevTools for Node"
```

### Tests

```bash
# Debug tests with Chrome DevTools
npm run test:debug
```

### Performance

```bash
# Generate performance profile
npm run build:profile

# Analyze bundle composition
npm run bundle:analyze

# Monitor health endpoint
npm run health:monitor
```

## 📊 Quality Metrics

### Code Quality Gates

- **ESLint**: Zero errors, warnings allowed but discouraged
- **TypeScript**: Strict mode, no type errors
- **Test Coverage**: Maintain current coverage levels
- **Bundle Size**: 
  - Client JS: < 500KB
  - CSS: < 50KB
- **Performance**: 
  - Page load: < 3 seconds
  - Lighthouse score: > 90

### CI/CD Pipeline

1. **Pre-commit**: Local quality checks
2. **CI Pipeline**: Full test suite, type checking, linting
3. **Architecture Guard**: Dependency and structure validation
4. **Deployment Health**: Post-deploy verification
5. **Security Scanning**: Dependency vulnerabilities

## 🚑 Troubleshooting

### Common Issues

#### "Module not found" errors
```bash
# Clear cache and reinstall
npm run clean:all
npm install
```

#### Git hooks not working
```bash
# Reinstall hooks
npm run prepare
chmod +x .husky/pre-commit .husky/commit-msg
```

#### TypeScript errors after dependency update
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
npm run typecheck
```

#### Slow development server
```bash
# Clear Next.js cache
rm -rf .next
npm run dev:clean
```

#### Bundle size exceeded
```bash
# Analyze what's causing the increase
npm run bundle:analyze

# Check specific size limits
npm run bundle:size
```

### Environment Issues

#### Missing environment variables
```bash
# Check current environment
npm run env:check

# Ensure .env.local exists with required variables
cat .env.local
```

#### Port conflicts
```bash
# Use different port
PORT=3001 npm run dev
```

### Performance Issues

#### Slow builds
```bash
# Use development shortcuts
source ./dev-shortcuts.sh

# Profile the build
npm run build:profile
```

## 🎯 Best Practices

### Code Organization

- Use TypeScript for all new code
- Follow component co-location (component + test + styles in same directory)
- Prefer composition over inheritance
- Use custom hooks for complex logic
- Keep components small and focused

### Performance

- Use Next.js Image component for all images
- Implement proper loading states
- Lazy load non-critical components
- Monitor bundle size with each PR
- Use proper memoization (React.memo, useMemo, useCallback)

### Testing

- Write tests for all business logic
- Use Testing Library best practices
- Mock external dependencies
- Test user interactions, not implementation details
- Maintain test coverage levels

### Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Keep dependencies updated
- Run security audits regularly

## 🔗 Useful Scripts

### Development Shortcuts

```bash
# Source the shortcuts file for aliases
source ./dev-shortcuts.sh

# Now you can use:
dev          # npm run dev
build        # npm run build
test         # npm test
lint         # npm run lint:fix
check        # npm run check:ci
```

### Release Management

```bash
# Patch version (bug fixes)
npm run release:patch

# Minor version (new features)
npm run release:minor

# Major version (breaking changes)
npm run release:major
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

## 🆘 Getting Help

1. **Check the troubleshooting section above**
2. **Run the health checks**: `npm run check:ci`
3. **Check GitHub Issues** for known problems
4. **Ask in team chat** with relevant error messages
5. **Create a new issue** if none of the above help

---

**Happy coding!** 🎉

> This guide is automatically updated with each tooling improvement. Last updated: $(date)
#!/bin/bash
# Development Environment Setup Script
# Automates the complete development environment setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${BLUE}🚀 $1${NC}\n"
}

# Version checks
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    # Check Node.js version
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_NODE="20.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
            log_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_NODE+"
            exit 1
        fi
        log_success "Node.js version $NODE_VERSION ✓"
    else
        log_error "Node.js is not installed. Please install Node.js 20+ first."
        exit 1
    fi
    
    # Check npm version
    if command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        log_success "npm version $NPM_VERSION ✓"
    else
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Git
    if command -v git >/dev/null 2>&1; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        log_success "Git version $GIT_VERSION ✓"
    else
        log_error "Git is not installed"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    log_header "Installing Dependencies"
    
    # Clean install
    log_info "Cleaning previous installations..."
    rm -rf node_modules package-lock.json .next
    
    log_info "Installing npm dependencies..."
    npm ci
    
    # Verify critical packages
    log_info "Verifying critical packages..."
    CRITICAL_PACKAGES=("next" "react" "typescript" "eslint" "husky")
    for package in "${CRITICAL_PACKAGES[@]}"; do
        if npm list "$package" >/dev/null 2>&1; then
            log_success "$package installed ✓"
        else
            log_error "$package is missing"
            exit 1
        fi
    done
}

# Setup Git hooks
setup_git_hooks() {
    log_header "Setting up Git Hooks"
    
    # Install Husky hooks
    log_info "Installing Husky git hooks..."
    npm run prepare
    
    # Verify hooks are executable
    HOOK_FILES=(".husky/pre-commit" ".husky/commit-msg")
    for hook in "${HOOK_FILES[@]}"; do
        if [ -f "$hook" ] && [ -x "$hook" ]; then
            log_success "$hook is executable ✓"
        else
            log_warning "Making $hook executable..."
            chmod +x "$hook"
        fi
    done
}

# Setup development tools
setup_dev_tools() {
    log_header "Setting up Development Tools"
    
    # Create .env.local if it doesn't exist
    if [ ! -f ".env.local" ]; then
        log_info "Creating .env.local template..."
        cat > .env.local << EOF
# Local Development Environment Variables
# Copy this file to .env.local and add your actual values

# OpenRouter API Key (required for AI features)
OPENROUTER_API_KEY=your_api_key_here

# Development flags
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_DEBUG=true

# Optional: Custom API endpoints
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EOF
        log_success "Created .env.local template"
    else
        log_success ".env.local already exists ✓"
    fi
    
    # Setup VS Code configuration
    if [ ! -d ".vscode" ]; then
        log_info "Creating VS Code workspace configuration..."
        mkdir -p .vscode
        
        # Settings
        cat > .vscode/settings.json << EOF
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
EOF
        
        # Recommended extensions
        cat > .vscode/extensions.json << EOF
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
EOF
        
        log_success "VS Code workspace configured ✓"
    else
        log_success "VS Code configuration exists ✓"
    fi
}

# Run health checks
run_health_checks() {
    log_header "Running Health Checks"
    
    # TypeScript compilation
    log_info "Checking TypeScript compilation..."
    if npm run typecheck; then
        log_success "TypeScript compilation ✓"
    else
        log_error "TypeScript compilation failed"
        exit 1
    fi
    
    # Linting
    log_info "Running ESLint checks..."
    if npm run lint; then
        log_success "ESLint checks ✓"
    else
        log_warning "ESLint found issues (will be fixed on commit)"
    fi
    
    # Test suite
    log_info "Running test suite..."
    if npm test -- --passWithNoTests; then
        log_success "Test suite ✓"
    else
        log_warning "Some tests are failing"
    fi
    
    # Security audit
    log_info "Running security audit..."
    if npm audit --audit-level=moderate; then
        log_success "Security audit ✓"
    else
        log_warning "Security vulnerabilities detected (run 'npm audit fix')"
    fi
}

# Performance optimization
optimize_development() {
    log_header "Optimizing Development Environment"
    
    # Setup Next.js build cache
    log_info "Setting up build cache..."
    mkdir -p .next/cache
    
    # Create development scripts
    log_info "Creating development shortcuts..."
    cat > dev-shortcuts.sh << 'EOF'
#!/bin/bash
# Development Shortcuts

# Quick commands
alias dev="npm run dev"
alias build="npm run build"
alias test="npm test"
alias lint="npm run lint:fix"
alias check="npm run check:ci"

# Git shortcuts
alias gaa="git add -A"
alias gcm="git commit -m"
alias gps="git push"
alias gpl="git pull"

echo "Development shortcuts loaded ✅"
echo "Available commands: dev, build, test, lint, check, gaa, gcm, gps, gpl"
EOF
    
    chmod +x dev-shortcuts.sh
    log_success "Development shortcuts created (source ./dev-shortcuts.sh)"
}

# Main execution
main() {
    log_header "🛠️  Development Environment Setup"
    echo "This script will set up your development environment for optimal productivity."
    echo ""
    
    check_prerequisites
    install_dependencies
    setup_git_hooks
    setup_dev_tools
    run_health_checks
    optimize_development
    
    log_header "🎉 Setup Complete!"
    echo ""
    log_success "Your development environment is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Add your OpenRouter API key to .env.local"
    echo "  2. Run 'npm run dev' to start the development server"
    echo "  3. Source './dev-shortcuts.sh' for helpful aliases"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
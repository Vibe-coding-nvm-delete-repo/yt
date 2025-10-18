# YouTube Tools - AI-Powered Content Creation

A Next.js 15 application that provides AI-powered tools for YouTube content creators, including image-to-prompt generation, structured prompt creation, and batch processing capabilities using OpenRouter API.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## ✨ Features

### 🖼️ Image to Prompt

- Upload images and generate descriptive prompts using AI vision models
- Multi-model comparison: test up to 3 vision models simultaneously
- Real-time cost tracking for each generation
- Save and rate generated prompts
- Batch processing support for multiple images

### 📝 Prompt Creator

- Build structured prompts with customizable fields
- Generate and score prompts in batches (1, 3, 5, or 10 at a time)
- Automatic rating and ranking based on configurable rubrics
- Persistent history with favorites
- Draft auto-save to localStorage

### 📊 Usage & Cost Tracking

- Comprehensive usage history with filtering
- Per-model and per-session cost breakdown
- Export capabilities for analysis
- Date range filtering

### 📚 Best Practices Library

- Curated collection of prompt engineering patterns
- Categorized by use case (photography, YouTube thumbnails, engagement)
- Custom best practices with importance ratings

### ⚙️ Settings Management

- Secure API key storage (OpenRouter)
- Model selection and pinning
- Custom prompt templates
- Persistent configuration

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **OpenRouter API Key**: Get one at [openrouter.ai](https://openrouter.ai/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Vibe-coding-nvm-delete-repo/yt.git
cd yt
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-Time Setup

1. Navigate to **Settings** tab
2. Enter your OpenRouter API key
3. Select your preferred vision models (up to 3)
4. Customize the default prompt template (optional)
5. Start creating!

## 📖 Documentation

### User Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Features Guide](docs/FEATURES_GUIDE.md)** - Detailed feature documentation
- **[API Reference](docs/API_REFERENCE.md)** - Technical API documentation

### Developer Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Engineering Standards](docs/ENGINEERING_STANDARDS.md)** - Development standards
- **[Design System](docs/DESIGN_SYSTEM.md)** - UI/UX guidelines

### Project Management

- **[Issue Review Summary](ISSUE_REVIEW_SUMMARY.md)** - Current issue priorities and roadmap
- **[Issue Triage Analysis](ISSUE_TRIAGE_ANALYSIS.md)** - Detailed issue classification and planning
- **[Documentation Index](docs/README.md)** - Complete documentation catalog

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run typecheck        # Run TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm test                 # Run Jest tests
npm run type:contracts   # Run type contract tests

# Build & Deploy
npm run build            # Create production build
npm start                # Start production server

# CI Pipeline
npm run check:ci         # Run all checks (lint + typecheck + type:contracts + test)
```

## 🏗️ Project Structure

```
src/
├── app/               # Next.js app directory (pages, layouts, routes)
├── components/        # React components (UI layer only)
├── contexts/          # React contexts (Settings, Toast, Error)
├── domain/            # Domain logic (business rules, models)
├── hooks/             # Custom React hooks
├── lib/               # Shared utilities and helpers
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔑 API Integration

This application integrates with the [OpenRouter API](https://openrouter.ai/) to access multiple AI vision models:

- **Supported Models**: GPT-4 Vision, Claude 3, Gemini Pro Vision, and more
- **Cost Transparency**: Real-time cost tracking for all API calls
- **Model Selection**: Choose up to 3 models for parallel processing
- **Rate Limiting**: Automatic retry with exponential backoff

## 🧪 Testing

Tests are written using Jest and React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Current test coverage: **≥60%** across all modules

## 📦 Technologies

- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS 4, Radix UI components
- **Language**: TypeScript 5 with strict mode
- **State**: React Context API with localStorage persistence
- **Icons**: Lucide React
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Development setup
- Code style and standards
- Testing requirements
- Pull request process

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Support

For issues and questions:

- **GitHub Issues**: [Report a bug or request a feature](https://github.com/Vibe-coding-nvm-delete-repo/yt/issues)
- **Discussions**: [Join the conversation](https://github.com/Vibe-coding-nvm-delete-repo/yt/discussions)

---

Made with ❤️ by the YouTube Tools team

# Quick Start Guide

Get up and running with YouTube Tools in 5 minutes!

## Prerequisites

✅ **Node.js 20.x or higher** ([Download](https://nodejs.org/))  
✅ **npm 10.x or higher** (comes with Node.js)  
✅ **OpenRouter API Key** ([Get free key](https://openrouter.ai/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Vibe-coding-nvm-delete-repo/yt.git
cd yt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Initial Setup

### Configure Your API Key

1. Navigate to the **Settings** tab
2. Enter your OpenRouter API key
3. Wait for the green checkmark ✓

**Get an API key:** Visit [openrouter.ai](https://openrouter.ai/), sign up, and create a new key.

### Select Vision Models

1. In Settings, scroll to "Vision Models"
2. Click "Refresh Models"
3. Select up to 5 models:
   - **Budget**: `google/gemini-pro-vision`
   - **Balanced**: `anthropic/claude-3-haiku`
   - **Premium**: `anthropic/claude-3-opus`

## Your First Prompt

### Image to Prompt (Recommended)

1. Go to **Image to Prompt** tab
2. Upload or drag & drop an image
3. Click "Generate"
4. View the AI-generated prompt and cost

**Example:**
```
Upload: landscape.jpg
→ AI generates: "A breathtaking mountain vista at golden hour..."
```

## Development Commands

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Check code quality
npm run check:ci   # Run all checks
```

## Next Steps

- 📖 Read [Features Guide](./FEATURES_GUIDE.md) for detailed walkthroughs
- 🛠️ Explore [API Reference](./API_REFERENCE.md) for technical docs
- 🤝 Check [Contributing Guide](../CONTRIBUTING.md) to contribute

## Troubleshooting

**"Invalid API Key"**
- Verify key starts with "sk-"
- Check OpenRouter account has credits

**"No Models Available"**
- Click "Refresh Models" in Settings
- Check internet connection

**Slow Performance**
- Use fewer models (2-3 instead of 5)
- Close unnecessary browser tabs

## Quick Links

- [Full Documentation](../README.md)
- [GitHub Issues](https://github.com/Vibe-coding-nvm-delete-repo/yt/issues)
- [OpenRouter Docs](https://openrouter.ai/docs)

Happy prompting! 🚀

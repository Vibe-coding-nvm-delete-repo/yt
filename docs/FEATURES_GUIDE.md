# Features Guide

Comprehensive guide to all features in YouTube Tools.

## Table of Contents

- [Image to Prompt](#image-to-prompt)
- [Prompt Creator](#prompt-creator)
- [Best Practices Library](#best-practices-library)
- [Usage Tracking](#usage-tracking)
- [History Management](#history-management)
- [Settings](#settings)

---

## Image to Prompt

Upload images and generate descriptive prompts using AI vision models.

### Key Features

- **Multi-Model Comparison**: Test up to 5 vision models simultaneously
- **Real-Time Cost Tracking**: See cost per generation
- **Batch Processing**: Process multiple images at once
- **Rating System**: Rate prompt quality
- **History Integration**: Auto-save results

### How to Use

#### Basic Usage

1. Go to **Image to Prompt** tab
2. Upload image (click or drag & drop)
3. Select models in Settings (up to 5)
4. Click "Generate"
5. View results from all models

#### Batch Processing

1. Click "Batch" sub-tab
2. Upload multiple images
3. Assign models to each image
4. Click "Process All"
5. Monitor progress and costs

#### Custom Prompts

Customize the analysis prompt in **Settings** → **Prompt Template**:

```
Default: "Describe this image in detail and suggest a good
prompt for generating similar images."

Custom: "Analyze this {type} focusing on {aspect}.
Provide description for AI image generation."
```

### Supported Models

- **Claude 3 Opus/Sonnet** (Anthropic) - Best for detailed analysis
- **GPT-4 Vision/Turbo** (OpenAI) - Good for creative descriptions
- **Gemini Pro Vision** (Google) - Fast and cost-effective
- **LLaVA** (Open source) - Budget-friendly option

### Cost Calculation

```
Input: Image tokens (85-200) × Model input price
Output: Text tokens × Model output price
Total: Input + Output

Example:
Model: Claude 3 Opus
Input: 150 tokens × $0.000015 = $0.00225
Output: 100 tokens × $0.000075 = $0.00750
Total: $0.00975
```

### Tips

1. Use higher resolution for detailed descriptions
2. Claude 3 Opus excels at analysis
3. Use cheaper models for simple tasks
4. Batch similar images with same model
5. Check cost before processing large batches

---

## Prompt Creator

Build structured prompts with customizable fields and automatic scoring.

### Key Features

- **Field Builder**: Define custom fields (text, dropdown, multiselect, number, slider)
- **Tier System**: Mandatory, optional, and free-form fields
- **Batch Generation**: Generate 1, 3, 5, or 10 prompts
- **Auto-Scoring**: Rate prompts with configurable rubric
- **Draft Auto-Save**: Never lose your work
- **History**: Save and favorite best prompts

### Configuration

Access via **Settings** → **Prompt Creator**:

1. **Available Fields**: Define fields users can select
2. **Generation Instructions**: How AI creates prompts
3. **Rating Rubric**: Scoring criteria
4. **Model Selection**: Which model to use

### Field Types

```json
{
  "name": "style",
  "label": "Art Style",
  "type": "dropdown",
  "options": ["Realistic", "Anime", "Abstract"],
  "tier": "mandatory"
}
```

Types:

- `text` - Free text input
- `dropdown` - Single selection
- `multiselect` - Multiple selections
- `number` - Numeric input
- `slider` - Range slider

Tiers:

- `mandatory` - Required (red border if empty)
- `optional` - Recommended
- `free` - Additional customization

### Workflow

The Prompt Creator tab includes a helpful step-by-step guide at the top explaining:

1. How to configure fields in Settings
2. The role of the locked-in prompt (always prepended to selections)
3. How to fill mandatory and optional fields
4. How generation works (creates 3 prompts with automatic scoring)
5. How to review and save results

Basic workflow:

1. **Configure** fields in Settings
2. **Fill** fields in Prompt Creator tab
3. **Generate** 1-10 prompts
4. **Review** scores and results
5. **Save** favorites to history

### Example Configuration

YouTube Thumbnail:

```json
{
  "fields": [
    {
      "name": "emotion",
      "label": "Primary Emotion",
      "type": "dropdown",
      "options": ["Excited", "Shocked", "Happy"],
      "tier": "mandatory"
    },
    {
      "name": "elements",
      "label": "Visual Elements",
      "type": "multiselect",
      "options": ["Text overlay", "Arrows", "Face close-up"],
      "tier": "optional"
    }
  ],
  "instructions": "Generate a YouTube thumbnail prompt with {emotion} and {elements}",
  "rubric": "Rate: Visual Impact (1-10), Clarity (1-10), Clickability (1-10)"
}
```

---

## Best Practices Library

Curated collection of prompt engineering patterns.

### Categories

1. **Words/Phrases** - Effective vocabulary
2. **Photography** - Camera angles, lighting
3. **YouTube Engagement** - Engagement tactics
4. **YouTube Thumbnail** - Thumbnail design
5. **Our Unique Channel** - Custom patterns

### Practice Structure

Each practice includes:

- **Name**: Short title
- **Description**: Detailed explanation
- **Category**: Classification
- **Type**: Must Have, Recommended, Optional, Avoid
- **Importance**: 1-10 rating
- **Leonardo AI Language**: Prompt syntax
- **Images**: Reference images (optional)

### Usage

#### Browse Practices

1. Navigate to **Best Practices** tab
2. Filter by category
3. Sort by importance or date
4. Click card for details

#### Add Custom Practice

1. Click "+" button
2. Fill in form fields
3. Upload reference images
4. Save to library

#### Use in Prompts

1. Find relevant practice
2. Copy "Leonardo AI Language"
3. Paste into prompt
4. Adapt for your use case

### Example Practices

**Cinematic Lighting**

```
Category: photography
Type: must-have
Importance: 9/10

Leonardo AI: "cinematic lighting, dramatic composition,
professional color grading, film grain"

When to use: High-end, professional appearance
```

**Face Close-Up**

```
Category: youtube-thumbnail
Type: must-have
Importance: 10/10

Leonardo AI: "extreme close-up, exaggerated expression,
shocked face, wide eyes, dramatic lighting"

When to use: Reaction videos, emotional content
```

---

## Usage Tracking

Track API usage and costs.

### Features

- **Cost Summary**: Total spend
- **Date Filtering**: View specific periods
- **Model Breakdown**: Cost per model
- **Detailed History**: Line-by-line records
- **Export**: Download for analysis

### Usage View

Displays:

- Total spend for period
- Number of API calls
- Average cost per call
- Cost timeline visualization

### Filtering

```
Date Range: 2024-01-01 to 2024-01-31
Models: anthropic/claude-3-opus, openai/gpt-4-vision
```

### Entry Details

Each entry shows:

- Timestamp
- Model used
- Input/output tokens
- Input/output costs
- Total cost
- Image preview (if applicable)

### Export Options

- **CSV**: Spreadsheet analysis
- **JSON**: Programmatic access
- **PDF**: Stakeholder reports

---

## History Management

Record of all prompt generations.

### Features

- **Unified History**: All generations in one place
- **Favorites**: Star important entries
- **Ratings**: 1-5 star quality ratings
- **Search**: Find by keyword
- **Filters**: By model, date, rating
- **Preview**: View original images

### Entry Information

- Generated prompt text
- Model used
- Timestamp
- Cost
- User rating
- Original image

### Actions

- **Copy**: Copy to clipboard
- **Favorite**: Toggle star
- **Rate**: Assign 1-5 stars
- **Delete**: Remove entry
- **Re-generate**: Use same settings

### Bulk Operations

Select multiple entries to:

- Delete batch
- Export selected
- Add to favorites
- Assign ratings

### Storage Management

- **Max Entries**: 1000 (auto-delete oldest)
- **Storage Size**: ~10MB
- **Retention**: Indefinite (unless cleared)

Maintenance:

- Delete old entries regularly
- Export important data
- Use favorites for must-keep items

---

## Settings

Configuration control center.

### API Keys

**OpenRouter API Key**

- Required for all features
- Stored in browser localStorage
- Never transmitted except to OpenRouter
- Validated on first use

Setup:

1. Get key from [openrouter.ai](https://openrouter.ai/)
2. Paste in Settings
3. Wait for validation ✓

### Model Selection

**Vision Models**

- Select up to 5 models
- Pin favorites for quick access
- Auto-refresh every 24 hours

Management:

1. Click "Refresh Models"
2. Search for models
3. Select (max 5)
4. Drag to reorder
5. Pin frequently-used

### Prompt Template

Customize Image to Prompt analysis:

```
Default:
"Describe this image in detail..."

Custom:
"Analyze this {type} focusing on {aspect}..."
```

### Prompt Creator Config

See [Prompt Creator](#prompt-creator) section.

### Settings Persistence

- Auto-save on change
- Cross-tab sync
- Version control
- Export/import capability

### Reset Options

**Clear API Key**: Remove key only  
**Reset to Defaults**: Restore defaults  
**Clear All Data**: Fresh start (⚠️ cannot undo)

### Privacy & Security

- Local storage only
- No server storage
- HTTPS connections
- No tracking

### Backup & Restore

**Export Settings**

1. Click "Export Settings"
2. Save JSON file
3. Includes settings and configs (not history)

**Import Settings**

1. Click "Import Settings"
2. Select JSON file
3. Confirm import
4. Page refreshes

---

## Tips & Tricks

### Performance

1. Use 2-3 models instead of 5
2. Batch process multiple images
3. Choose appropriate models
4. Let app cache models (24h)

### Cost Optimization

1. Test with cheap models first
2. Batch similar images
3. Monitor Usage tab
4. Set monthly budgets

### Workflow Efficiency

1. Pin favorite models
2. Build Best Practices library
3. Review History before generating
4. Use keyboard shortcuts

### Keyboard Shortcuts

| Shortcut       | Action      |
| -------------- | ----------- |
| `Ctrl/Cmd + V` | Paste image |
| `Ctrl/Cmd + C` | Copy prompt |
| `Enter`        | Submit      |
| `Esc`          | Close modal |

---

## Troubleshooting

**"Invalid API Key"**

- Verify format (starts with `sk-`)
- Check account credits
- Try refreshing page

**"No Models Available"**

- Click "Refresh Models"
- Check internet connection
- Verify API key permissions

**"Generation Failed"**

- Check image size (<5MB)
- Verify format (JPG, PNG, WebP)
- Try different model

**Slow Performance**

- Reduce model count
- Close browser tabs
- Clear cache

---

## Additional Resources

- [API Reference](./API_REFERENCE.md)
- [Quick Start](./QUICK_START.md)
- [Contributing](../CONTRIBUTING.md)
- [Engineering Standards](./ENGINEERING_STANDARDS.md)

For help:

- [GitHub Issues](https://github.com/Vibe-coding-nvm-delete-repo/yt/issues)
- [Discussions](https://github.com/Vibe-coding-nvm-delete-repo/yt/discussions)

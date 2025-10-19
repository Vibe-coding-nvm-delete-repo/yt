/**
 * Leonardo.AI Validation Logic
 * Validates configurations and prompts for Leonardo.AI compatibility
 */

import type {
  LeonardoImageConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "@/types/leonardo";

// ============================================================================
// VALIDATION RULES
// ============================================================================

const HUMAN_RELATED_TERMS = [
  "people",
  "person",
  "human",
  "man",
  "woman",
  "child",
  "baby",
  "face",
  "portrait",
  "selfie",
  "hands",
  "fingers",
  "body",
  "skin",
  "eyes",
  "mouth",
  "nose",
  "ears",
  "hair",
  "head",
  "arm",
  "leg",
  "foot",
  "toe",
  "clothing",
  "dress",
  "shirt",
  "pants",
  "shoes",
  "hat",
  "glasses",
  "jewelry",
  "makeup",
];

const MIN_PROMPT_LENGTH = 20;
const MAX_PROMPT_LENGTH = 1500;
const RECOMMENDED_PROMPT_LENGTH_MIN = 50;
const RECOMMENDED_PROMPT_LENGTH_MAX = 500;

// ============================================================================
// CONFIG VALIDATION
// ============================================================================

export const validateLeonardoConfig = (
  config: LeonardoImageConfig,
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate required fields
  if (!config.style) {
    errors.push({
      field: "style",
      message: "Style is required",
      severity: "error",
    });
  }

  if (!config.subject) {
    errors.push({
      field: "subject",
      message: "Subject is required",
      severity: "error",
    });
  }

  if (!config.mood || config.mood.length === 0) {
    warnings.push({
      field: "mood",
      message: "At least one mood descriptor is recommended",
      severity: "warning",
      suggestion: "Select 1-3 mood descriptors for better results",
    });
  }

  // Validate composition
  if (!config.composition?.technique) {
    errors.push({
      field: "composition.technique",
      message: "Composition technique is required",
      severity: "error",
    });
  }

  if (
    config.composition?.negativeSpaceRatio !== undefined &&
    (config.composition.negativeSpaceRatio < 0 ||
      config.composition.negativeSpaceRatio > 100)
  ) {
    errors.push({
      field: "composition.negativeSpaceRatio",
      message: "Negative space ratio must be between 0 and 100",
      severity: "error",
    });
  }

  // Validate lighting
  if (!config.lighting?.primarySource) {
    errors.push({
      field: "lighting.primarySource",
      message: "Primary light source is required",
      severity: "error",
    });
  }

  if (
    config.lighting?.colorTemperature !== undefined &&
    (config.lighting.colorTemperature < 2400 ||
      config.lighting.colorTemperature > 5000)
  ) {
    errors.push({
      field: "lighting.colorTemperature",
      message: "Color temperature must be between 2400K and 5000K",
      severity: "error",
    });
  }

  // Validate texture
  if (!config.texture?.dominant) {
    errors.push({
      field: "texture.dominant",
      message: "Dominant texture is required",
      severity: "error",
    });
  }

  // Validate technical settings
  if (!config.technical?.depthOfField) {
    errors.push({
      field: "technical.depthOfField",
      message: "Depth of field is required",
      severity: "error",
    });
  }

  if (!config.technical?.aspectRatio) {
    errors.push({
      field: "technical.aspectRatio",
      message: "Aspect ratio is required",
      severity: "error",
    });
  }

  // Validate mood count
  if (config.mood && config.mood.length > 5) {
    warnings.push({
      field: "mood",
      message: "Too many mood descriptors may dilute the effect",
      severity: "warning",
      suggestion: "Limit to 3-5 mood descriptors for best results",
    });
  }

  // Validate sensory language count
  if (config.sensoryLanguage && config.sensoryLanguage.length > 7) {
    warnings.push({
      field: "sensoryLanguage",
      message: "Too many sensory descriptors may confuse the output",
      severity: "warning",
      suggestion: "Limit to 5-7 sensory descriptors",
    });
  }

  // Validate color palette accents
  if (config.colorPalette?.secondaryAccents) {
    if (config.colorPalette.secondaryAccents.length > 3) {
      warnings.push({
        field: "colorPalette.secondaryAccents",
        message: "Too many accent colors may reduce cohesion",
        severity: "warning",
        suggestion: "Limit to 3 accent colors",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// ============================================================================
// PROMPT VALIDATION
// ============================================================================

export const validateNoHumanElements = (text: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const lowerText = text.toLowerCase();
  const foundTerms: string[] = [];

  for (const term of HUMAN_RELATED_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(lowerText)) {
      foundTerms.push(term);
    }
  }

  if (foundTerms.length > 0) {
    errors.push({
      field: "prompt",
      message: `Human-related terms detected: ${foundTerms.join(", ")}`,
      severity: "error",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validatePromptLength = (prompt: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const length = prompt.trim().length;

  if (length < MIN_PROMPT_LENGTH) {
    errors.push({
      field: "prompt",
      message: `Prompt too short (${length} characters). Minimum ${MIN_PROMPT_LENGTH} required.`,
      severity: "error",
    });
  }

  if (length > MAX_PROMPT_LENGTH) {
    errors.push({
      field: "prompt",
      message: `Prompt too long (${length} characters). Maximum ${MAX_PROMPT_LENGTH} allowed.`,
      severity: "error",
    });
  }

  if (
    length >= MIN_PROMPT_LENGTH &&
    length < RECOMMENDED_PROMPT_LENGTH_MIN
  ) {
    warnings.push({
      field: "prompt",
      message: `Prompt is short (${length} characters). ${RECOMMENDED_PROMPT_LENGTH_MIN}+ recommended for detailed results.`,
      severity: "warning",
      suggestion: "Add more descriptive details for better image quality",
    });
  }

  if (length > RECOMMENDED_PROMPT_LENGTH_MAX && length <= MAX_PROMPT_LENGTH) {
    warnings.push({
      field: "prompt",
      message: `Prompt is long (${length} characters). Consider simplifying for clarity.`,
      severity: "warning",
      suggestion:
        "Focus on key details rather than exhaustive descriptions",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validatePromptStructure = (prompt: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check for empty prompt
  if (!prompt || prompt.trim().length === 0) {
    errors.push({
      field: "prompt",
      message: "Prompt cannot be empty",
      severity: "error",
    });
    return { isValid: false, errors, warnings };
  }

  // Check for excessive repetition
  const words = prompt.toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};

  for (const word of words) {
    if (word.length > 3) {
      // Only count words longer than 3 chars
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  const repeatedWords = Object.entries(wordCount)
    .filter(([, count]) => count > 4)
    .map(([word]) => word);

  if (repeatedWords.length > 0) {
    warnings.push({
      field: "prompt",
      message: `Word repetition detected: ${repeatedWords.slice(0, 3).join(", ")}`,
      severity: "warning",
      suggestion: "Use varied vocabulary for better results",
    });
  }

  // Check for excessive punctuation
  const punctuationCount = (prompt.match(/[!?.,;:]/g) || []).length;
  const punctuationRatio = punctuationCount / words.length;

  if (punctuationRatio > 0.15) {
    warnings.push({
      field: "prompt",
      message: "Excessive punctuation detected",
      severity: "warning",
      suggestion: "Use punctuation sparingly in prompts",
    });
  }

  // Check for all caps (might indicate shouting)
  const capsWords = prompt.match(/\b[A-Z]{3,}\b/g);
  if (capsWords && capsWords.length > 2) {
    warnings.push({
      field: "prompt",
      message: "Excessive use of all-caps words",
      severity: "warning",
      suggestion: "Use normal capitalization for better processing",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// ============================================================================
// COMBINED VALIDATION
// ============================================================================

export const validateFullPrompt = (prompt: string): ValidationResult => {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  // Run all validations
  const lengthResult = validatePromptLength(prompt);
  const structureResult = validatePromptStructure(prompt);
  const noHumanResult = validateNoHumanElements(prompt);

  // Combine results
  allErrors.push(...lengthResult.errors);
  allErrors.push(...structureResult.errors);
  allErrors.push(...noHumanResult.errors);

  allWarnings.push(...lengthResult.warnings);
  allWarnings.push(...structureResult.warnings);
  allWarnings.push(...noHumanResult.warnings);

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

// ============================================================================
// VALIDATION SUMMARY
// ============================================================================

export const getValidationSummary = (
  result: ValidationResult,
): string => {
  if (result.isValid && result.warnings.length === 0) {
    return "✓ All validations passed";
  }

  const parts: string[] = [];

  if (result.errors.length > 0) {
    parts.push(`${result.errors.length} error(s)`);
  }

  if (result.warnings.length > 0) {
    parts.push(`${result.warnings.length} warning(s)`);
  }

  return parts.join(", ");
};

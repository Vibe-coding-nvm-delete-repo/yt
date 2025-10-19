/**
 * Leonardo.AI Configuration Types
 * Type system for generating optimized prompts for Leonardo.AI image generation
 */

// ============================================================================
// ENUMS & BASIC TYPES
// ============================================================================

export type LeonardoStyle =
  | "photorealistic"
  | "cinematic"
  | "illustration"
  | "anime"
  | "3d-render"
  | "abstract"
  | "minimalist"
  | "concept-art";

export type LeonardoSubject =
  | "landscape"
  | "nature-scene"
  | "abstract-pattern"
  | "architecture"
  | "interior-space"
  | "still-life"
  | "cosmic-space"
  | "underwater"
  | "weather-phenomenon"
  | "geometric-forms"
  | "text-typography"
  | "product"
  | "vehicle"
  | "animal"
  | "plant-botanical";

export type CompositionTechnique =
  | "rule-of-thirds"
  | "golden-ratio"
  | "symmetrical"
  | "asymmetrical"
  | "centered"
  | "diagonal"
  | "leading-lines"
  | "frame-within-frame"
  | "negative-space"
  | "depth-layers"
  | "aerial-view"
  | "worms-eye-view"
  | "dutch-angle";

export type LightingSource =
  | "natural-daylight"
  | "golden-hour"
  | "blue-hour"
  | "overcast-soft"
  | "studio-lighting"
  | "dramatic-spotlight"
  | "backlight-silhouette"
  | "rim-lighting"
  | "ambient-glow"
  | "neon-artificial";

export type LightDirection =
  | "front"
  | "side"
  | "back"
  | "top"
  | "bottom"
  | "three-quarter";

export type ColorTemperature = number; // 2400-5000 Kelvin

export type ExposureMood =
  | "bright-airy"
  | "dark-moody"
  | "high-contrast"
  | "low-contrast"
  | "balanced";

export type LightQuality = "hard" | "soft" | "diffused";

export type TextureType =
  | "smooth-glossy"
  | "rough-matte"
  | "metallic"
  | "fabric-textile"
  | "organic-natural"
  | "weathered-aged"
  | "crystalline"
  | "liquid-fluid"
  | "glass-transparent"
  | "concrete-stone"
  | "wood-grain";

export type SurfacePatina =
  | "pristine-new"
  | "slightly-worn"
  | "heavily-aged"
  | "rustic-distressed";

export type MoodDescriptor =
  | "serene-calm"
  | "energetic-vibrant"
  | "mysterious-enigmatic"
  | "melancholic-somber"
  | "uplifting-joyful"
  | "tense-dramatic"
  | "ethereal-dreamlike"
  | "gritty-raw"
  | "elegant-refined"
  | "playful-whimsical"
  | "majestic-grand"
  | "intimate-cozy"
  | "futuristic-sci-fi"
  | "nostalgic-vintage"
  | "surreal-abstract"
  | "peaceful-tranquil"
  | "ominous-foreboding"
  | "romantic-soft"
  | "industrial-urban"
  | "organic-natural";

export type SensoryLanguage =
  | "crisp-sharp"
  | "soft-blurred"
  | "warm-inviting"
  | "cool-distant"
  | "rich-saturated"
  | "muted-desaturated"
  | "luminous-glowing"
  | "shadowy-dark"
  | "textured-tactile"
  | "smooth-sleek"
  | "dynamic-motion"
  | "static-still"
  | "expansive-vast"
  | "confined-intimate"
  | "delicate-fragile";

export type FocalPoint =
  | "center"
  | "left-third"
  | "right-third"
  | "top-third"
  | "bottom-third"
  | "golden-spiral"
  | "foreground"
  | "midground"
  | "background"
  | "multiple-points";

export type VisualFlow = "horizontal" | "vertical" | "circular" | "diagonal";

export type DepthOfField = "f/2.8" | "f/5.6" | "f/11" | "deep-focus";

export type FocusPriority = "foreground" | "midground" | "background";

export type AspectRatio = "16:9" | "1:1" | "9:16" | "21:9" | "4:3";

export type Resolution = "4k" | "1080p" | "cinema-2k" | "square-1024";

// ============================================================================
// COMPLEX TYPES
// ============================================================================

export interface LeonardoLighting {
  primarySource: LightingSource;
  secondarySources?: LightingSource[];
  direction: LightDirection;
  colorTemperature: ColorTemperature;
  exposureMood: ExposureMood;
  quality: LightQuality;
}

export interface LeonardoTexture {
  dominant: TextureType;
  secondary?: TextureType[];
  surfacePatina: SurfacePatina;
}

export interface LeonardoComposition {
  technique: CompositionTechnique;
  focalPoint: FocalPoint;
  negativeSpaceRatio: number; // 0-100, percentage
  visualFlow: VisualFlow;
}

export interface LeonardoColorPalette {
  name: string;
  primaryFamily: string;
  secondaryAccents: string[]; // max 3
  hexColors: string[];
}

export interface LeonardoTechnical {
  depthOfField: DepthOfField;
  focusPriority: FocusPriority;
  filmGrain: boolean;
  lensFlare: boolean;
  vignetting: boolean;
  resolution: Resolution;
  aspectRatio: AspectRatio;
}

export interface LeonardoVideoMetadata {
  duration?: number; // seconds, if generating for video
  fps?: number;
  targetPlatform?: "youtube" | "instagram" | "tiktok" | "generic";
}

// ============================================================================
// MAIN CONFIGURATION
// ============================================================================

export interface LeonardoImageConfig {
  // Core Properties
  style: LeonardoStyle;
  subject: LeonardoSubject;
  mood: MoodDescriptor[];
  sensoryLanguage?: SensoryLanguage[];

  // Visual Properties
  composition: LeonardoComposition;
  lighting: LeonardoLighting;
  texture: LeonardoTexture;
  colorPalette?: LeonardoColorPalette;

  // Technical Properties
  technical: LeonardoTechnical;

  // Optional Metadata
  videoMetadata?: LeonardoVideoMetadata;
  negativePrompt?: string[];

  // Schema version for migrations
  schemaVersion: 1;
}

// ============================================================================
// HISTORY & OUTPUTS
// ============================================================================

export interface LeonardoConfigHistoryEntry {
  id: string;
  config: LeonardoImageConfig;
  generatedPrompt: string;
  presetName?: string;
  timestamp: number;
  usageCount: number;
}

export interface LeonardoOutputEntry {
  id: string;
  configId: string;
  prompt: string;
  imageUrl?: string; // if user uploads result
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  timestamp: number;
}

// ============================================================================
// PRESETS & TEMPLATES
// ============================================================================

export interface LeonardoPreset {
  id: string;
  name: string;
  description: string;
  config: LeonardoImageConfig;
  category: "youtube" | "custom" | "system";
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface YouTubeContentTemplate extends LeonardoPreset {
  category: "youtube";
  youtubeContentType:
    | "study-music"
    | "ambient-lofi"
    | "focus-work"
    | "meditation"
    | "storytelling";
  recommendedDuration: number; // minutes
}

// ============================================================================
// PROMPT GENERATION
// ============================================================================

export interface PromptSection {
  step: number;
  label: string;
  content: string;
  explanation: string;
}

export interface GeneratedPrompt {
  fullPrompt: string;
  negativePrompt: string;
  sections: PromptSection[];
  metadata: {
    config: LeonardoImageConfig;
    generatedAt: number;
    characterCount: number;
    noPeopleValidated: boolean;
  };
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error";
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: "warning";
  suggestion?: string;
}

// ============================================================================
// STORAGE & EXPORT
// ============================================================================

export interface LeonardoStorageData {
  currentConfig?: LeonardoImageConfig;
  presets: Record<string, LeonardoPreset>;
  history: LeonardoConfigHistoryEntry[];
  outputs: LeonardoOutputEntry[];
  schemaVersion: 1;
  lastModified: number;
}

export interface LeonardoExportData extends LeonardoStorageData {
  exportedAt: number;
  exportVersion: string;
}

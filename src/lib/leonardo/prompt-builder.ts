/**
 * Leonardo.AI Prompt Builder
 * Generates optimized prompts for Leonardo.AI image generation
 */

import type {
  LeonardoImageConfig,
  GeneratedPrompt,
  PromptSection,
} from "@/types/leonardo";
import {
  STYLE_OPTIONS,
  SUBJECT_OPTIONS,
  COMPOSITION_TECHNIQUES,
  LIGHTING_SOURCES,
  TEXTURE_SPECIFICATIONS,
  MOOD_DESCRIPTORS,
  SENSORY_LANGUAGE_OPTIONS,
} from "./constants";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const findOption = <T extends { value: string; leonardoLanguage: string }>(
  options: T[],
  value: string,
): T | undefined => options.find((opt) => opt.value === value);

const joinParts = (...parts: (string | undefined)[]): string =>
  parts.filter((p) => p && p.trim()).join(", ");

// ============================================================================
// STEP 1: STYLE PROMPT
// ============================================================================

export const buildStylePrompt = (config: LeonardoImageConfig): string => {
  const styleOption = findOption(STYLE_OPTIONS, config.style);
  if (!styleOption) return "";

  return styleOption.leonardoLanguage;
};

// ============================================================================
// STEP 2: SUBJECT PROMPT
// ============================================================================

export const buildSubjectPrompt = (config: LeonardoImageConfig): string => {
  const subjectOption = findOption(SUBJECT_OPTIONS, config.subject);
  if (!subjectOption) return "";

  return subjectOption.leonardoLanguage;
};

// ============================================================================
// STEP 3: SCENE & MOOD PROMPT
// ============================================================================

export const buildScenePrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Add mood descriptors
  if (config.mood && config.mood.length > 0) {
    const moodLanguages = config.mood
      .map((mood) => {
        const moodOption = findOption(MOOD_DESCRIPTORS, mood);
        return moodOption?.leonardoLanguage;
      })
      .filter(Boolean);

    if (moodLanguages.length > 0) {
      parts.push(moodLanguages.join(", "));
    }
  }

  // Add sensory language
  if (config.sensoryLanguage && config.sensoryLanguage.length > 0) {
    const sensoryLanguages = config.sensoryLanguage
      .map((sensory) => {
        const sensoryOption = findOption(SENSORY_LANGUAGE_OPTIONS, sensory);
        return sensoryOption?.leonardoLanguage;
      })
      .filter(Boolean);

    if (sensoryLanguages.length > 0) {
      parts.push(sensoryLanguages.join(", "));
    }
  }

  return parts.join(", ");
};

// ============================================================================
// STEP 4A: COMPOSITION PROMPT
// ============================================================================

export const buildCompositionPrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Composition technique
  const compositionOption = findOption(
    COMPOSITION_TECHNIQUES,
    config.composition.technique,
  );
  if (compositionOption) {
    parts.push(compositionOption.leonardoLanguage);
  }

  // Focal point
  if (config.composition.focalPoint) {
    parts.push(`focal point ${config.composition.focalPoint}`);
  }

  // Visual flow
  if (config.composition.visualFlow) {
    parts.push(`${config.composition.visualFlow} flow`);
  }

  // Negative space
  if (config.composition.negativeSpaceRatio > 40) {
    parts.push("generous negative space");
  } else if (config.composition.negativeSpaceRatio < 30) {
    parts.push("minimal negative space");
  }

  return parts.join(", ");
};

// ============================================================================
// STEP 4B: LIGHTING PROMPT
// ============================================================================

export const buildLightingPrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Primary light source
  const primaryLightOption = findOption(
    LIGHTING_SOURCES,
    config.lighting.primarySource,
  );
  if (primaryLightOption) {
    parts.push(primaryLightOption.leonardoLanguage);
  }

  // Secondary sources
  if (
    config.lighting.secondarySources &&
    config.lighting.secondarySources.length > 0
  ) {
    const secondaryLanguages = config.lighting.secondarySources
      .map((source) => {
        const option = findOption(LIGHTING_SOURCES, source);
        return option?.leonardoLanguage;
      })
      .filter(Boolean);

    if (secondaryLanguages.length > 0) {
      parts.push(`with ${secondaryLanguages.join(" and ")}`);
    }
  }

  // Direction
  parts.push(`${config.lighting.direction} lighting`);

  // Light quality
  parts.push(`${config.lighting.quality} light`);

  // Exposure mood
  if (config.lighting.exposureMood !== "balanced") {
    parts.push(config.lighting.exposureMood);
  }

  // Color temperature (if notably warm or cool)
  if (config.lighting.colorTemperature < 4000) {
    parts.push("warm color temperature");
  } else if (config.lighting.colorTemperature > 6000) {
    parts.push("cool color temperature");
  }

  return parts.join(", ");
};

// ============================================================================
// STEP 4C: TEXTURE PROMPT
// ============================================================================

export const buildTexturePrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Dominant texture
  const dominantOption = findOption(
    TEXTURE_SPECIFICATIONS,
    config.texture.dominant,
  );
  if (dominantOption) {
    parts.push(dominantOption.leonardoLanguage);
  }

  // Secondary textures
  if (config.texture.secondary && config.texture.secondary.length > 0) {
    const secondaryLanguages = config.texture.secondary
      .map((texture) => {
        const option = findOption(TEXTURE_SPECIFICATIONS, texture);
        return option?.leonardoLanguage;
      })
      .filter(Boolean);

    if (secondaryLanguages.length > 0) {
      parts.push(secondaryLanguages.join(" and "));
    }
  }

  // Surface patina
  if (config.texture.surfacePatina !== "pristine-new") {
    parts.push(`${config.texture.surfacePatina} patina`);
  }

  return parts.join(", ");
};

// ============================================================================
// STEP 4D: ATMOSPHERE/COLOR PROMPT
// ============================================================================

export const buildAtmospherePrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Color palette
  if (config.colorPalette) {
    parts.push(`${config.colorPalette.name.toLowerCase()} palette`);

    if (config.colorPalette.primaryFamily) {
      parts.push(`${config.colorPalette.primaryFamily.toLowerCase()} tones`);
    }

    if (
      config.colorPalette.secondaryAccents &&
      config.colorPalette.secondaryAccents.length > 0
    ) {
      const accents = config.colorPalette.secondaryAccents
        .map((a) => a.toLowerCase())
        .join(" and ");
      parts.push(`${accents} accents`);
    }
  }

  return parts.join(", ");
};

// ============================================================================
// STEP 5: QUALITY & TECHNICAL PROMPT
// ============================================================================

export const buildQualityPrompt = (config: LeonardoImageConfig): string => {
  const parts: string[] = [];

  // Depth of field
  parts.push(`${config.technical.depthOfField} depth of field`);

  // Focus priority
  if (config.technical.focusPriority !== "midground") {
    parts.push(`${config.technical.focusPriority} focus`);
  }

  // Special effects
  if (config.technical.filmGrain) {
    parts.push("subtle film grain");
  }

  if (config.technical.lensFlare) {
    parts.push("lens flare");
  }

  if (config.technical.vignetting) {
    parts.push("vignetting");
  }

  // Resolution
  parts.push(`${config.technical.resolution} resolution`);

  // Quality descriptors
  parts.push("highly detailed", "professional quality", "sharp focus");

  return parts.join(", ");
};

// ============================================================================
// NEGATIVE PROMPT
// ============================================================================

export const buildNegativePrompt = (config: LeonardoImageConfig): string => {
  const negativeTerms = config.negativePrompt || [];
  return negativeTerms.join(", ");
};

// ============================================================================
// FULL PROMPT GENERATION
// ============================================================================

export const generateFullPrompt = (
  config: LeonardoImageConfig,
): GeneratedPrompt => {
  // Build each section
  const stylePrompt = buildStylePrompt(config);
  const subjectPrompt = buildSubjectPrompt(config);
  const scenePrompt = buildScenePrompt(config);
  const compositionPrompt = buildCompositionPrompt(config);
  const lightingPrompt = buildLightingPrompt(config);
  const texturePrompt = buildTexturePrompt(config);
  const atmospherePrompt = buildAtmospherePrompt(config);
  const qualityPrompt = buildQualityPrompt(config);
  const negativePrompt = buildNegativePrompt(config);

  // Create prompt sections
  const sections: PromptSection[] = [
    {
      step: 1,
      label: "Style & Subject",
      content: joinParts(stylePrompt, subjectPrompt),
      explanation:
        "Defines the overall artistic style and main subject of the image",
    },
    {
      step: 2,
      label: "Mood & Atmosphere",
      content: scenePrompt,
      explanation: "Sets the emotional tone and sensory qualities",
    },
    {
      step: 3,
      label: "Composition & Framing",
      content: compositionPrompt,
      explanation: "Describes how elements are arranged in the frame",
    },
    {
      step: 4,
      label: "Lighting & Texture",
      content: joinParts(lightingPrompt, texturePrompt),
      explanation: "Specifies light sources, direction, and surface qualities",
    },
    {
      step: 5,
      label: "Color & Technical Quality",
      content: joinParts(atmospherePrompt, qualityPrompt),
      explanation: "Defines color palette and technical specifications",
    },
  ];

  // Combine all sections into full prompt
  const fullPrompt = sections
    .map((section) => section.content)
    .filter((content) => content.trim())
    .join(", ");

  // Check for human elements (should be validated before this)
  const lowerPrompt = fullPrompt.toLowerCase();
  const noPeopleValidated = !(
    lowerPrompt.includes("people") ||
    lowerPrompt.includes("person") ||
    lowerPrompt.includes("human") ||
    lowerPrompt.includes("face") ||
    lowerPrompt.includes("hands")
  );

  return {
    fullPrompt,
    negativePrompt,
    sections,
    metadata: {
      config,
      generatedAt: Date.now(),
      characterCount: fullPrompt.length,
      noPeopleValidated,
    },
  };
};

// ============================================================================
// PROMPT EXPLANATION
// ============================================================================

export const buildPromptExplanation = (
  config: LeonardoImageConfig,
): string => {
  const parts: string[] = [];

  parts.push(
    `This prompt generates a ${config.style} ${config.subject} image.`,
  );

  if (config.mood && config.mood.length > 0) {
    const moods = config.mood.join(", ");
    parts.push(`The mood is ${moods}.`);
  }

  parts.push(
    `Composition uses ${config.composition.technique} with ${config.composition.focalPoint} focal point.`,
  );

  parts.push(
    `Lighting: ${config.lighting.primarySource} from ${config.lighting.direction}, ${config.lighting.quality} quality.`,
  );

  parts.push(`Dominant texture: ${config.texture.dominant}.`);

  parts.push(
    `Technical: ${config.technical.resolution} at ${config.technical.aspectRatio}, ${config.technical.depthOfField} depth.`,
  );

  return parts.join(" ");
};

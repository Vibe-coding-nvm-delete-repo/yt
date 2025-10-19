/**
 * Tests for Leonardo.AI Prompt Builder
 */

import {
  buildStylePrompt,
  buildSubjectPrompt,
  buildScenePrompt,
  buildCompositionPrompt,
  buildLightingPrompt,
  buildTexturePrompt,
  buildAtmospherePrompt,
  buildQualityPrompt,
  buildNegativePrompt,
  generateFullPrompt,
  buildPromptExplanation,
} from "../prompt-builder";
import { getDefaultLeonardoConfig } from "../storage";
import type { LeonardoImageConfig } from "@/types/leonardo";

describe("Leonardo Prompt Builder", () => {
  describe("buildStylePrompt", () => {
    it("should build style prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.style = "photorealistic";

      const prompt = buildStylePrompt(config);

      expect(prompt).toContain("photorealistic");
    });

    it("should return empty string for invalid style", () => {
      const config = getDefaultLeonardoConfig();
      config.style = "invalid" as LeonardoImageConfig["style"];

      const prompt = buildStylePrompt(config);

      expect(prompt).toBe("");
    });
  });

  describe("buildSubjectPrompt", () => {
    it("should build subject prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.subject = "landscape";

      const prompt = buildSubjectPrompt(config);

      expect(prompt).toContain("landscape");
    });

    it("should handle different subjects", () => {
      const config = getDefaultLeonardoConfig();
      config.subject = "cosmic-space";

      const prompt = buildSubjectPrompt(config);

      expect(prompt).toContain("space");
    });
  });

  describe("buildScenePrompt", () => {
    it("should build scene with mood descriptors", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = ["serene-calm", "peaceful-tranquil"];

      const prompt = buildScenePrompt(config);

      expect(prompt).toContain("serene");
      expect(prompt).toContain("peaceful");
    });

    it("should include sensory language", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = ["serene-calm"];
      config.sensoryLanguage = ["crisp-sharp", "warm-inviting"];

      const prompt = buildScenePrompt(config);

      expect(prompt).toContain("crisp");
      expect(prompt).toContain("warm");
    });

    it("should return empty string with no mood or sensory language", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = [];
      config.sensoryLanguage = [];

      const prompt = buildScenePrompt(config);

      expect(prompt).toBe("");
    });
  });

  describe("buildCompositionPrompt", () => {
    it("should build composition prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.composition.technique = "rule-of-thirds";
      config.composition.focalPoint = "center";

      const prompt = buildCompositionPrompt(config);

      expect(prompt).toContain("rule of thirds");
      expect(prompt).toContain("center");
    });

    it("should mention negative space when high", () => {
      const config = getDefaultLeonardoConfig();
      config.composition.negativeSpaceRatio = 60;

      const prompt = buildCompositionPrompt(config);

      expect(prompt).toContain("negative space");
    });

    it("should not mention negative space when balanced", () => {
      const config = getDefaultLeonardoConfig();
      config.composition.negativeSpaceRatio = 35;

      const prompt = buildCompositionPrompt(config);

      expect(prompt).not.toContain("negative space");
    });
  });

  describe("buildLightingPrompt", () => {
    it("should build lighting prompt with primary source", () => {
      const config = getDefaultLeonardoConfig();
      config.lighting.primarySource = "golden-hour";
      config.lighting.direction = "side";

      const prompt = buildLightingPrompt(config);

      expect(prompt).toContain("golden hour");
      expect(prompt).toContain("side");
    });

    it("should include secondary light sources", () => {
      const config = getDefaultLeonardoConfig();
      config.lighting.secondarySources = ["rim-lighting", "ambient-glow"];

      const prompt = buildLightingPrompt(config);

      expect(prompt).toContain("rim lighting");
      expect(prompt).toContain("ambient");
    });

    it("should mention warm color temperature", () => {
      const config = getDefaultLeonardoConfig();
      config.lighting.colorTemperature = 3000;

      const prompt = buildLightingPrompt(config);

      expect(prompt).toContain("warm");
    });

    it("should mention cool color temperature", () => {
      const config = getDefaultLeonardoConfig();
      config.lighting.colorTemperature = 7000;

      const prompt = buildLightingPrompt(config);

      expect(prompt).toContain("cool");
    });
  });

  describe("buildTexturePrompt", () => {
    it("should build texture prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.texture.dominant = "metallic";

      const prompt = buildTexturePrompt(config);

      expect(prompt).toContain("metallic");
    });

    it("should include secondary textures", () => {
      const config = getDefaultLeonardoConfig();
      config.texture.secondary = ["glass-transparent", "smooth-glossy"];

      const prompt = buildTexturePrompt(config);

      expect(prompt).toContain("glass");
      expect(prompt).toContain("glossy");
    });

    it("should mention surface patina when not pristine", () => {
      const config = getDefaultLeonardoConfig();
      config.texture.surfacePatina = "weathered-aged";

      const prompt = buildTexturePrompt(config);

      expect(prompt).toContain("weathered-aged");
    });
  });

  describe("buildAtmospherePrompt", () => {
    it("should build atmosphere with color palette", () => {
      const config = getDefaultLeonardoConfig();
      config.colorPalette = {
        name: "Warm Sunset",
        primaryFamily: "Orange",
        secondaryAccents: ["Red", "Yellow"],
        hexColors: ["#FF6B35", "#F7931E"],
      };

      const prompt = buildAtmospherePrompt(config);

      expect(prompt).toContain("warm sunset");
      expect(prompt).toContain("orange");
    });

    it("should return empty string without color palette", () => {
      const config = getDefaultLeonardoConfig();
      config.colorPalette = undefined;

      const prompt = buildAtmospherePrompt(config);

      expect(prompt).toBe("");
    });
  });

  describe("buildQualityPrompt", () => {
    it("should build quality prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.technical.depthOfField = "f/2.8";
      config.technical.resolution = "4k";

      const prompt = buildQualityPrompt(config);

      expect(prompt).toContain("f/2.8");
      expect(prompt).toContain("4k");
      expect(prompt).toContain("detailed");
    });

    it("should include special effects when enabled", () => {
      const config = getDefaultLeonardoConfig();
      config.technical.filmGrain = true;
      config.technical.lensFlare = true;
      config.technical.vignetting = true;

      const prompt = buildQualityPrompt(config);

      expect(prompt).toContain("film grain");
      expect(prompt).toContain("lens flare");
      expect(prompt).toContain("vignetting");
    });
  });

  describe("buildNegativePrompt", () => {
    it("should build negative prompt from config", () => {
      const config = getDefaultLeonardoConfig();
      config.negativePrompt = ["people", "text", "watermark"];

      const prompt = buildNegativePrompt(config);

      expect(prompt).toContain("people");
      expect(prompt).toContain("text");
      expect(prompt).toContain("watermark");
    });

    it("should return empty string with no negative prompts", () => {
      const config = getDefaultLeonardoConfig();
      config.negativePrompt = [];

      const prompt = buildNegativePrompt(config);

      expect(prompt).toBe("");
    });
  });

  describe("generateFullPrompt", () => {
    it("should generate full prompt with all sections", () => {
      const config = getDefaultLeonardoConfig();
      const result = generateFullPrompt(config);

      expect(result.fullPrompt).toBeTruthy();
      expect(result.sections).toHaveLength(5);
      expect(result.metadata.characterCount).toBeGreaterThan(0);
      expect(result.metadata.noPeopleValidated).toBe(true);
    });

    it("should create proper section structure", () => {
      const config = getDefaultLeonardoConfig();
      const result = generateFullPrompt(config);

      expect(result.sections[0]).toEqual(
        expect.objectContaining({
          step: 1,
          label: "Style & Subject",
          content: expect.any(String),
          explanation: expect.any(String),
        }),
      );
    });

    it("should validate no people in prompt", () => {
      const config = getDefaultLeonardoConfig();
      const result = generateFullPrompt(config);

      const lowerPrompt = result.fullPrompt.toLowerCase();
      expect(lowerPrompt).not.toContain("people");
      expect(lowerPrompt).not.toContain("person");
      expect(result.metadata.noPeopleValidated).toBe(true);
    });

    it("should include negative prompt", () => {
      const config = getDefaultLeonardoConfig();
      config.negativePrompt = ["people", "text"];

      const result = generateFullPrompt(config);

      expect(result.negativePrompt).toContain("people");
      expect(result.negativePrompt).toContain("text");
    });

    it("should filter out empty sections", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = [];
      config.sensoryLanguage = [];

      const result = generateFullPrompt(config);

      // Should still generate prompt without scene section
      expect(result.fullPrompt).toBeTruthy();
      expect(result.fullPrompt.length).toBeGreaterThan(0);
    });
  });

  describe("buildPromptExplanation", () => {
    it("should build human-readable explanation", () => {
      const config = getDefaultLeonardoConfig();
      const explanation = buildPromptExplanation(config);

      expect(explanation).toContain(config.style);
      expect(explanation).toContain(config.subject);
      expect(explanation).toContain(config.composition.technique);
      expect(explanation).toContain(config.lighting.primarySource);
    });

    it("should include mood if present", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = ["serene-calm", "peaceful-tranquil"];

      const explanation = buildPromptExplanation(config);

      expect(explanation).toContain("mood");
      expect(explanation).toContain("serene-calm");
    });

    it("should mention technical details", () => {
      const config = getDefaultLeonardoConfig();
      config.technical.resolution = "4k";
      config.technical.aspectRatio = "16:9";

      const explanation = buildPromptExplanation(config);

      expect(explanation).toContain("4k");
      expect(explanation).toContain("16:9");
    });
  });
});

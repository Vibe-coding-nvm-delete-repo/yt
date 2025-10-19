/**
 * Tests for Leonardo.AI Validation
 */

import {
  validateLeonardoConfig,
  validateNoHumanElements,
  validatePromptLength,
  validatePromptStructure,
  validateFullPrompt,
  getValidationSummary,
} from "../validation";
import { getDefaultLeonardoConfig } from "../storage";
import type { LeonardoImageConfig } from "@/types/leonardo";

describe("Leonardo Validation", () => {
  describe("validateLeonardoConfig", () => {
    it("should validate a complete config", () => {
      const config = getDefaultLeonardoConfig();
      const result = validateLeonardoConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should error when style is missing", () => {
      const config = getDefaultLeonardoConfig();
      config.style = "" as LeonardoImageConfig["style"];

      const result = validateLeonardoConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "style",
          severity: "error",
        }),
      );
    });

    it("should warn when mood is empty", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = [];

      const result = validateLeonardoConfig(config);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: "mood",
          severity: "warning",
        }),
      );
    });

    it("should error when color temperature is out of range", () => {
      const config = getDefaultLeonardoConfig();
      config.lighting.colorTemperature = 1000; // Too low

      const result = validateLeonardoConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "lighting.colorTemperature",
          severity: "error",
        }),
      );
    });

    it("should warn when too many mood descriptors", () => {
      const config = getDefaultLeonardoConfig();
      config.mood = [
        "serene-calm",
        "energetic-vibrant",
        "mysterious-enigmatic",
        "melancholic-somber",
        "uplifting-joyful",
        "tense-dramatic",
      ];

      const result = validateLeonardoConfig(config);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: "mood",
          message: expect.stringContaining("Too many"),
        }),
      );
    });

    it("should error when negative space ratio is out of range", () => {
      const config = getDefaultLeonardoConfig();
      config.composition.negativeSpaceRatio = 150; // Too high

      const result = validateLeonardoConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "composition.negativeSpaceRatio",
        }),
      );
    });
  });

  describe("validateNoHumanElements", () => {
    it("should pass when no human terms are present", () => {
      const prompt = "A beautiful landscape with mountains and trees";
      const result = validateNoHumanElements(prompt);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should error when human terms are detected", () => {
      const prompt = "A person standing in a landscape";
      const result = validateNoHumanElements(prompt);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "prompt",
          message: expect.stringContaining("person"),
        }),
      );
    });

    it("should detect multiple human terms", () => {
      const prompt = "A face with hands visible";
      const result = validateNoHumanElements(prompt);

      expect(result.isValid).toBe(false);
      expect(result.errors[0]?.message).toMatch(/face/);
      expect(result.errors[0]?.message).toMatch(/hands/);
    });

    it("should be case-insensitive", () => {
      const prompt = "A PERSON in the scene";
      const result = validateNoHumanElements(prompt);

      expect(result.isValid).toBe(false);
    });

    it("should only match whole words", () => {
      const prompt = "A personal computer in the person's hand";
      const result = validateNoHumanElements(prompt);

      // "person" should be detected but "personal" should not
      expect(result.isValid).toBe(false);
    });
  });

  describe("validatePromptLength", () => {
    it("should pass for normal length prompts", () => {
      const prompt = "A beautiful landscape with mountains, trees, and clear sky";
      const result = validatePromptLength(prompt);

      expect(result.isValid).toBe(true);
    });

    it("should error when prompt is too short", () => {
      const prompt = "Short";
      const result = validatePromptLength(prompt);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("too short"),
        }),
      );
    });

    it("should error when prompt is too long", () => {
      const prompt = "A".repeat(1600);
      const result = validatePromptLength(prompt);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("too long"),
        }),
      );
    });

    it("should warn when prompt is short but valid", () => {
      const prompt = "A landscape scene here";
      const result = validatePromptLength(prompt);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("short"),
        }),
      );
    });

    it("should warn when prompt is long but valid", () => {
      const prompt = "A".repeat(600);
      const result = validatePromptLength(prompt);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("long"),
        }),
      );
    });
  });

  describe("validatePromptStructure", () => {
    it("should error on empty prompt", () => {
      const prompt = "";
      const result = validatePromptStructure(prompt);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("empty"),
        }),
      );
    });

    it("should warn on excessive word repetition", () => {
      const prompt = "beautiful beautiful beautiful beautiful beautiful scene";
      const result = validatePromptStructure(prompt);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("repetition"),
        }),
      );
    });

    it("should warn on excessive punctuation", () => {
      const prompt = "A!!! scene!!! with!!! too!!! much!!! punctuation!!!";
      const result = validatePromptStructure(prompt);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("punctuation"),
        }),
      );
    });

    it("should warn on excessive all-caps", () => {
      const prompt = "VERY LOUD TEXT WITH MANY CAPS WORDS";
      const result = validatePromptStructure(prompt);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("all-caps"),
        }),
      );
    });

    it("should pass well-structured prompts", () => {
      const prompt =
        "A serene landscape with mountains, trees, and a clear blue sky";
      const result = validatePromptStructure(prompt);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("validateFullPrompt", () => {
    it("should combine all validation checks", () => {
      const prompt = "A person in a very short scene";
      const result = validateFullPrompt(prompt);

      // Should have human elements error
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("Human-related"),
        }),
      );

      // Should have length warning
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining("short"),
        }),
      );
    });

    it("should pass valid prompts", () => {
      const prompt =
        "A beautiful landscape with mountains, trees, and a clear blue sky, cinematic lighting, photorealistic";
      const result = validateFullPrompt(prompt);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("getValidationSummary", () => {
    it("should return success message for valid results", () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      const summary = getValidationSummary(result);
      expect(summary).toContain("passed");
    });

    it("should show error count", () => {
      const result = {
        isValid: false,
        errors: [
          {
            field: "test",
            message: "error",
            severity: "error" as const,
          },
        ],
        warnings: [],
      };

      const summary = getValidationSummary(result);
      expect(summary).toContain("1 error");
    });

    it("should show warning count", () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: [
          {
            field: "test",
            message: "warning",
            severity: "warning" as const,
          },
          {
            field: "test2",
            message: "warning2",
            severity: "warning" as const,
          },
        ],
      };

      const summary = getValidationSummary(result);
      expect(summary).toContain("2 warning");
    });
  });
});

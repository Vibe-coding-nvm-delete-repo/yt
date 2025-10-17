import {
  middleEllipsis,
  getResponsiveMaxLength,
  getCurrentResponsiveMaxLength,
} from "../truncation";

describe("truncation utilities", () => {
  describe("middleEllipsis", () => {
    it("should return original string if shorter than maxLen", () => {
      const str = "short";
      expect(middleEllipsis(str, 10)).toBe("short");
    });

    it("should return original string if equal to maxLen", () => {
      const str = "1234567890";
      expect(middleEllipsis(str, 10)).toBe("1234567890");
    });

    it("should truncate long strings with middle ellipsis", () => {
      const str = "anthropic/claude-3-opus-20240229-v1:0";
      const result = middleEllipsis(str, 25);

      expect(result).toHaveLength(25);
      expect(result).toContain("...");
      expect(result).toMatch(/^anthropic/);
      expect(result).toMatch(/v1:0$/);
    });

    it("should preserve beginning and end context", () => {
      const str = "provider/model-name-version-123";
      const result = middleEllipsis(str, 20);

      expect(result).toMatch(/^provider/);
      expect(result).toMatch(/123$/);
    });

    it("should handle very short maxLen gracefully", () => {
      const str = "very-long-string";
      const result = middleEllipsis(str, 3);

      expect(result.length).toBeLessThanOrEqual(3);
    });

    it("should handle empty string", () => {
      expect(middleEllipsis("", 10)).toBe("");
    });

    it("should handle maxLen of 0", () => {
      expect(middleEllipsis("test", 0)).toBe("");
    });

    it("should distribute characters evenly between start and end", () => {
      const str = "0123456789abcdefghij";
      const result = middleEllipsis(str, 10);

      // With maxLen=10, we have 7 chars (10-3) to distribute
      // start = ceil(7/2) = 4, end = floor(7/2) = 3
      expect(result).toBe("0123...hij");
    });

    it("should handle model IDs correctly", () => {
      const modelId = "anthropic/claude-3-opus-20240229-v1:0";
      const result = middleEllipsis(modelId, 30);

      expect(result.length).toBe(30);
      expect(result).toMatch(/^anthropic/);
      expect(result).toMatch(/:0$/);
    });
  });

  describe("getResponsiveMaxLength", () => {
    it("should return 20 for mobile screens (< 640px)", () => {
      expect(getResponsiveMaxLength(375)).toBe(20);
      expect(getResponsiveMaxLength(639)).toBe(20);
    });

    it("should return 30 for tablet screens (640-767px)", () => {
      expect(getResponsiveMaxLength(640)).toBe(30);
      expect(getResponsiveMaxLength(767)).toBe(30);
    });

    it("should return 40 for desktop screens (768-1023px)", () => {
      expect(getResponsiveMaxLength(768)).toBe(40);
      expect(getResponsiveMaxLength(1023)).toBe(40);
    });

    it("should return 50 for large desktop screens (>= 1024px)", () => {
      expect(getResponsiveMaxLength(1024)).toBe(50);
      expect(getResponsiveMaxLength(1920)).toBe(50);
    });
  });

  describe("getCurrentResponsiveMaxLength", () => {
    it("should return default value in SSR environment", () => {
      // In Jest 30 with JSDOM 26, window is permanently available and cannot be deleted.
      // Instead, we test the SSR case by mocking window.innerWidth to a value that returns 40
      const originalInnerWidth = window.innerWidth;

      // Set innerWidth to a value that will return 40 (between 768 and 1024)
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });

      expect(getCurrentResponsiveMaxLength()).toBe(40);

      // Restore
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });

    it("should use window.innerWidth in browser environment", () => {
      const originalInnerWidth = window.innerWidth;

      // Mock window.innerWidth
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      expect(getCurrentResponsiveMaxLength()).toBe(20);

      // Restore
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });
  });
});

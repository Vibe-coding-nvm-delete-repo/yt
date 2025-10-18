import {
  isEmpty,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  isLengthInRange,
  sanitize,
} from "../stringValidation";

describe("String Validation Utilities", () => {
  describe("isEmpty", () => {
    it("should return true for null", () => {
      expect(isEmpty(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it("should return true for empty string", () => {
      expect(isEmpty("")).toBe(true);
    });

    it("should return true for whitespace only", () => {
      expect(isEmpty("   ")).toBe(true);
      expect(isEmpty("\t\n")).toBe(true);
    });

    it("should return false for non-empty string", () => {
      expect(isEmpty("hello")).toBe(false);
      expect(isEmpty("  hello  ")).toBe(false);
    });
  });

  describe("isNotEmpty", () => {
    it("should return false for null", () => {
      expect(isNotEmpty(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isNotEmpty(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isNotEmpty("")).toBe(false);
    });

    it("should return false for whitespace only", () => {
      expect(isNotEmpty("   ")).toBe(false);
    });

    it("should return true for non-empty string", () => {
      expect(isNotEmpty("hello")).toBe(true);
      expect(isNotEmpty("  hello  ")).toBe(true);
    });
  });

  describe("hasMinLength", () => {
    it("should return false for null", () => {
      expect(hasMinLength(null, 5)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(hasMinLength(undefined, 5)).toBe(false);
    });

    it("should return true when length equals minimum", () => {
      expect(hasMinLength("hello", 5)).toBe(true);
    });

    it("should return true when length exceeds minimum", () => {
      expect(hasMinLength("hello world", 5)).toBe(true);
    });

    it("should return false when length is below minimum", () => {
      expect(hasMinLength("hi", 5)).toBe(false);
    });

    it("should trim before checking length", () => {
      expect(hasMinLength("  hello  ", 5)).toBe(true);
      expect(hasMinLength("  hi  ", 5)).toBe(false);
    });

    it("should handle zero minimum length", () => {
      expect(hasMinLength("", 0)).toBe(false); // Empty string after trim
      expect(hasMinLength("hello", 0)).toBe(true);
    });
  });

  describe("hasMaxLength", () => {
    it("should return true for null", () => {
      expect(hasMaxLength(null, 5)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(hasMaxLength(undefined, 5)).toBe(true);
    });

    it("should return true when length equals maximum", () => {
      expect(hasMaxLength("hello", 5)).toBe(true);
    });

    it("should return true when length is below maximum", () => {
      expect(hasMaxLength("hi", 5)).toBe(true);
    });

    it("should return false when length exceeds maximum", () => {
      expect(hasMaxLength("hello world", 5)).toBe(false);
    });

    it("should trim before checking length", () => {
      expect(hasMaxLength("  hello  ", 5)).toBe(true);
      expect(hasMaxLength("  hello world  ", 5)).toBe(false);
    });
  });

  describe("isLengthInRange", () => {
    it("should return true for null when min is 0", () => {
      expect(isLengthInRange(null, 0, 10)).toBe(true);
    });

    it("should return false for null when min is > 0", () => {
      expect(isLengthInRange(null, 1, 10)).toBe(false);
    });

    it("should return true when length is within range", () => {
      expect(isLengthInRange("hello", 3, 10)).toBe(true);
    });

    it("should return true when length equals minimum", () => {
      expect(isLengthInRange("hello", 5, 10)).toBe(true);
    });

    it("should return true when length equals maximum", () => {
      expect(isLengthInRange("hello", 3, 5)).toBe(true);
    });

    it("should return false when length is below minimum", () => {
      expect(isLengthInRange("hi", 5, 10)).toBe(false);
    });

    it("should return false when length is above maximum", () => {
      expect(isLengthInRange("hello world", 3, 5)).toBe(false);
    });

    it("should trim before checking length", () => {
      expect(isLengthInRange("  hello  ", 3, 10)).toBe(true);
      expect(isLengthInRange("  hi  ", 5, 10)).toBe(false);
    });
  });

  describe("sanitize", () => {
    it("should return empty string for null", () => {
      expect(sanitize(null)).toBe("");
    });

    it("should return empty string for undefined", () => {
      expect(sanitize(undefined)).toBe("");
    });

    it("should trim whitespace", () => {
      expect(sanitize("  hello  ")).toBe("hello");
    });

    it("should handle strings with no whitespace", () => {
      expect(sanitize("hello")).toBe("hello");
    });

    it("should return empty string for whitespace only", () => {
      expect(sanitize("   ")).toBe("");
    });

    it("should preserve internal whitespace", () => {
      expect(sanitize("  hello world  ")).toBe("hello world");
    });
  });
});

import { formatTimestamp, formatPrice, generateId } from "../formatting";

describe("formatTimestamp", () => {
  it("should format a valid timestamp", () => {
    const timestamp = new Date("2024-01-15T10:30:00").getTime();
    const result = formatTimestamp(timestamp);
    expect(result).toContain("Jan");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("should return empty string for null timestamp", () => {
    expect(formatTimestamp(null)).toBe("");
  });

  it("should return empty string for 0 timestamp", () => {
    expect(formatTimestamp(0)).toBe("");
  });
});

describe("formatPrice", () => {
  it("should format a number price", () => {
    expect(formatPrice(1.5)).toBe("$1.50");
  });

  it("should format a string price", () => {
    expect(formatPrice("2.75")).toBe("$2.75");
  });

  it("should handle zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("should handle null", () => {
    expect(formatPrice(null)).toBe("$0.00");
  });

  it("should handle undefined", () => {
    expect(formatPrice(undefined)).toBe("$0.00");
  });

  it("should handle invalid string", () => {
    expect(formatPrice("invalid")).toBe("$0.00");
  });

  it("should handle NaN", () => {
    expect(formatPrice(NaN)).toBe("$0.00");
  });

  it("should handle Infinity", () => {
    expect(formatPrice(Infinity)).toBe("$0.00");
  });

  it("should format decimal prices correctly", () => {
    expect(formatPrice(0.99)).toBe("$0.99");
    expect(formatPrice(99.99)).toBe("$99.99");
    expect(formatPrice(100.1)).toBe("$100.10");
  });
});

describe("generateId", () => {
  it("should generate a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("should generate unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("should use crypto.randomUUID when available", () => {
    const mockUUID = "123e4567-e89b-12d3-a456-426614174000";
    const originalCrypto = global.crypto;

    // Mock crypto.randomUUID
    const mockRandomUUID = jest.fn(() => mockUUID);
    Object.defineProperty(global, "crypto", {
      value: { randomUUID: mockRandomUUID },
      writable: true,
      configurable: true,
    });

    expect(generateId()).toBe(mockUUID);
    expect(mockRandomUUID).toHaveBeenCalled();

    // Restore original crypto
    global.crypto = originalCrypto;
  });

  it("should fallback to Math.random when crypto.randomUUID is not available", () => {
    const originalCrypto = global.crypto;

    // Remove crypto
    (global as any).crypto = undefined;

    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);

    // Restore original crypto
    global.crypto = originalCrypto;
  });
});

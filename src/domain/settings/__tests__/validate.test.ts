import { validateApiKey } from "../validate";

// Mock the openrouter module
jest.mock("@/lib/openrouter", () => ({
  isValidApiKeyFormat: jest.fn(),
}));

import { isValidApiKeyFormat } from "@/lib/openrouter";

const mockIsValidApiKeyFormat = isValidApiKeyFormat as jest.MockedFunction<
  typeof isValidApiKeyFormat
>;

describe("validateApiKey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return error when API key is empty string", () => {
    const result = validateApiKey("");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("API key is required");
  });

  it("should return error when API key is undefined", () => {
    const result = validateApiKey(undefined as any);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("API key is required");
  });

  it("should return error when API key is null", () => {
    const result = validateApiKey(null as any);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("API key is required");
  });

  it("should return error when API key is whitespace only", () => {
    const result = validateApiKey("   ");
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("API key is required");
  });

  it("should return error when API key format is invalid", () => {
    mockIsValidApiKeyFormat.mockReturnValue(false);

    const result = validateApiKey("invalid-key");

    expect(result.ok).toBe(false);
    expect(result.reason).toBe(
      "Invalid API key format. OpenRouter keys start with 'sk-or-v1-'",
    );
    expect(mockIsValidApiKeyFormat).toHaveBeenCalledWith("invalid-key");
  });

  it("should return success when API key format is valid", () => {
    mockIsValidApiKeyFormat.mockReturnValue(true);

    const result = validateApiKey("sk-or-v1-valid-key-123");

    expect(result.ok).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(mockIsValidApiKeyFormat).toHaveBeenCalledWith(
      "sk-or-v1-valid-key-123",
    );
  });

  it("should trim API key before validation", () => {
    mockIsValidApiKeyFormat.mockReturnValue(true);

    const result = validateApiKey("  sk-or-v1-valid-key-123  ");

    expect(result.ok).toBe(true);
    expect(mockIsValidApiKeyFormat).toHaveBeenCalledWith(
      "  sk-or-v1-valid-key-123  ",
    );
  });

  it("should handle API key with special characters", () => {
    mockIsValidApiKeyFormat.mockReturnValue(true);

    const result = validateApiKey("sk-or-v1-key-with-special-chars-!@#$");

    expect(result.ok).toBe(true);
    expect(mockIsValidApiKeyFormat).toHaveBeenCalledWith(
      "sk-or-v1-key-with-special-chars-!@#$",
    );
  });
});

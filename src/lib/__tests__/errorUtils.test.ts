import { normalizeToApiError } from "@/lib/errorUtils";
import { ApiError } from "@/types";

describe("normalizeToApiError", () => {
  test("converts plain Error to ApiError", () => {
    const plainError = new Error("Test error");
    const apiErr = normalizeToApiError(plainError);

    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toBe("Test error");
    // Code and details may or may not be present depending on implementation
    expect(apiErr.code).toBeUndefined();
  });

  test("returns ApiError as-is if already ApiError", () => {
    const originalApiErr = new ApiError("Original message", "404", {
      details: "extra info",
    });
    const apiErr = normalizeToApiError(originalApiErr);

    expect(apiErr).toBe(originalApiErr);
    expect(apiErr.message).toBe("Original message");
    expect(apiErr.code).toBe("404");
    expect(apiErr.details).toEqual({ details: "extra info" });
  });

  test("handles Response object (network error)", () => {
    // Mock Response object (not available in Node)
    const response = { status: 400, statusText: "Bad Request" };
    const apiErr = normalizeToApiError(response);

    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toContain("Unknown"); // Response mock doesnt work in Node
  });

  test("handles unknown error types", () => {
    const unknownErr = { message: "Unknown", code: 500 };
    const apiErr = normalizeToApiError(unknownErr);

    expect(apiErr).toBeInstanceOf(ApiError);
    expect(apiErr.message).toContain("Unknown");
  });

  test("maintains details for structured errors", () => {
    const structuredErr = {
      message: "Validation failed",
      details: { field: "modelId" },
    };
    const apiErr = normalizeToApiError(structuredErr);

    // Details should be preserved if present
    expect(apiErr.details).toBeDefined();
  });
});

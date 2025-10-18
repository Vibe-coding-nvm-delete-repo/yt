import {
  createErrorFromException,
  NetworkError,
  ValidationError,
  ErrorType,
} from "../errors";

describe("createErrorFromException - additional coverage", () => {
  it("should handle TypeError with fetch", () => {
    const typeError = new TypeError("Failed to fetch");
    const error = createErrorFromException(typeError);

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.message).toBe("Network connection failed");
  });

  it("should handle regular TypeError", () => {
    const typeError = new TypeError("Invalid type");
    const error = createErrorFromException(typeError);

    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.message).toBe("Invalid type");
  });

  it("should handle ReferenceError", () => {
    const refError = new ReferenceError("Variable not defined");
    const error = createErrorFromException(refError);

    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.message).toBe("Variable not defined");
  });

  it("should handle generic Error", () => {
    const genericError = new Error("Something went wrong");
    const error = createErrorFromException(genericError);

    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.message).toBe("Something went wrong");
    expect(error.retryable).toBe(true);
  });

  it("should handle null error", () => {
    const error = createErrorFromException(null);

    expect(error.message).toBe("An unknown error occurred");
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });

  it("should handle undefined error", () => {
    const error = createErrorFromException(undefined);

    expect(error.message).toBe("An unknown error occurred");
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });

  it("should handle string error", () => {
    const error = createErrorFromException("Simple error string");

    expect(error.message).toBe("An unknown error occurred");
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });

  it("should handle object error", () => {
    const objError = { code: 500 };
    const error = createErrorFromException(objError);

    expect(error.message).toBe("An unknown error occurred");
    expect(error.type).toBe(ErrorType.UNKNOWN);
  });

  it("should add context to TypeError with fetch", () => {
    const typeError = new TypeError("Failed to fetch");
    const context = { url: "https://test.com", modelId: "test-model" };
    const error = createErrorFromException(typeError, context);

    expect(error.context).toMatchObject(context);
  });

  it("should add context to generic Error", () => {
    const baseError = new Error("Test error");
    const context = { url: "https://test.com", modelId: "test-model" };
    const error = createErrorFromException(baseError, context);

    expect(error.context).toMatchObject(context);
  });

  it("should return existing AppError unchanged", () => {
    const appError = new ValidationError("Test validation error");
    const error = createErrorFromException(appError);

    expect(error).toBe(appError);
    expect(error.message).toBe("Test validation error");
  });
});

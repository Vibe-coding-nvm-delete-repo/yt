import { UsageStorage } from "../usage";
import type { UsageEntry } from "@/types/usage";

describe("UsageStorage", () => {
  let usageStorage: UsageStorage;

  beforeEach(() => {
    localStorage.clear();
    // Reset singleton instance for testing
    (UsageStorage as any).instance = undefined;
    usageStorage = UsageStorage.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("should add usage entry with image preview", () => {
    const entry: UsageEntry = {
      id: "test-1",
      timestamp: Date.now(),
      modelId: "test-model",
      modelName: "Test Model",
      inputTokens: 100,
      outputTokens: 200,
      inputCost: 0.001,
      outputCost: 0.002,
      totalCost: 0.003,
      success: true,
      error: null,
      imagePreview: "data:image/png;base64,test",
    };

    usageStorage.add(entry);

    const entries = usageStorage.list();
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject(entry);
    expect(entries[0]?.imagePreview).toBe("data:image/png;base64,test");
  });

  test("should notify subscribers when adding entry", () => {
    const callback = jest.fn();
    const unsubscribe = usageStorage.subscribe(callback);

    const entry: UsageEntry = {
      id: "test-2",
      timestamp: Date.now(),
      modelId: "test-model-2",
      modelName: "Test Model 2",
      inputTokens: 150,
      outputTokens: 250,
      inputCost: 0.0015,
      outputCost: 0.0025,
      totalCost: 0.004,
      success: true,
      error: null,
      imagePreview: "data:image/png;base64,test2",
    };

    usageStorage.add(entry);

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  test("should not notify unsubscribed callbacks", () => {
    const callback = jest.fn();
    const unsubscribe = usageStorage.subscribe(callback);
    unsubscribe();

    const entry: UsageEntry = {
      id: "test-3",
      timestamp: Date.now(),
      modelId: "test-model-3",
      modelName: "Test Model 3",
      inputTokens: 100,
      outputTokens: 200,
      inputCost: 0.001,
      outputCost: 0.002,
      totalCost: 0.003,
      success: true,
      error: null,
    };

    usageStorage.add(entry);

    expect(callback).not.toHaveBeenCalled();
  });

  test("should handle failed usage entries", () => {
    const entry: UsageEntry = {
      id: "test-4",
      timestamp: Date.now(),
      modelId: "test-model-4",
      modelName: "Test Model 4",
      inputTokens: 0,
      outputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      success: false,
      error: "API Error: Rate limit exceeded",
      imagePreview: "data:image/png;base64,test3",
    };

    usageStorage.add(entry);

    const entries = usageStorage.list();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.success).toBe(false);
    expect(entries[0]?.error).toBe("API Error: Rate limit exceeded");
    expect(entries[0]?.totalCost).toBe(0);
  });

  test("should list entries without filter", () => {
    const entry1: UsageEntry = {
      id: "test-5",
      timestamp: Date.now(),
      modelId: "model-a",
      modelName: "Model A",
      inputTokens: 100,
      outputTokens: 200,
      inputCost: 0.001,
      outputCost: 0.002,
      totalCost: 0.003,
      success: true,
      error: null,
    };

    const entry2: UsageEntry = {
      id: "test-6",
      timestamp: Date.now() + 1000,
      modelId: "model-b",
      modelName: "Model B",
      inputTokens: 150,
      outputTokens: 250,
      inputCost: 0.0015,
      outputCost: 0.0025,
      totalCost: 0.004,
      success: true,
      error: null,
    };

    usageStorage.add(entry1);
    usageStorage.add(entry2);

    const entries = usageStorage.list();
    expect(entries).toHaveLength(2);
  });
});

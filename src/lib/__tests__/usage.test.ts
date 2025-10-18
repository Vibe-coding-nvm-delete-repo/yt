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

  test("should filter entries by date range", () => {
    const now = Date.now();
    const entry1: UsageEntry = {
      id: "test-7",
      timestamp: now - 2000,
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
      id: "test-8",
      timestamp: now,
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

    const filtered = usageStorage.list({ from: now - 1000 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("test-8");
  });

  test("should filter entries by model ID", () => {
    const entry1: UsageEntry = {
      id: "test-9",
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
      id: "test-10",
      timestamp: Date.now(),
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

    const filtered = usageStorage.list({ modelIds: ["model-a"] });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.modelId).toBe("model-a");
  });

  test("should filter entries by date range and model ID", () => {
    const now = Date.now();
    const entry1: UsageEntry = {
      id: "test-11",
      timestamp: now - 2000,
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
      id: "test-12",
      timestamp: now,
      modelId: "model-a",
      modelName: "Model A",
      inputTokens: 150,
      outputTokens: 250,
      inputCost: 0.0015,
      outputCost: 0.0025,
      totalCost: 0.004,
      success: true,
      error: null,
    };

    const entry3: UsageEntry = {
      id: "test-13",
      timestamp: now,
      modelId: "model-b",
      modelName: "Model B",
      inputTokens: 200,
      outputTokens: 300,
      inputCost: 0.002,
      outputCost: 0.003,
      totalCost: 0.005,
      success: true,
      error: null,
    };

    usageStorage.add(entry1);
    usageStorage.add(entry2);
    usageStorage.add(entry3);

    const filtered = usageStorage.list({
      from: now - 1000,
      modelIds: ["model-a"],
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("test-12");
  });

  test("should filter entries with 'to' date", () => {
    const now = Date.now();
    const entry1: UsageEntry = {
      id: "test-14",
      timestamp: now - 2000,
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
      id: "test-15",
      timestamp: now,
      modelId: "model-a",
      modelName: "Model A",
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

    const filtered = usageStorage.list({ to: now - 1000 });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("test-14");
  });

  test("should clear all entries", () => {
    const entry: UsageEntry = {
      id: "test-16",
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

    usageStorage.add(entry);
    expect(usageStorage.list()).toHaveLength(1);

    usageStorage.clear();
    expect(usageStorage.list()).toHaveLength(0);
  });

  test("should cap entries at 1000", () => {
    // Add 1005 entries
    for (let i = 0; i < 1005; i++) {
      const entry: UsageEntry = {
        id: `test-${i}`,
        timestamp: Date.now() + i,
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
      usageStorage.add(entry);
    }

    const entries = usageStorage.list();
    expect(entries).toHaveLength(1000);
    // Should keep the most recent entries
    expect(entries[0]?.id).toBe("test-1004");
  });

    consoleErrorSpy.mockRestore();
  });

  test("should handle corrupted localStorage data", () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    localStorage.setItem("image-to-prompt-usage-history", "invalid json");

    // Reset singleton to trigger load
    (UsageStorage as any).instance = undefined;
    const storage = UsageStorage.getInstance();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Failed to load usage history:",
      expect.any(Error)
    );
    expect(storage.list()).toHaveLength(0);

    consoleWarnSpy.mockRestore();
  });

  test("should handle non-array entries in localStorage", () => {
    localStorage.setItem(
      "image-to-prompt-usage-history",
      JSON.stringify({ schemaVersion: 1, entries: "not-an-array" })
    );

    // Reset singleton to trigger load
    (UsageStorage as any).instance = undefined;
    const storage = UsageStorage.getInstance();

    expect(storage.list()).toHaveLength(0);
  });

  test("should persist to localStorage on add", () => {
    const entry: UsageEntry = {
      id: "test-18",
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

    usageStorage.add(entry);

    const stored = localStorage.getItem("image-to-prompt-usage-history");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].id).toBe("test-18");
  });

  test("should persist to localStorage on clear", () => {
    const entry: UsageEntry = {
      id: "test-19",
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

    usageStorage.add(entry);
    usageStorage.clear();

    const stored = localStorage.getItem("image-to-prompt-usage-history");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.entries).toHaveLength(0);
  });
});

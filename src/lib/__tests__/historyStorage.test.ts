import { HistoryStorage } from "../historyStorage";
import type { HistoryEntry } from "@/types/history";

// Helper function to create valid test HistoryEntry objects
const createTestHistoryEntry = (
  overrides: Partial<HistoryEntry> = {},
): HistoryEntry => ({
  id: `entry-${Date.now()}`,
  imageUrl: "",
  prompt: "test prompt",
  charCount: 100,
  totalCost: 0.01,
  inputTokens: 50,
  outputTokens: 50,
  inputCost: 0.005,
  outputCost: 0.005,
  modelId: "test-model",
  modelName: "Test Model",
  createdAt: Date.now(),
  ...overrides,
});

describe("HistoryStorage", () => {
  let storage: HistoryStorage;

  beforeEach(() => {
    localStorage.clear();
    (HistoryStorage as any).instance = undefined;
    storage = HistoryStorage.getInstance();
  });

  it("should return singleton instance", () => {
    const instance1 = HistoryStorage.getInstance();
    const instance2 = HistoryStorage.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should add history entry", () => {
    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "data:image/png;base64,test",
    });

    storage.addEntry(entry);
    const state = storage.getState();

    expect(state.entries).toHaveLength(1);
    expect(state.entries[0]?.id).toBe("entry-1");
  });

  it("should get state", () => {
    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    storage.addEntry(entry);
    const state = storage.getState();

    expect(Array.isArray(state.entries)).toBe(true);
    expect(state.entries.length).toBeGreaterThan(0);
  });

  it("should set filter model IDs", () => {
    storage.setFilterModelIds(["model-1", "model-2"]);
    const state = storage.getState();

    expect(state.filterModelIds).toEqual(["model-1", "model-2"]);
  });

  it("should get filter model IDs", () => {
    storage.setFilterModelIds(["model-1"]);
    const state = storage.getState();

    expect(state.filterModelIds).toEqual(["model-1"]);
  });

  it("should add multiple entries", () => {
    const entry1: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    const entry2: HistoryEntry = createTestHistoryEntry({
      id: "entry-2",
      createdAt: Date.now() - 1000,
      imageUrl: "",
    });

    storage.addEntry(entry1);
    storage.addEntry(entry2);

    const state = storage.getState();
    expect(state.entries.length).toBeGreaterThanOrEqual(2);
  });

  it("should subscribe to changes", () => {
    const callback = jest.fn();
    storage.subscribe(callback);

    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    storage.addEntry(entry);

    expect(callback).toHaveBeenCalled();
  });

  it("should unsubscribe from changes", () => {
    const callback = jest.fn();
    const unsubscribe = storage.subscribe(callback);

    callback.mockClear();
    unsubscribe();

    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    storage.addEntry(entry);

    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle localStorage errors gracefully", () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error("Quota exceeded");
    });

    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    expect(() => {
      storage.addEntry(entry);
    }).not.toThrow();

    Storage.prototype.setItem = originalSetItem;
  });

  it("should handle invalid JSON in localStorage", () => {
    localStorage.setItem("image-to-prompt-history-state", "invalid-json{");

    (HistoryStorage as any).instance = undefined;
    const newStorage = HistoryStorage.getInstance();

    const state = newStorage.getState();
    expect(state.entries).toEqual([]);
  });

  it("should limit entries to 25", () => {
    const entries: HistoryEntry[] = Array.from({ length: 30 }, (_, i) => ({
      id: `entry-${i}`,
      createdAt: Date.now() - i,
      imageUrl: "",
      prompt: "",
      charCount: 0,
      totalCost: 0,
      inputTokens: 0,
      outputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      modelId: "",
      modelName: "",
    }));

    entries.forEach((entry) => storage.addEntry(entry));

    const state = storage.getState();
    expect(state.entries.length).toBeLessThanOrEqual(25);
  });

  it("should handle non-array entries in localStorage", () => {
    localStorage.setItem(
      "image-to-prompt-history-state",
      JSON.stringify({ entries: "not-an-array", schemaVersion: 1 }),
    );

    (HistoryStorage as any).instance = undefined;
    const newStorage = HistoryStorage.getInstance();

    const state = newStorage.getState();
    expect(state.entries).toEqual([]);
  });

  it("should handle subscription callback errors gracefully", () => {
    const goodCallback = jest.fn();
    let callCount = 0;
    const badCallback = jest.fn(() => {
      callCount++;
      if (callCount > 1) {
        throw new Error("Callback error");
      }
    });

    storage.subscribe(goodCallback);
    storage.subscribe(badCallback);

    goodCallback.mockClear();
    badCallback.mockClear();

    const entry: HistoryEntry = createTestHistoryEntry({
      id: "entry-1",
      createdAt: Date.now(),
      imageUrl: "",
    });

    expect(() => {
      storage.addEntry(entry);
    }).not.toThrow();

    expect(goodCallback).toHaveBeenCalled();
    expect(badCallback).toHaveBeenCalled();
  });
});

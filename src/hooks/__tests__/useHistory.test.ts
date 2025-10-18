import { renderHook, act } from "@testing-library/react";
import { useHistory } from "../useHistory";
import { historyStorage } from "@/lib/historyStorage";
import type { HistoryEntry } from "@/types/history";

jest.mock("@/lib/historyStorage");

const mockHistoryStorage = historyStorage as jest.Mocked<typeof historyStorage>;

describe("useHistory", () => {
  const mockEntry1: HistoryEntry = {
    id: "entry-1",
    timestamp: Date.now(),
    modelId: "model-1",
    modelName: "Model 1",
    prompt: "Test prompt 1",
    imageUrl: "data:image/png;base64,test1",
  };

  const mockEntry2: HistoryEntry = {
    id: "entry-2",
    timestamp: Date.now() + 1000,
    modelId: "model-2",
    modelName: "Model 2",
    prompt: "Test prompt 2",
    imageUrl: "data:image/png;base64,test2",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHistoryStorage.getState.mockReturnValue({
      entries: [],
      filterModelIds: null,
      schemaVersion: 1,
    });
    mockHistoryStorage.subscribe.mockReturnValue(jest.fn());
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toEqual([]);
    expect(result.current.filterModelIds).toBeNull();
    expect(result.current.historyModelOptions).toEqual([]);
  });

  it("should load initial state from storage", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0]).toEqual(mockEntry1);
    expect(result.current.entries[1]).toEqual(mockEntry2);
  });

  it("should subscribe to storage updates on mount", () => {
    renderHook(() => useHistory());

    expect(mockHistoryStorage.subscribe).toHaveBeenCalledTimes(1);
    expect(mockHistoryStorage.subscribe).toHaveBeenCalledWith(
      expect.any(Function),
    );
  });

  it("should unsubscribe on unmount", () => {
    const unsubscribe = jest.fn();
    mockHistoryStorage.subscribe.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useHistory());

    expect(unsubscribe).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("should add entry via historyStorage", () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.addEntry(mockEntry1);
    });

    expect(mockHistoryStorage.addEntry).toHaveBeenCalledWith(mockEntry1);
  });

  it("should set filter model IDs", () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.setFilterModelIds(["model-1", "model-2"]);
    });

    expect(mockHistoryStorage.setFilterModelIds).toHaveBeenCalledWith([
      "model-1",
      "model-2",
    ]);
  });

  it("should filter entries by model IDs", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: ["model-1"],
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0]?.modelId).toBe("model-1");
  });

  it("should return all entries when filter is null", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(2);
  });

  it("should return all entries when filter is empty array", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: [],
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(2);
  });

  it("should extract unique model options from entries", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.historyModelOptions).toEqual([
      { id: "model-1", name: "Model 1" },
      { id: "model-2", name: "Model 2" },
    ]);
  });

  it("should deduplicate model options", () => {
    const duplicateEntry: HistoryEntry = {
      ...mockEntry1,
      id: "entry-3",
    };

    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2, duplicateEntry],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    // Should only have 2 unique models
    expect(result.current.historyModelOptions).toHaveLength(2);
  });

  it("should update state when storage notifies", () => {
    let subscribeCallback: ((state: any) => void) | null = null;
    mockHistoryStorage.subscribe.mockImplementation((callback) => {
      subscribeCallback = callback;
      return jest.fn();
    });

    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(1);

    // Simulate storage update
    const newState = {
      entries: [mockEntry1, mockEntry2],
      filterModelIds: null,
      schemaVersion: 1,
    };

    act(() => {
      if (subscribeCallback) {
        subscribeCallback(newState);
      }
    });

    expect(result.current.entries).toHaveLength(2);
  });

  it("should memoize filtered entries", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: ["model-1"],
      schemaVersion: 1,
    });

    const { result, rerender } = renderHook(() => useHistory());

    const firstEntries = result.current.entries;

    rerender();

    // Should be the same reference if nothing changed
    expect(result.current.entries).toBe(firstEntries);
  });

  it("should memoize history model options", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result, rerender } = renderHook(() => useHistory());

    const firstOptions = result.current.historyModelOptions;

    rerender();

    // Should be the same reference if nothing changed
    expect(result.current.historyModelOptions).toBe(firstOptions);
  });

  it("should handle empty entries for model options", () => {
    mockHistoryStorage.getState.mockReturnValue({
      entries: [],
      filterModelIds: null,
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.historyModelOptions).toEqual([]);
  });

  it("should filter entries with multiple model IDs", () => {
    const mockEntry3: HistoryEntry = {
      id: "entry-3",
      timestamp: Date.now() + 2000,
      modelId: "model-3",
      modelName: "Model 3",
      prompt: "Test prompt 3",
      imageUrl: "data:image/png;base64,test3",
    };

    mockHistoryStorage.getState.mockReturnValue({
      entries: [mockEntry1, mockEntry2, mockEntry3],
      filterModelIds: ["model-1", "model-3"],
      schemaVersion: 1,
    });

    const { result } = renderHook(() => useHistory());

    expect(result.current.entries).toHaveLength(2);
    expect(result.current.entries[0]?.modelId).toBe("model-1");
    expect(result.current.entries[1]?.modelId).toBe("model-3");
  });
});

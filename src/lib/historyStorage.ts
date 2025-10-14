import type { PersistedHistoryState, HistoryEntry } from "@/types/history";

const HISTORY_KEY = "image-to-prompt-history-state";

const DEFAULT_HISTORY_STATE: PersistedHistoryState = {
  entries: [],
  filterModelIds: [],
  schemaVersion: 1,
};

export class HistoryStorage {
  private static instance: HistoryStorage;
  private state: PersistedHistoryState;

  private constructor() {
    this.state = this.load();
  }

  static getInstance(): HistoryStorage {
    if (!HistoryStorage.instance) {
      HistoryStorage.instance = new HistoryStorage();
    }
    return HistoryStorage.instance;
  }

  private load(): PersistedHistoryState {
    if (typeof window === "undefined") return DEFAULT_HISTORY_STATE;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return DEFAULT_HISTORY_STATE;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_HISTORY_STATE,
        ...parsed,
        entries: Array.isArray(parsed?.entries)
          ? parsed.entries.slice(0, 200)
          : [],
        filterModelIds: Array.isArray(parsed?.filterModelIds)
          ? parsed.filterModelIds
          : [],
      } as PersistedHistoryState;
    } catch (e) {
      console.warn("Failed to load history state", e);
      return DEFAULT_HISTORY_STATE;
    }
  }

  private save(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.state));
      // optional: dispatch custom event in future
    } catch (e) {
      console.error("Failed to save history state", e);
    }
  }

  getState(): PersistedHistoryState {
    return { ...this.state, entries: [...this.state.entries] };
  }

  addEntry(entry: HistoryEntry): void {
    const next = [entry, ...this.state.entries].slice(0, 25);
    this.state = { ...this.state, entries: next };
    this.save();
  }

  setFilterModelIds(modelIds: string[]): void {
    this.state = {
      ...this.state,
      filterModelIds: Array.from(new Set(modelIds)),
    };
    this.save();
  }
}

export const historyStorage = HistoryStorage.getInstance();

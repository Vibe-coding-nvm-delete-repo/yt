import type { UsageEntry, UsageHistoryState, UsageFilter } from "@/types/usage";

const USAGE_KEY = "image-to-prompt-usage-history";

const DEFAULT_USAGE: UsageHistoryState = {
  schemaVersion: 1,
  entries: [],
};

export class UsageStorage {
  private static instance: UsageStorage;
  private state: UsageHistoryState;
  private subscribers: Set<() => void> = new Set();

  private constructor() {
    this.state = this.load();
  }

  static getInstance(): UsageStorage {
    if (!UsageStorage.instance) {
      UsageStorage.instance = new UsageStorage();
    }
    return UsageStorage.instance;
  }

  private load(): UsageHistoryState {
    if (typeof window === "undefined") return DEFAULT_USAGE;
    try {
      const raw = localStorage.getItem(USAGE_KEY);
      if (!raw) return DEFAULT_USAGE;
      const parsed = JSON.parse(raw);
      return {
        schemaVersion: 1,
        entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      };
    } catch (e) {
      console.warn("Failed to load usage history:", e);
      return DEFAULT_USAGE;
    }
  }

  private persist(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(this.state));
      this.notifySubscribers();
    } catch (e) {
      console.error("Failed to save usage history:", e);
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback());
  }

  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  add(entry: UsageEntry): void {
    this.state = {
      ...this.state,
      entries: [entry, ...this.state.entries].slice(0, 1000), // cap to prevent unbounded growth
    };
    this.persist();
  }

  list(filter?: UsageFilter): UsageEntry[] {
    const entries = this.state.entries;
    if (!filter) return entries;
    return entries.filter((e) => {
      const inFrom = filter.from ? e.timestamp >= filter.from : true;
      const inTo = filter.to ? e.timestamp <= filter.to : true;
      const inModel = filter.modelIds?.length
        ? filter.modelIds.includes(e.modelId)
        : true;
      return inFrom && inTo && inModel;
    });
  }

  clear(): void {
    this.state = { ...DEFAULT_USAGE };
    this.persist();
  }
}

export const usageStorage = UsageStorage.getInstance();

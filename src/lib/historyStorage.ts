// import { imageStateStorage } from './storage';
import type { PersistedHistoryState, HistoryEntry } from "@/types/history";

const HISTORY_KEY = "image-to-prompt-history-state";

const DEFAULT_HISTORY_STATE: PersistedHistoryState = {
  entries: [],
  filterModelIds: [],
  schemaVersion: 1,
};

type SubscriptionCallback = (state: PersistedHistoryState) => void;
type UnsubscribeFunction = () => void;

interface Subscription {
  id: string;
  callback: SubscriptionCallback;
}

export class HistoryStorage {
  private static instance: HistoryStorage;
  private state: PersistedHistoryState;
  private subscriptions = new Map<string, Subscription>();
  private subscriptionCounter = 0;

  private constructor() {
    this.state = this.load();

    // Listen for storage events from other tabs/windows
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
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
      this.notifySubscribers();

      // Dispatch custom event for cross-tab synchronization
      const event = new CustomEvent(HISTORY_STORAGE_EVENTS.HISTORY_UPDATED, {
        detail: this.state,
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error("Failed to save history state", e);
    }
  }

  private notifySubscribers(): void {
    this.subscriptions.forEach((sub) => {
      try {
        sub.callback({ ...this.state, entries: [...this.state.entries] });
      } catch (error) {
        console.error("Subscription callback error:", error);
      }
    });
  }

  subscribe(callback: SubscriptionCallback): UnsubscribeFunction {
    const id = `sub-${++this.subscriptionCounter}`;
    this.subscriptions.set(id, { id, callback });

    // Call immediately with current value
    callback({ ...this.state, entries: [...this.state.entries] });

    return () => {
      this.subscriptions.delete(id);
    };
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

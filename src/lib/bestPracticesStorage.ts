import type { BestPractice, BestPracticeCategory } from "@/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { now as getCurrentTime } from "@/utils/timeHelpers";

const STORAGE_KEY = STORAGE_KEYS.BEST_PRACTICES;

export const BEST_PRACTICES_EVENTS = {
  PRACTICES_UPDATED: `${STORAGE_KEYS.BEST_PRACTICES}-updated`,
} as const;

type SubscriptionCallback = (practices: BestPractice[]) => void;
type UnsubscribeFunction = () => void;

interface Subscription {
  id: string;
  callback: SubscriptionCallback;
}

export class BestPracticesStorage {
  private static instance: BestPracticesStorage;
  private practices: BestPractice[] = [];
  private subscriptions = new Map<string, Subscription>();
  private subscriptionCounter = 0;

  private constructor() {
    this.practices = this.loadPractices();

    // Listen for storage events from other tabs/windows
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageEvent.bind(this));
    }
  }

  static getInstance(): BestPracticesStorage {
    if (!BestPracticesStorage.instance) {
      BestPracticesStorage.instance = new BestPracticesStorage();
    }
    return BestPracticesStorage.instance;
  }

  private loadPractices(): BestPractice[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Failed to load best practices from storage:", error);
      return [];
    }
  }

  private savePractices(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.practices));
      this.notifySubscribers();

      // Dispatch custom event for cross-tab synchronization
      const event = new CustomEvent(BEST_PRACTICES_EVENTS.PRACTICES_UPDATED, {
        detail: this.practices,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to save best practices to storage:", error);
    }
  }

  private handleStorageEvent(event: StorageEvent): void {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        this.practices = Array.isArray(parsed) ? parsed : [];
        this.notifySubscribers();
      } catch (error) {
        console.error("Failed to handle storage event:", error);
      }
    }
  }

  private notifySubscribers(): void {
    this.subscriptions.forEach((sub) => {
      try {
        sub.callback([...this.practices]);
      } catch (error) {
        console.error("Subscription callback error:", error);
      }
    });
  }

  subscribe(callback: SubscriptionCallback): UnsubscribeFunction {
    const id = `sub-${++this.subscriptionCounter}`;
    this.subscriptions.set(id, { id, callback });

    // Call immediately with current value
    callback([...this.practices]);

    return () => {
      this.subscriptions.delete(id);
    };
  }

  getPractices(): BestPractice[] {
    return [...this.practices];
  }

  getPracticesByCategory(category: BestPracticeCategory): BestPractice[] {
    return this.practices.filter((p) => p.category === category);
  }

  getPracticeById(id: string): BestPractice | null {
    return this.practices.find((p) => p.id === id) || null;
  }

  createPractice(
    practice: Omit<BestPractice, "id" | "createdAt" | "updatedAt">,
  ): BestPractice {
    const timestamp = getCurrentTime();
    const newPractice: BestPractice = {
      ...practice,
      id: `bp-${timestamp}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.practices.push(newPractice);
    this.savePractices();

    return newPractice;
  }

  updatePractice(
    id: string,
    updates: Partial<Omit<BestPractice, "id" | "createdAt">>,
  ): BestPractice | null {
    const index = this.practices.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }

    const currentPractice = this.practices[index];
    if (!currentPractice) {
      return null;
    }

    const updatedPractice: BestPractice = {
      ...currentPractice,
      ...updates,
      id: currentPractice.id, // Ensure ID doesn't change
      createdAt: currentPractice.createdAt, // Ensure createdAt doesn't change
      updatedAt: getCurrentTime(),
    };

    this.practices[index] = updatedPractice;
    this.savePractices();

    return updatedPractice;
  }

  deletePractice(id: string): boolean {
    const index = this.practices.findIndex((p) => p.id === id);
    if (index === -1) {
      return false;
    }

    this.practices.splice(index, 1);
    this.savePractices();

    return true;
  }

  clearAllPractices(): void {
    this.practices = [];
    this.savePractices();
  }
}

// Singleton instance
export const bestPracticesStorage = BestPracticesStorage.getInstance();

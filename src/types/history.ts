export interface HistoryEntry {
  id: string;
  imageUrl: string; // data URL or persisted URL
  prompt: string;
  charCount: number; // 0-1500
  totalCost: number; // currency in USD
  modelId: string;
  modelName: string;
  createdAt: number; // epoch ms
}

export interface PersistedHistoryState {
  entries: HistoryEntry[];
  filterModelIds: string[]; // persisted filter selection
  schemaVersion: 1;
}

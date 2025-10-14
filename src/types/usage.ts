export interface UsageEntry {
  id: string;
  timestamp: number;
  modelId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  success: boolean;
  error: string | null;
  imagePreview?: string; // Base64 data URL of the image used
}

export interface UsageHistoryState {
  schemaVersion: 1;
  entries: UsageEntry[];
}

export interface UsageFilter {
  from?: number;
  to?: number;
  modelIds?: string[];
}

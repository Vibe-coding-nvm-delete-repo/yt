export interface UsageEntry {
  id: string;
  timestamp: number;
  modelId: string;
  modelName: string;
  inputTokens: number; // images mapped to token-equivalent if applicable
  outputTokens: number; // prompt characters mapped to tokens
  inputCost: number;
  outputCost: number;
  totalCost: number;
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

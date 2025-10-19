/**
 * Leonardo.AI Storage Utilities
 * localStorage-based storage following existing patterns
 */

import type {
  LeonardoImageConfig,
  LeonardoPreset,
  LeonardoConfigHistoryEntry,
  LeonardoOutputEntry,
  LeonardoStorageData,
  LeonardoExportData,
} from "@/types/leonardo";

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEY_PREFIX = "leonardo-ai";
const CONFIG_KEY = `${STORAGE_KEY_PREFIX}-config`;
const PRESETS_KEY = `${STORAGE_KEY_PREFIX}-presets`;
const HISTORY_KEY = `${STORAGE_KEY_PREFIX}-history`;
const OUTPUTS_KEY = `${STORAGE_KEY_PREFIX}-outputs`;

const MAX_HISTORY_ENTRIES = 100;
const MAX_OUTPUT_ENTRIES = 200;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const clone = <T>(value: T): T => {
  const cloner = (
    globalThis as typeof globalThis & {
      structuredClone?: <U>(input: U) => U;
    }
  ).structuredClone;
  if (typeof cloner === "function") {
    return cloner(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const safeJSONParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const getDefaultLeonardoConfig = (): LeonardoImageConfig => ({
  style: "photorealistic",
  subject: "landscape",
  mood: ["serene-calm"],
  composition: {
    technique: "rule-of-thirds",
    focalPoint: "center",
    negativeSpaceRatio: 40,
    visualFlow: "horizontal",
  },
  lighting: {
    primarySource: "natural-daylight",
    direction: "side",
    colorTemperature: 5500,
    exposureMood: "balanced",
    quality: "soft",
  },
  texture: {
    dominant: "organic-natural",
    surfacePatina: "pristine-new",
  },
  technical: {
    depthOfField: "f/5.6",
    focusPriority: "midground",
    filmGrain: false,
    lensFlare: false,
    vignetting: false,
    resolution: "4k",
    aspectRatio: "16:9",
  },
  negativePrompt: [
    "people",
    "person",
    "human",
    "face",
    "hands",
    "text",
    "watermark",
  ],
  schemaVersion: 1,
});

// ============================================================================
// LEONARDO CONFIG STORAGE
// ============================================================================

export class LeonardoConfigStorage {
  private static instance: LeonardoConfigStorage;

  static getInstance(): LeonardoConfigStorage {
    if (!LeonardoConfigStorage.instance) {
      LeonardoConfigStorage.instance = new LeonardoConfigStorage();
    }
    return LeonardoConfigStorage.instance;
  }

  load(): LeonardoImageConfig | null {
    const storage = getStorage();
    if (!storage) return null;

    const json = storage.getItem(CONFIG_KEY);
    if (!json) return null;

    return safeJSONParse<LeonardoImageConfig | null>(json, null);
  }

  save(config: LeonardoImageConfig): void {
    const storage = getStorage();
    if (!storage) return;

    const normalized = {
      ...clone(config),
      schemaVersion: 1 as const,
    };

    storage.setItem(CONFIG_KEY, JSON.stringify(normalized));
  }

  update(partial: Partial<LeonardoImageConfig>): void {
    const current = this.load() || getDefaultLeonardoConfig();
    this.save({ ...current, ...partial });
  }

  clear(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(CONFIG_KEY);
  }
}

// ============================================================================
// LEONARDO PRESETS STORAGE
// ============================================================================

export class LeonardoPresetsStorage {
  private static instance: LeonardoPresetsStorage;

  static getInstance(): LeonardoPresetsStorage {
    if (!LeonardoPresetsStorage.instance) {
      LeonardoPresetsStorage.instance = new LeonardoPresetsStorage();
    }
    return LeonardoPresetsStorage.instance;
  }

  loadAll(): Record<string, LeonardoPreset> {
    const storage = getStorage();
    if (!storage) return {};

    const json = storage.getItem(PRESETS_KEY);
    return safeJSONParse<Record<string, LeonardoPreset>>(json, {});
  }

  load(id: string): LeonardoPreset | null {
    const presets = this.loadAll();
    return presets[id] || null;
  }

  save(preset: LeonardoPreset): void {
    const storage = getStorage();
    if (!storage) return;

    const presets = this.loadAll();
    const normalized = {
      ...clone(preset),
      updatedAt: Date.now(),
    };

    presets[preset.id] = normalized;
    storage.setItem(PRESETS_KEY, JSON.stringify(presets));
  }

  delete(id: string): void {
    const storage = getStorage();
    if (!storage) return;

    const presets = this.loadAll();
    delete presets[id];
    storage.setItem(PRESETS_KEY, JSON.stringify(presets));
  }

  list(): LeonardoPreset[] {
    const presets = this.loadAll();
    return Object.values(presets).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  clear(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(PRESETS_KEY);
  }
}

// ============================================================================
// LEONARDO HISTORY STORAGE
// ============================================================================

export class LeonardoHistoryStorage {
  private static instance: LeonardoHistoryStorage;

  static getInstance(): LeonardoHistoryStorage {
    if (!LeonardoHistoryStorage.instance) {
      LeonardoHistoryStorage.instance = new LeonardoHistoryStorage();
    }
    return LeonardoHistoryStorage.instance;
  }

  loadAll(): LeonardoConfigHistoryEntry[] {
    const storage = getStorage();
    if (!storage) return [];

    const json = storage.getItem(HISTORY_KEY);
    return safeJSONParse<LeonardoConfigHistoryEntry[]>(json, []);
  }

  add(entry: LeonardoConfigHistoryEntry): void {
    const storage = getStorage();
    if (!storage) return;

    const history = this.loadAll();
    const normalized = clone(entry);

    // Add to front of array
    history.unshift(normalized);

    // Trim to max entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES);
    }

    storage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  update(id: string, updates: Partial<LeonardoConfigHistoryEntry>): void {
    const storage = getStorage();
    if (!storage) return;

    const history = this.loadAll();
    const index = history.findIndex((entry) => entry.id === id);

    if (index !== -1) {
      // With exactOptionalPropertyTypes: true, we need to ensure the result
      // maintains the required properties from the original entry
      history[index] = { ...history[index], ...updates } as LeonardoConfigHistoryEntry;
      storage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }

  delete(id: string): void {
    const storage = getStorage();
    if (!storage) return;

    const history = this.loadAll();
    const filtered = history.filter((entry) => entry.id !== id);
    storage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  }

  clear(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(HISTORY_KEY);
  }
}

// ============================================================================
// LEONARDO OUTPUTS STORAGE
// ============================================================================

export class LeonardoOutputsStorage {
  private static instance: LeonardoOutputsStorage;

  static getInstance(): LeonardoOutputsStorage {
    if (!LeonardoOutputsStorage.instance) {
      LeonardoOutputsStorage.instance = new LeonardoOutputsStorage();
    }
    return LeonardoOutputsStorage.instance;
  }

  loadAll(): LeonardoOutputEntry[] {
    const storage = getStorage();
    if (!storage) return [];

    const json = storage.getItem(OUTPUTS_KEY);
    return safeJSONParse<LeonardoOutputEntry[]>(json, []);
  }

  add(entry: LeonardoOutputEntry): void {
    const storage = getStorage();
    if (!storage) return;

    const outputs = this.loadAll();
    const normalized = clone(entry);

    // Add to front of array
    outputs.unshift(normalized);

    // Trim to max entries
    if (outputs.length > MAX_OUTPUT_ENTRIES) {
      outputs.splice(MAX_OUTPUT_ENTRIES);
    }

    storage.setItem(OUTPUTS_KEY, JSON.stringify(outputs));
  }

  update(id: string, updates: Partial<LeonardoOutputEntry>): void {
    const storage = getStorage();
    if (!storage) return;

    const outputs = this.loadAll();
    const index = outputs.findIndex((entry) => entry.id === id);

    if (index !== -1) {
      // With exactOptionalPropertyTypes: true, we need to ensure the result
      // maintains the required properties from the original entry
      outputs[index] = { ...outputs[index], ...updates } as LeonardoOutputEntry;
      storage.setItem(OUTPUTS_KEY, JSON.stringify(outputs));
    }
  }

  delete(id: string): void {
    const storage = getStorage();
    if (!storage) return;

    const outputs = this.loadAll();
    const filtered = outputs.filter((entry) => entry.id !== id);
    storage.setItem(OUTPUTS_KEY, JSON.stringify(filtered));
  }

  clear(): void {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(OUTPUTS_KEY);
  }
}

// ============================================================================
// EXPORT/IMPORT UTILITIES
// ============================================================================

export const exportLeonardoData = (): LeonardoExportData => {
  const configStorage = LeonardoConfigStorage.getInstance();
  const presetsStorage = LeonardoPresetsStorage.getInstance();
  const historyStorage = LeonardoHistoryStorage.getInstance();
  const outputsStorage = LeonardoOutputsStorage.getInstance();

  const currentConfig = configStorage.load();
  
  // With exactOptionalPropertyTypes: true, we conditionally include
  // currentConfig only when it has a value
  return {
    ...(currentConfig ? { currentConfig } : {}),
    presets: presetsStorage.loadAll(),
    history: historyStorage.loadAll(),
    outputs: outputsStorage.loadAll(),
    schemaVersion: 1,
    lastModified: Date.now(),
    exportedAt: Date.now(),
    exportVersion: "1.0.0",
  };
};

export const importLeonardoData = (
  data: LeonardoExportData,
  mode: "replace" | "merge" = "replace",
): void => {
  const configStorage = LeonardoConfigStorage.getInstance();
  const presetsStorage = LeonardoPresetsStorage.getInstance();
  const historyStorage = LeonardoHistoryStorage.getInstance();
  const outputsStorage = LeonardoOutputsStorage.getInstance();

  if (mode === "replace") {
    // Clear existing data
    configStorage.clear();
    presetsStorage.clear();
    historyStorage.clear();
    outputsStorage.clear();
  }

  // Import config
  if (data.currentConfig) {
    configStorage.save(data.currentConfig);
  }

  // Import presets
  if (data.presets) {
    Object.values(data.presets).forEach((preset) => {
      presetsStorage.save(preset);
    });
  }

  // Import history (merge mode: deduplicate by id)
  if (data.history) {
    if (mode === "merge") {
      const existing = historyStorage.loadAll();
      const existingIds = new Set(existing.map((e) => e.id));
      const newEntries = data.history.filter((e) => !existingIds.has(e.id));
      newEntries.forEach((entry) => historyStorage.add(entry));
    } else {
      data.history.forEach((entry) => historyStorage.add(entry));
    }
  }

  // Import outputs (merge mode: deduplicate by id)
  if (data.outputs) {
    if (mode === "merge") {
      const existing = outputsStorage.loadAll();
      const existingIds = new Set(existing.map((e) => e.id));
      const newEntries = data.outputs.filter((e) => !existingIds.has(e.id));
      newEntries.forEach((entry) => outputsStorage.add(entry));
    } else {
      data.outputs.forEach((entry) => outputsStorage.add(entry));
    }
  }
};

// ============================================================================
// SINGLETON EXPORTS
// ============================================================================

export const leonardoConfigStorage = LeonardoConfigStorage.getInstance();
export const leonardoPresetsStorage = LeonardoPresetsStorage.getInstance();
export const leonardoHistoryStorage = LeonardoHistoryStorage.getInstance();
export const leonardoOutputsStorage = LeonardoOutputsStorage.getInstance();

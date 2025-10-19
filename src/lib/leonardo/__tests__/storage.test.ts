/**
 * Tests for Leonardo.AI Storage
 */

import {
  leonardoConfigStorage,
  leonardoPresetsStorage,
  leonardoHistoryStorage,
  leonardoOutputsStorage,
  getDefaultLeonardoConfig,
  exportLeonardoData,
  importLeonardoData,
} from "../storage";
import type {
  LeonardoImageConfig,
  LeonardoPreset,
  LeonardoConfigHistoryEntry,
  LeonardoOutputEntry,
} from "@/types/leonardo";

describe("Leonardo Storage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe("leonardoConfigStorage", () => {
    it("should return null when no config exists", () => {
      const config = leonardoConfigStorage.load();
      expect(config).toBeNull();
    });

    it("should save and load config", () => {
      const config = getDefaultLeonardoConfig();
      leonardoConfigStorage.save(config);

      const loaded = leonardoConfigStorage.load();
      expect(loaded).toEqual(config);
    });

    it("should update config", () => {
      const config = getDefaultLeonardoConfig();
      leonardoConfigStorage.save(config);

      leonardoConfigStorage.update({ style: "cinematic" });

      const loaded = leonardoConfigStorage.load();
      expect(loaded?.style).toBe("cinematic");
    });

    it("should clear config", () => {
      const config = getDefaultLeonardoConfig();
      leonardoConfigStorage.save(config);
      leonardoConfigStorage.clear();

      const loaded = leonardoConfigStorage.load();
      expect(loaded).toBeNull();
    });
  });

  describe("leonardoPresetsStorage", () => {
    const mockPreset: LeonardoPreset = {
      id: "test-preset-1",
      name: "Test Preset",
      description: "A test preset",
      config: getDefaultLeonardoConfig(),
      category: "custom",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it("should return empty object when no presets exist", () => {
      const presets = leonardoPresetsStorage.loadAll();
      expect(presets).toEqual({});
    });

    it("should save and load preset", () => {
      leonardoPresetsStorage.save(mockPreset);

      const loaded = leonardoPresetsStorage.load(mockPreset.id);
      expect(loaded).toEqual(expect.objectContaining({
        id: mockPreset.id,
        name: mockPreset.name,
      }));
    });

    it("should list all presets sorted by updatedAt", () => {
      const preset1 = { ...mockPreset, id: "preset-1", updatedAt: 1000 };
      const preset2 = { ...mockPreset, id: "preset-2", updatedAt: 2000 };

      leonardoPresetsStorage.save(preset1);
      leonardoPresetsStorage.save(preset2);

      const list = leonardoPresetsStorage.list();
      expect(list).toHaveLength(2);
      expect(list[0]?.id).toBe("preset-2"); // Most recent first
    });

    it("should delete preset", () => {
      leonardoPresetsStorage.save(mockPreset);
      leonardoPresetsStorage.delete(mockPreset.id);

      const loaded = leonardoPresetsStorage.load(mockPreset.id);
      expect(loaded).toBeNull();
    });

    it("should clear all presets", () => {
      leonardoPresetsStorage.save(mockPreset);
      leonardoPresetsStorage.clear();

      const presets = leonardoPresetsStorage.loadAll();
      expect(presets).toEqual({});
    });
  });

  describe("leonardoHistoryStorage", () => {
    const mockHistoryEntry: LeonardoConfigHistoryEntry = {
      id: "history-1",
      config: getDefaultLeonardoConfig(),
      generatedPrompt: "Test prompt",
      timestamp: Date.now(),
      usageCount: 1,
    };

    it("should return empty array when no history exists", () => {
      const history = leonardoHistoryStorage.loadAll();
      expect(history).toEqual([]);
    });

    it("should add history entry to front of array", () => {
      const entry1 = { ...mockHistoryEntry, id: "entry-1" };
      const entry2 = { ...mockHistoryEntry, id: "entry-2" };

      leonardoHistoryStorage.add(entry1);
      leonardoHistoryStorage.add(entry2);

      const history = leonardoHistoryStorage.loadAll();
      expect(history[0]?.id).toBe("entry-2"); // Most recent first
      expect(history[1]?.id).toBe("entry-1");
    });

    it("should limit history to MAX_HISTORY_ENTRIES", () => {
      // Add more than max entries
      for (let i = 0; i < 105; i++) {
        leonardoHistoryStorage.add({
          ...mockHistoryEntry,
          id: `entry-${i}`,
        });
      }

      const history = leonardoHistoryStorage.loadAll();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it("should update history entry", () => {
      leonardoHistoryStorage.add(mockHistoryEntry);
      leonardoHistoryStorage.update(mockHistoryEntry.id, { usageCount: 5 });

      const history = leonardoHistoryStorage.loadAll();
      expect(history[0]?.usageCount).toBe(5);
    });

    it("should delete history entry", () => {
      leonardoHistoryStorage.add(mockHistoryEntry);
      leonardoHistoryStorage.delete(mockHistoryEntry.id);

      const history = leonardoHistoryStorage.loadAll();
      expect(history).toHaveLength(0);
    });
  });

  describe("leonardoOutputsStorage", () => {
    const mockOutput: LeonardoOutputEntry = {
      id: "output-1",
      configId: "config-1",
      prompt: "Test prompt",
      timestamp: Date.now(),
    };

    it("should return empty array when no outputs exist", () => {
      const outputs = leonardoOutputsStorage.loadAll();
      expect(outputs).toEqual([]);
    });

    it("should add output entry to front of array", () => {
      const output1 = { ...mockOutput, id: "output-1" };
      const output2 = { ...mockOutput, id: "output-2" };

      leonardoOutputsStorage.add(output1);
      leonardoOutputsStorage.add(output2);

      const outputs = leonardoOutputsStorage.loadAll();
      expect(outputs[0]?.id).toBe("output-2"); // Most recent first
    });

    it("should limit outputs to MAX_OUTPUT_ENTRIES", () => {
      // Add more than max entries
      for (let i = 0; i < 205; i++) {
        leonardoOutputsStorage.add({
          ...mockOutput,
          id: `output-${i}`,
        });
      }

      const outputs = leonardoOutputsStorage.loadAll();
      expect(outputs.length).toBeLessThanOrEqual(200);
    });

    it("should update output entry rating", () => {
      leonardoOutputsStorage.add(mockOutput);
      leonardoOutputsStorage.update(mockOutput.id, { rating: 5 });

      const outputs = leonardoOutputsStorage.loadAll();
      expect(outputs[0]?.rating).toBe(5);
    });
  });

  describe("exportLeonardoData", () => {
    it("should export all Leonardo data", () => {
      const config = getDefaultLeonardoConfig();
      leonardoConfigStorage.save(config);

      const preset: LeonardoPreset = {
        id: "preset-1",
        name: "Test",
        description: "Test",
        config,
        category: "custom",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      leonardoPresetsStorage.save(preset);

      const exported = exportLeonardoData();

      expect(exported).toEqual(
        expect.objectContaining({
          currentConfig: expect.any(Object),
          presets: expect.any(Object),
          history: expect.any(Array),
          outputs: expect.any(Array),
          schemaVersion: 1,
          exportVersion: "1.0.0",
        }),
      );
    });
  });

  describe("importLeonardoData", () => {
    it("should import data in replace mode", () => {
      const exportedData = exportLeonardoData();
      exportedData.currentConfig = getDefaultLeonardoConfig();

      leonardoConfigStorage.clear();
      importLeonardoData(exportedData, "replace");

      const config = leonardoConfigStorage.load();
      expect(config).toBeTruthy();
    });

    it("should import data in merge mode", () => {
      const preset1: LeonardoPreset = {
        id: "preset-1",
        name: "Preset 1",
        description: "Test",
        config: getDefaultLeonardoConfig(),
        category: "custom",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      leonardoPresetsStorage.save(preset1);

      const exportedData = exportLeonardoData();
      const preset2: LeonardoPreset = {
        id: "preset-2",
        name: "Preset 2",
        description: "Test",
        config: getDefaultLeonardoConfig(),
        category: "custom",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      exportedData.presets["preset-2"] = preset2;

      importLeonardoData(exportedData, "merge");

      const presets = leonardoPresetsStorage.list();
      expect(presets.length).toBeGreaterThanOrEqual(2);
    });
  });
});

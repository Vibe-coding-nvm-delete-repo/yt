"use client";

import React, { useState, useEffect } from "react";
import type { LeonardoImageConfig, LeonardoPreset } from "@/types/leonardo";
import {
  leonardoConfigStorage,
  leonardoPresetsStorage,
  leonardoHistoryStorage,
  leonardoOutputsStorage,
  getDefaultLeonardoConfig,
  exportLeonardoData,
} from "@/lib/leonardo/storage";
import { StyleMoodTab } from "./tabs/StyleMoodTab";
import { CompositionTab } from "./tabs/CompositionTab";
import { LightingTab } from "./tabs/LightingTab";
import { ColorTextureTab } from "./tabs/ColorTextureTab";
import { AdvancedTab } from "./tabs/AdvancedTab";
import { HistoryOutputsTab } from "./tabs/HistoryOutputsTab";
import { PreviewExportTab } from "./tabs/PreviewExportTab";

type TabName =
  | "style-mood"
  | "composition"
  | "lighting"
  | "color-texture"
  | "advanced"
  | "history"
  | "preview";

export const LeonardoSettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>("style-mood");
  const [config, setConfig] = useState<LeonardoImageConfig>(() => {
    const saved = leonardoConfigStorage.load();
    return saved || getDefaultLeonardoConfig();
  });
  const [history, setHistory] = useState(() => leonardoHistoryStorage.loadAll());
  const [outputs, setOutputs] = useState(() => leonardoOutputsStorage.loadAll());

  // Save config whenever it changes
  useEffect(() => {
    leonardoConfigStorage.save(config);
  }, [config]);

  const handleConfigChange = (updates: Partial<LeonardoImageConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSavePreset = (name: string) => {
    const preset: LeonardoPreset = {
      id: `preset-${Date.now()}`,
      name,
      description: `Saved on ${new Date().toLocaleDateString()}`,
      config,
      category: "custom",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    leonardoPresetsStorage.save(preset);
    alert(`Preset "${name}" saved!`);
  };

  const handleExport = async () => {
    const data = exportLeonardoData();
    const json = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      alert("Configuration exported to clipboard!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to copy to clipboard");
    }
  };

  const handleImport = (jsonText: string) => {
    try {
      const data = JSON.parse(jsonText);
      if (data.currentConfig) {
        setConfig(data.currentConfig);
        alert("Configuration imported!");
      }
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import: Invalid JSON");
    }
  };

  const handleLoadHistory = (entry: typeof history[0]) => {
    setConfig(entry.config);
    setActiveTab("preview");
  };

  const handleRateOutput = (id: string, rating: 1 | 2 | 3 | 4 | 5) => {
    leonardoOutputsStorage.update(id, { rating });
    setOutputs(leonardoOutputsStorage.loadAll());
  };

  const handleDeleteHistory = (id: string) => {
    leonardoHistoryStorage.delete(id);
    setHistory(leonardoHistoryStorage.loadAll());
  };

  const handleDeleteOutput = (id: string) => {
    leonardoOutputsStorage.delete(id);
    setOutputs(leonardoOutputsStorage.loadAll());
  };

  const handleReset = () => {
    if (confirm("Reset to default configuration?")) {
      setConfig(getDefaultLeonardoConfig());
    }
  };

  const tabs = [
    { id: "style-mood" as const, label: "Style & Mood" },
    { id: "composition" as const, label: "Composition" },
    { id: "lighting" as const, label: "Lighting" },
    { id: "color-texture" as const, label: "Color & Texture" },
    { id: "advanced" as const, label: "Advanced" },
    { id: "history" as const, label: "History & Outputs" },
    { id: "preview" as const, label: "Preview & Export" },
  ];

  return (
    <div className="space-y-6 rounded-xl bg-[#151A21] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Leonardo.AI Configuration
          </h2>
          <p className="text-sm text-gray-400">
            Generate optimized prompts for Leonardo.AI image generation
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
        >
          Reset
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "style-mood" && (
          <StyleMoodTab config={config} onChange={handleConfigChange} />
        )}
        {activeTab === "composition" && (
          <CompositionTab config={config} onChange={handleConfigChange} />
        )}
        {activeTab === "lighting" && (
          <LightingTab config={config} onChange={handleConfigChange} />
        )}
        {activeTab === "color-texture" && (
          <ColorTextureTab config={config} onChange={handleConfigChange} />
        )}
        {activeTab === "advanced" && (
          <AdvancedTab config={config} onChange={handleConfigChange} />
        )}
        {activeTab === "history" && (
          <HistoryOutputsTab
            history={history}
            outputs={outputs}
            onLoadHistory={handleLoadHistory}
            onRateOutput={handleRateOutput}
            onDeleteHistory={handleDeleteHistory}
            onDeleteOutput={handleDeleteOutput}
          />
        )}
        {activeTab === "preview" && (
          <PreviewExportTab
            config={config}
            onChange={handleConfigChange}
            onSavePreset={handleSavePreset}
            onExport={handleExport}
            onImport={handleImport}
          />
        )}
      </div>
    </div>
  );
};

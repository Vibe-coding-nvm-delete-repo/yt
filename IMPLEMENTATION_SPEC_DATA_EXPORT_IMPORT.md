# Implementation Specification: Data Export/Import System

**Feature ID:** Critical Feature #1  
**Priority:** P0 - CRITICAL  
**Estimated Time:** 2-3 days  
**Assignee:** TBD  
**Status:** Not Started

---

## 📋 Overview

**Problem:** Users have no way to backup their data. All data is stored in localStorage, which can be:

- Cleared by browser
- Lost when switching browsers
- Lost when switching devices
- Lost if localStorage quota is exceeded
- Lost on browser reinstall

**Solution:** Implement comprehensive export/import system that allows users to:

1. Export all data as a single JSON file
2. Import data from JSON file with validation
3. Choose merge strategy (replace vs. merge)
4. Export individual data sections
5. Preview import before applying

---

## 🎯 Acceptance Criteria

### Must Have (P0)

- [ ] User can export all data with one click
- [ ] User can import data from JSON file
- [ ] Import validates data structure before applying
- [ ] User can choose merge strategy (replace/merge/skip duplicates)
- [ ] Clear success/error messages shown
- [ ] Exported data includes version number for compatibility
- [ ] Import works with different versions (backward compatible)

### Should Have (P1)

- [ ] User can export individual sections (usage, history, settings, etc.)
- [ ] Import preview shows what will change
- [ ] Export includes timestamp in filename
- [ ] Confirmation dialog before destructive operations (replace)

### Nice to Have (P2)

- [ ] Export/import progress indicators for large datasets
- [ ] Selective import (choose which sections to import)
- [ ] Auto-backup on schedule (weekly/monthly)
- [ ] Cloud backup integration (future)

---

## 🏗️ Technical Design

### Data Structure

```typescript
// Export format (versioned for backward compatibility)
interface ExportData {
  version: string; // e.g., "1.0.0"
  exportedAt: number; // Unix timestamp
  appVersion: string; // e.g., "0.1.0"
  sections: {
    usage: UsageEntry[];
    history: HistoryEntry[];
    settings: AppSettings;
    bestPractices: BestPractice[];
    promptCreatorConfig: PromptCreatorConfig;
    ratings: Rating[];
  };
  metadata: {
    totalRecords: number;
    totalSize: number; // bytes
    checksum?: string; // for integrity validation
  };
}

// Import result
interface ImportResult {
  success: boolean;
  recordsImported: number;
  recordsSkipped: number;
  recordsMerged: number;
  errors: string[];
  warnings: string[];
}

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview: {
    sectionsFound: string[];
    recordCounts: Record<string, number>;
    estimatedSize: number;
  };
}

// Import strategy
type ImportStrategy = "replace" | "merge" | "skip-duplicates";

// Data section
type DataSection =
  | "usage"
  | "history"
  | "settings"
  | "bestPractices"
  | "promptCreatorConfig"
  | "ratings";
```

### File Structure

```
src/lib/
├── dataExport.ts          # Export logic
├── dataImport.ts          # Import logic with validation
├── dataValidation.ts      # Schema validation
└── __tests__/
    ├── dataExport.test.ts
    ├── dataImport.test.ts
    └── dataValidation.test.ts

src/components/settings/
├── DataManagement.tsx     # UI component
└── __tests__/
    └── DataManagement.test.tsx
```

---

## 📝 Implementation Details

### 1. Export Logic (`src/lib/dataExport.ts`)

```typescript
import { usageStorage } from "./usage";
import { historyStorage } from "./historyStorage";
import { settingsStorage } from "./storage";
import { bestPracticesStorage } from "./bestPracticesStorage";
import { promptCreatorConfigStorage } from "./promptCreatorStorage";
import { ratingStorage } from "./ratingStorage";

const EXPORT_VERSION = "1.0.0";

/**
 * Export all application data
 */
export async function exportAllData(): Promise<Blob> {
  const data: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    sections: {
      usage: usageStorage.list({ from: 0, to: Date.now() }),
      history: historyStorage.getAllHistory(),
      settings: settingsStorage.get(),
      bestPractices: bestPracticesStorage.getAll(),
      promptCreatorConfig: promptCreatorConfigStorage.get(),
      ratings: ratingStorage.getAllRatings(),
    },
    metadata: {
      totalRecords: 0, // calculated below
      totalSize: 0,
    },
  };

  // Calculate metadata
  data.metadata.totalRecords = Object.values(data.sections)
    .filter(Array.isArray)
    .reduce((sum, arr) => sum + arr.length, 0);

  const jsonString = JSON.stringify(data, null, 2);
  data.metadata.totalSize = new Blob([jsonString]).size;

  return new Blob([jsonString], { type: "application/json" });
}

/**
 * Export a specific data section
 */
export async function exportSection(section: DataSection): Promise<Blob> {
  const fullData = await exportAllData();
  const fullJson = JSON.parse(await fullData.text()) as ExportData;

  const sectionData = {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    section,
    data: fullJson.sections[section],
  };

  const jsonString = JSON.stringify(sectionData, null, 2);
  return new Blob([jsonString], { type: "application/json" });
}

/**
 * Generate filename for export
 */
export function generateExportFilename(section?: DataSection): string {
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const time = new Date().toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

  if (section) {
    return `yt-data-${section}-${date}-${time}.json`;
  }

  return `yt-data-full-${date}-${time}.json`;
}

/**
 * Trigger browser download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

### 2. Import Logic (`src/lib/dataImport.ts`)

```typescript
import { validateImportData } from "./dataValidation";
import { usageStorage } from "./usage";
import { historyStorage } from "./historyStorage";
import { settingsStorage } from "./storage";
import { bestPracticesStorage } from "./bestPracticesStorage";
import { promptCreatorConfigStorage } from "./promptCreatorStorage";
import { ratingStorage } from "./ratingStorage";

/**
 * Import data with validation and merge strategy
 */
export async function importData(
  file: File,
  strategy: ImportStrategy = "merge",
): Promise<ImportResult> {
  const result: ImportResult = {
    success: false,
    recordsImported: 0,
    recordsSkipped: 0,
    recordsMerged: 0,
    errors: [],
    warnings: [],
  };

  try {
    // Read file
    const text = await file.text();
    const data: unknown = JSON.parse(text);

    // Validate
    const validation = validateImportData(data);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    const importData = data as ExportData;
    result.warnings = validation.warnings;

    // Import each section based on strategy
    if (strategy === "replace") {
      await replaceAllData(importData);
      result.recordsImported = importData.metadata.totalRecords;
    } else if (strategy === "merge") {
      const mergeResult = await mergeData(importData);
      result.recordsImported = mergeResult.imported;
      result.recordsMerged = mergeResult.merged;
      result.recordsSkipped = mergeResult.skipped;
    } else if (strategy === "skip-duplicates") {
      const skipResult = await skipDuplicates(importData);
      result.recordsImported = skipResult.imported;
      result.recordsSkipped = skipResult.skipped;
    }

    result.success = true;
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  return result;
}

/**
 * Replace all data (destructive)
 */
async function replaceAllData(data: ExportData): Promise<void> {
  // Settings
  settingsStorage.set(data.sections.settings);

  // Usage (clear and add all)
  usageStorage.clear();
  data.sections.usage.forEach((entry) => usageStorage.add(entry));

  // History
  historyStorage.clear();
  data.sections.history.forEach((entry) => historyStorage.addToHistory(entry));

  // Best Practices
  bestPracticesStorage.clear();
  data.sections.bestPractices.forEach((bp) => bestPracticesStorage.add(bp));

  // Prompt Creator Config
  promptCreatorConfigStorage.set(data.sections.promptCreatorConfig);

  // Ratings
  ratingStorage.clear();
  data.sections.ratings.forEach((rating) => ratingStorage.addRating(rating));
}

/**
 * Merge data (keep existing + add new)
 */
async function mergeData(data: ExportData): Promise<{
  imported: number;
  merged: number;
  skipped: number;
}> {
  let imported = 0;
  let merged = 0;
  let skipped = 0;

  // Settings: Merge (prefer imported for conflicts)
  const currentSettings = settingsStorage.get();
  settingsStorage.set({ ...currentSettings, ...data.sections.settings });
  merged++;

  // Usage: Add all (usage entries are append-only)
  data.sections.usage.forEach((entry) => {
    usageStorage.add(entry);
    imported++;
  });

  // History: Skip duplicates by ID
  const existingIds = new Set(historyStorage.getAllHistory().map((h) => h.id));
  data.sections.history.forEach((entry) => {
    if (!existingIds.has(entry.id)) {
      historyStorage.addToHistory(entry);
      imported++;
    } else {
      skipped++;
    }
  });

  // Best Practices: Skip duplicates by ID
  const existingBPs = new Set(bestPracticesStorage.getAll().map((bp) => bp.id));
  data.sections.bestPractices.forEach((bp) => {
    if (!existingBPs.has(bp.id)) {
      bestPracticesStorage.add(bp);
      imported++;
    } else {
      skipped++;
    }
  });

  // Prompt Creator Config: Merge
  const currentConfig = promptCreatorConfigStorage.get();
  promptCreatorConfigStorage.set({
    ...currentConfig,
    ...data.sections.promptCreatorConfig,
  });
  merged++;

  // Ratings: Skip duplicates by entry ID + model ID
  const existingRatings = new Set(
    ratingStorage.getAllRatings().map((r) => `${r.entryId}-${r.modelId}`),
  );
  data.sections.ratings.forEach((rating) => {
    const key = `${rating.entryId}-${rating.modelId}`;
    if (!existingRatings.has(key)) {
      ratingStorage.addRating(rating);
      imported++;
    } else {
      skipped++;
    }
  });

  return { imported, merged, skipped };
}

/**
 * Skip duplicates (only add new records)
 */
async function skipDuplicates(data: ExportData): Promise<{
  imported: number;
  skipped: number;
}> {
  // Similar to merge, but don't merge settings
  const result = await mergeData(data);
  return {
    imported: result.imported,
    skipped: result.skipped + result.merged,
  };
}

/**
 * Preview import (validate and show what will change)
 */
export async function previewImport(file: File): Promise<ValidationResult> {
  try {
    const text = await file.text();
    const data: unknown = JSON.parse(text);
    return validateImportData(data);
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Invalid file format"],
      warnings: [],
      preview: {
        sectionsFound: [],
        recordCounts: {},
        estimatedSize: 0,
      },
    };
  }
}
```

### 3. Validation Logic (`src/lib/dataValidation.ts`)

```typescript
/**
 * Validate imported data structure
 */
export function validateImportData(data: unknown): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    preview: {
      sectionsFound: [],
      recordCounts: {},
      estimatedSize: 0,
    },
  };

  // Check if data is an object
  if (typeof data !== "object" || data === null) {
    result.valid = false;
    result.errors.push("Import file must contain a valid JSON object");
    return result;
  }

  const importData = data as Record<string, unknown>;

  // Check version
  if (typeof importData.version !== "string") {
    result.warnings.push("No version number found in import data");
  } else if (!isCompatibleVersion(importData.version)) {
    result.warnings.push(
      `Import data version (${importData.version}) may not be compatible with current version`,
    );
  }

  // Check sections
  if (typeof importData.sections !== "object" || importData.sections === null) {
    result.valid = false;
    result.errors.push("No data sections found in import file");
    return result;
  }

  const sections = importData.sections as Record<string, unknown>;

  // Validate each section
  const sectionValidators: Record<string, (data: unknown) => boolean> = {
    usage: validateUsageSection,
    history: validateHistorySection,
    settings: validateSettingsSection,
    bestPractices: validateBestPracticesSection,
    promptCreatorConfig: validatePromptCreatorConfigSection,
    ratings: validateRatingsSection,
  };

  for (const [sectionName, validator] of Object.entries(sectionValidators)) {
    const sectionData = sections[sectionName];

    if (sectionData !== undefined) {
      result.preview.sectionsFound.push(sectionName);

      if (validator(sectionData)) {
        if (Array.isArray(sectionData)) {
          result.preview.recordCounts[sectionName] = sectionData.length;
        } else {
          result.preview.recordCounts[sectionName] = 1;
        }
      } else {
        result.errors.push(`Invalid data format in section: ${sectionName}`);
        result.valid = false;
      }
    }
  }

  // Calculate estimated size
  result.preview.estimatedSize = JSON.stringify(data).length;

  return result;
}

/**
 * Check if import version is compatible with current version
 */
function isCompatibleVersion(importVersion: string): boolean {
  const currentVersion = "1.0.0"; // Export version constant
  const [importMajor] = importVersion.split(".").map(Number);
  const [currentMajor] = currentVersion.split(".").map(Number);

  // Compatible if major versions match
  return importMajor === currentMajor;
}

// Section validators
function validateUsageSection(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      "modelId" in entry &&
      "totalCost" in entry &&
      "timestamp" in entry,
  );
}

function validateHistorySection(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      "id" in entry &&
      "prompt" in entry &&
      "timestamp" in entry,
  );
}

function validateSettingsSection(data: unknown): boolean {
  return typeof data === "object" && data !== null && "apiKey" in data;
}

function validateBestPracticesSection(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (bp) =>
      typeof bp === "object" && bp !== null && "id" in bp && "title" in bp,
  );
}

function validatePromptCreatorConfigSection(data: unknown): boolean {
  return typeof data === "object" && data !== null && "availableFields" in data;
}

function validateRatingsSection(data: unknown): boolean {
  if (!Array.isArray(data)) return false;
  return data.every(
    (rating) =>
      typeof rating === "object" &&
      rating !== null &&
      "entryId" in rating &&
      "modelId" in rating &&
      "score" in rating,
  );
}
```

### 4. UI Component (`src/components/settings/DataManagement.tsx`)

```typescript
"use client";

import React, { useState } from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import {
  exportAllData,
  exportSection,
  generateExportFilename,
  downloadBlob
} from '@/lib/dataExport';
import { importData, previewImport } from '@/lib/dataImport';
import type { ImportStrategy, DataSection, ValidationResult, ImportResult } from '@/lib/dataImport';

export function DataManagement() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<ImportStrategy>('merge');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Export all data
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      const blob = await exportAllData();
      const filename = generateExportFilename();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show error toast
    } finally {
      setIsExporting(false);
    }
  };

  // Export specific section
  const handleExportSection = async (section: DataSection) => {
    setIsExporting(true);
    try {
      const blob = await exportSection(section);
      const filename = generateExportFilename(section);
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show error toast
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsImporting(true);

    try {
      const preview = await previewImport(file);
      setImportPreview(preview);
    } catch (error) {
      console.error('Preview failed:', error);
      setImportPreview({
        valid: false,
        errors: ['Failed to read file'],
        warnings: [],
        preview: { sectionsFound: [], recordCounts: {}, estimatedSize: 0 },
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Confirm and import
  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const result = await importData(selectedFile, selectedStrategy);
      setImportResult(result);

      if (result.success) {
        setSelectedFile(null);
        setImportPreview(null);
        // TODO: Show success toast
        // TODO: Refresh app state
      }
    } catch (error) {
      console.error('Import failed:', error);
      // TODO: Show error toast
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </h3>

        <p className="text-gray-400 mb-4">
          Download your data as a JSON file for backup or migration.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
          >
            <FileJson className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export All Data'}
          </button>

          <details className="text-sm">
            <summary className="cursor-pointer text-gray-400 hover:text-white">
              Export Individual Sections
            </summary>
            <div className="mt-2 space-y-2 pl-4">
              {(['usage', 'history', 'settings', 'bestPractices', 'promptCreatorConfig', 'ratings'] as DataSection[]).map(section => (
                <button
                  key={section}
                  onClick={() => handleExportSection(section)}
                  disabled={isExporting}
                  className="block w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                >
                  Export {section}
                </button>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* Import Section */}
      <section className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Data
        </h3>

        <p className="text-gray-400 mb-4">
          Restore data from a previously exported JSON file.
        </p>

        {/* File Input */}
        <div className="mb-4">
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
          />
        </div>

        {/* Import Preview */}
        {importPreview && (
          <div className="mb-4 p-4 bg-gray-700 rounded">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {importPreview.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  File is valid
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  File has errors
                </>
              )}
            </h4>

            {importPreview.preview.sectionsFound.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-400 mb-1">Sections found:</p>
                <ul className="text-sm list-disc list-inside">
                  {importPreview.preview.sectionsFound.map(section => (
                    <li key={section}>
                      {section}: {importPreview.preview.recordCounts[section]} records
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importPreview.errors.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-red-400 font-semibold mb-1">Errors:</p>
                <ul className="text-sm list-disc list-inside text-red-300">
                  {importPreview.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importPreview.warnings.length > 0 && (
              <div>
                <p className="text-sm text-yellow-400 font-semibold mb-1">Warnings:</p>
                <ul className="text-sm list-disc list-inside text-yellow-300">
                  {importPreview.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Merge Strategy */}
            {importPreview.valid && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Import Strategy:
                </label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value as ImportStrategy)}
                  className="w-full px-3 py-2 bg-gray-600 rounded text-sm"
                >
                  <option value="merge">Merge (keep existing + add new)</option>
                  <option value="replace">Replace (delete existing)</option>
                  <option value="skip-duplicates">Skip duplicates</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedStrategy === 'merge' && 'Existing data will be kept, new data will be added'}
                  {selectedStrategy === 'replace' && '⚠️ All existing data will be deleted'}
                  {selectedStrategy === 'skip-duplicates' && 'Only new records will be added, duplicates will be skipped'}
                </p>
              </div>
            )}

            {/* Confirm Button */}
            {importPreview.valid && (
              <button
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="mt-4 w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded transition-colors"
              >
                {isImporting ? 'Importing...' : 'Confirm Import'}
              </button>
            )}
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div className={`p-4 rounded ${importResult.success ? 'bg-green-900/20 border border-green-600' : 'bg-red-900/20 border border-red-600'}`}>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {importResult.success ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Import Successful
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Import Failed
                </>
              )}
            </h4>

            {importResult.success && (
              <div className="text-sm space-y-1">
                <p>✓ Imported: {importResult.recordsImported} records</p>
                {importResult.recordsMerged > 0 && (
                  <p>✓ Merged: {importResult.recordsMerged} records</p>
                )}
                {importResult.recordsSkipped > 0 && (
                  <p>• Skipped: {importResult.recordsSkipped} duplicates</p>
                )}
              </div>
            )}

            {importResult.errors.length > 0 && (
              <ul className="text-sm list-disc list-inside text-red-300 mt-2">
                {importResult.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2">💡 Backup Best Practices</p>
        <ul className="space-y-1 text-gray-300">
          <li>• Export your data regularly (weekly recommended)</li>
          <li>• Store backups in multiple locations (cloud + local)</li>
          <li>• Test imports occasionally to ensure backups work</li>
          <li>• Use "merge" strategy when syncing between devices</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## ✅ Testing Strategy

### Unit Tests

```typescript
// src/lib/__tests__/dataExport.test.ts
describe("Data Export", () => {
  it("exports all data as valid JSON");
  it("includes all required sections");
  it("includes version and metadata");
  it("generates correct filenames with timestamps");
  it("exports individual sections correctly");
});

// src/lib/__tests__/dataImport.test.ts
describe("Data Import", () => {
  it("validates import data structure");
  it("rejects invalid JSON");
  it("rejects data with missing sections");
  it("supports merge strategy");
  it("supports replace strategy");
  it("supports skip-duplicates strategy");
  it("handles version mismatches gracefully");
});

// src/lib/__tests__/dataValidation.test.ts
describe("Data Validation", () => {
  it("validates each section correctly");
  it("detects incompatible versions");
  it("provides helpful error messages");
  it("calculates preview information");
});
```

### Integration Tests

```typescript
// src/components/__tests__/DataManagement.test.tsx
describe("DataManagement Component", () => {
  it("renders export and import sections");
  it("exports data on button click");
  it("shows file input for import");
  it("previews import before applying");
  it("shows validation errors");
  it("allows strategy selection");
  it("confirms before destructive operations");
  it("shows success/error messages");
});
```

### Manual Testing Checklist

- [ ] Export all data, verify JSON structure
- [ ] Import exported data, verify all sections restored
- [ ] Test merge strategy with existing data
- [ ] Test replace strategy (verify old data deleted)
- [ ] Test skip-duplicates strategy
- [ ] Test with invalid JSON file
- [ ] Test with corrupted data
- [ ] Test with incompatible version
- [ ] Test export of individual sections
- [ ] Verify downloaded filenames have correct timestamps

---

## 📚 Documentation Updates

### Files to Update:

1. `README.md` - Add data management section
2. `docs/FEATURES_GUIDE.md` - Add export/import documentation
3. `docs/API_REFERENCE.md` - Document export/import APIs

### Documentation Template:

```markdown
## Data Management

### Exporting Data

Export all your data for backup or migration:

1. Go to **Settings** → **Data Management**
2. Click **Export All Data**
3. Save the JSON file to a safe location

You can also export individual sections (usage, history, settings, etc.) using the dropdown.

### Importing Data

Restore data from a backup:

1. Go to **Settings** → **Data Management**
2. Click **Choose File** and select your backup JSON
3. Review the preview to see what will be imported
4. Choose an import strategy:
   - **Merge**: Keep existing data and add new records
   - **Replace**: Delete all existing data (⚠️ destructive)
   - **Skip Duplicates**: Only add new, unique records
5. Click **Confirm Import**

### Best Practices

- Export your data weekly for regular backups
- Store backups in multiple locations (cloud + local drive)
- Use "Merge" strategy when syncing between devices
- Test your backups occasionally by importing to a test browser
```

---

## 🚀 Deployment Checklist

- [ ] All code implemented and tested
- [ ] Unit tests passing (100% coverage for export/import logic)
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Merged to main
- [ ] Deployed to production
- [ ] User notification (changelog/release notes)

---

## 📊 Success Metrics

**After 1 week:**

- [ ] > 50% of active users have exported data at least once
- [ ] Zero data loss incidents reported
- [ ] <5% of imports fail validation

**After 1 month:**

- [ ] > 80% of active users have exported data
- [ ] Average export size is reasonable (<10MB for typical user)
- [ ] Import success rate >95%

---

## 🔗 Related Issues

- Does NOT overlap with Issue #137 (usage tracking - already implemented)
- Complements Issue #180-189 (bug fixes)
- Supports Issue #124-129 (PQA infrastructure)

---

## 📞 Questions & Support

**Technical Questions:** Review this spec or check `docs/API_REFERENCE.md`  
**Implementation Help:** Check unit tests for examples  
**Bug Reports:** Create issue with label `bug` + `data-management`

---

**Document Version:** 1.0  
**Last Updated:** October 18, 2025  
**Status:** Ready for Implementation

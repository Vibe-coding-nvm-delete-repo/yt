"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { HistoryEntry } from "@/types/history";
import { historyStorage } from "@/lib/historyStorage";

export const useHistory = () => {
  const [state, setState] = useState(() => historyStorage.getState());

  useEffect(() => {
    // Subscribe to history storage updates (event-based, not polling)
    const unsubscribe = historyStorage.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    historyStorage.addEntry(entry);
    // No need to manually setState - subscription will handle it
  }, []);

  const setFilterModelIds = useCallback((modelIds: string[]) => {
    historyStorage.setFilterModelIds(modelIds);
    // No need to manually setState - subscription will handle it
  }, []);

  const filtered = useMemo(() => {
    const ids = state.filterModelIds;
    if (!ids || ids.length === 0) return state.entries;
    return state.entries.filter((e) => ids.includes(e.modelId));
  }, [state.entries, state.filterModelIds]);

  // Unique model options present in history (across all entries)
  const historyModelOptions = useMemo(() => {
    const modelIdToName = new Map<string, string>();
    for (const entry of state.entries) {
      if (!modelIdToName.has(entry.modelId)) {
        modelIdToName.set(entry.modelId, entry.modelName);
      }
    }
    return Array.from(modelIdToName, ([id, name]) => ({ id, name }));
  }, [state.entries]);

  return {
    entries: filtered,
    filterModelIds: state.filterModelIds,
    addEntry,
    setFilterModelIds,
    historyModelOptions,
  };
};

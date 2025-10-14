"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HistoryEntry } from '@/types/history';
import { historyStorage } from '@/lib/historyStorage';

export const useHistory = () => {
  const [state, setState] = useState(() => historyStorage.getState());

  useEffect(() => {
    // simple polling for now; could be event-based later
    const id = setInterval(() => setState(historyStorage.getState()), 1000);
    return () => clearInterval(id);
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    historyStorage.addEntry(entry);
    setState(historyStorage.getState());
  }, []);

  const setFilterModelIds = useCallback((modelIds: string[]) => {
    historyStorage.setFilterModelIds(modelIds);
    setState(historyStorage.getState());
  }, []);

  const filtered = useMemo(() => {
    const ids = state.filterModelIds;
    if (!ids || ids.length === 0) return state.entries;
    return state.entries.filter(e => ids.includes(e.modelId));
  }, [state.entries, state.filterModelIds]);

  return {
    entries: filtered,
    filterModelIds: state.filterModelIds,
    addEntry,
    setFilterModelIds,
  };
};

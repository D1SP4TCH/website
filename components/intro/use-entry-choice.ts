'use client';

import { useCallback, useEffect, useState } from 'react';

export type EntryChoice = 'garden' | 'projects';
export type EntryStatus = 'pending' | 'show' | 'auto';

const STORAGE_KEY = 'entry-choice';

export function useEntryChoice() {
  const [status, setStatus] = useState<EntryStatus>('pending');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setStatus('show');
  }, []);

  const persist = useCallback((choice: EntryChoice) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Ignore private-mode storage failures; navigation should still work.
    }
  }, []);

  return { status, persist };
}

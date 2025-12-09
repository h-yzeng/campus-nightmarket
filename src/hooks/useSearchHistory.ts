import { useState } from 'react';

const SEARCH_HISTORY_KEY = 'campus-nightmarket-search-history';
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

/**
 * Hook for managing search history with localStorage persistence.
 * Stores recent searches and provides suggestions based on user's search history.
 */
export function useSearchHistory() {
  // Load search history from localStorage
  const loadHistory = (): string[] => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        // Sort by timestamp (newest first) and extract queries
        return parsed.sort((a, b) => b.timestamp - a.timestamp).map((item) => item.query);
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
    return [];
  };

  const [history, setHistory] = useState<string[]>(loadHistory);

  // Add a search to history
  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    try {
      // Load current history
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      const current: SearchHistoryItem[] = stored ? JSON.parse(stored) : [];

      // Remove duplicate if exists
      const filtered = current.filter((item) => item.query.toLowerCase() !== query.toLowerCase());

      // Add new item at the beginning
      const updated = [{ query: query.trim(), timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_HISTORY_ITEMS
      );

      // Save to localStorage
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));

      // Update state
      setHistory(updated.map((item) => item.query));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // Clear all search history
  const clearHistory = () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // Remove a specific item from history
  const removeFromHistory = (query: string) => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (!stored) return;

      const current: SearchHistoryItem[] = JSON.parse(stored);
      const updated = current.filter((item) => item.query !== query);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      setHistory(updated.map((item) => item.query));
    } catch (error) {
      console.error('Failed to remove search item:', error);
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

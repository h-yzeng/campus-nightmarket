import { Clock, X, TrendingUp } from 'lucide-react';

interface SearchSuggestionsProps {
  searchQuery: string;
  searchHistory: string[];
  popularSearches?: string[];
  onSelectSuggestion: (query: string) => void;
  onRemoveHistoryItem: (query: string) => void;
  onClearHistory: () => void;
  show: boolean;
}

/**
 * Search suggestions dropdown showing search history and popular searches.
 * Appears when search input is focused.
 */
export default function SearchSuggestions({
  searchQuery,
  searchHistory,
  popularSearches = ['Cake', 'Ramen', 'Pasta', 'Salad', 'Pancakes'],
  onSelectSuggestion,
  onRemoveHistoryItem,
  onClearHistory,
  show,
}: SearchSuggestionsProps) {
  if (!show) return null;

  // Filter history based on current search query
  const filteredHistory = searchHistory.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter popular searches based on current query and exclude those already in history
  const filteredPopular = popularSearches
    .filter(
      (item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !searchHistory.some((h) => h.toLowerCase() === item.toLowerCase())
    )
    .slice(0, 5);

  const hasHistory = filteredHistory.length > 0;
  const hasPopular = filteredPopular.length > 0;

  if (!hasHistory && !hasPopular) return null;

  return (
    <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border-2 border-[#3A3A3A] bg-[#1E1E1E] shadow-xl">
      {/* Search History */}
      {hasHistory && (
        <div className="border-b border-[#3A3A3A] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#76777B]" />
              <span className="text-xs font-semibold text-[#A0A0A0]">Recent Searches</span>
            </div>
            <button
              onClick={onClearHistory}
              className="text-xs text-[#CC0000] transition-colors hover:text-[#B00000]"
              type="button"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-1">
            {filteredHistory.map((item) => (
              <button
                key={item}
                onClick={() => onSelectSuggestion(item)}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#2A2A2A]"
                type="button"
              >
                <span className="text-sm text-[#E0E0E0]">{item}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveHistoryItem(item);
                  }}
                  className="rounded p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#3A3A3A]"
                  type="button"
                  aria-label="Remove from history"
                >
                  <X size={14} className="text-[#76777B]" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {hasPopular && (
        <div className="p-3">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#76777B]" />
            <span className="text-xs font-semibold text-[#A0A0A0]">Popular Searches</span>
          </div>
          <div className="space-y-1">
            {filteredPopular.map((item) => (
              <button
                key={item}
                onClick={() => onSelectSuggestion(item)}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#2A2A2A]"
                type="button"
              >
                <span className="text-sm text-[#E0E0E0]">{item}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

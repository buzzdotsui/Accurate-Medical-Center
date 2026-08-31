"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, AlertCircle, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SearchResult {
  type: "PATIENT" | "STAFF" | "APPOINTMENT" | "INVOICE";
  id: string;
  displayId: string;
  title: string;
  subtitle: string;
  url?: string;
}

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  PATIENT: "Patient",
  STAFF: "Staff",
  APPOINTMENT: "Appointment",
  INVOICE: "Invoice",
};

/**
 * Global search input for the topbar. Debounced, keyboard-navigable
 * dropdown wired to `GET /api/v1/search`. Authorization (which entity
 * types/records the caller may see) is fully enforced server-side — this
 * component only renders whatever the API returns.
 */
export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q.trim())}&take=8`, {
        signal: controller.signal,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Search failed. Please try again.");
      }
      setResults(json.data as SearchResult[]);
      setActiveIndex(-1);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateTo(result: SearchResult) {
    setOpen(false);
    setQuery("");
    setResults([]);
    if (result.url) {
      router.push(result.url);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        navigateTo(results[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative hidden md:block group">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search patients, staff, appointments..."
        aria-label="Global search"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        className="h-9 w-64 rounded-md border border-input bg-card px-9 py-1 text-sm shadow-sm transition-all focus:w-80 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
      {!query && (
        <kbd className="absolute right-2 top-2 pointer-events-none inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}

      {showDropdown && (
        <div className="absolute left-0 top-11 w-96 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg z-50 py-1">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-sm text-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-muted-foreground">{error}</span>
              <button
                type="button"
                onClick={() => runSearch(query)}
                className="text-primary text-xs font-medium hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-6 text-sm text-center text-muted-foreground">
              <FileQuestion className="w-5 h-5 text-muted-foreground/60" />
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <ul role="listbox" id="global-search-results">
              {results.map((result, index) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onClick={() => navigateTo(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    disabled={!result.url}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      index === activeIndex ? "bg-muted" : "hover:bg-muted/60",
                      !result.url && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium text-foreground truncate">{result.title}</span>
                      <span className="block text-xs text-muted-foreground truncate">{result.subtitle}</span>
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {TYPE_LABELS[result.type]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

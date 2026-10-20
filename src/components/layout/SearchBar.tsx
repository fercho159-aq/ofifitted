"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { searchProducts, type SearchResult } from "@/lib/search-action";
import { cn } from "@/lib/utils";

export function SearchBar({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  const doSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const r = await searchProducts(q);
      setResults(r);
      setLoading(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, close]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        aria-label="Buscar productos"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          open ? "bg-brand-50 text-brand-600" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
        )}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-4 right-4 top-[calc(var(--header-h)+4px)] z-[90] overflow-hidden rounded-xl border border-ink-200 bg-paper shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
          >
            <div className="flex items-center gap-3 border-b border-ink-100 px-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-400" aria-hidden>
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                placeholder="Buscar sillas, escritorios..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  doSearch(e.target.value);
                }}
                className="h-12 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
              />
              <kbd className="hidden rounded border border-ink-200 px-1.5 py-0.5 font-mono text-[10px] text-ink-400 sm:inline">
                ESC
              </kbd>
            </div>

            {query.trim().length >= 2 && (
              <div className="max-h-[22rem] overflow-y-auto p-2">
                {loading && results.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-ink-400">Buscando...</p>
                )}

                {!loading && results.length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-ink-400">
                    No se encontraron productos
                  </p>
                )}

                {results.length > 0 && (
                  <ul>
                    {results.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/producto/${r.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-ink-50"
                        >
                          {r.image ? (
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                              <Image
                                src={r.image.src}
                                alt=""
                                width={r.image.width}
                                height={r.image.height}
                                placeholder="blur"
                                blurDataURL={r.image.blurDataURL}
                                sizes="56px"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-ink-100">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-ink-300" aria-hidden>
                                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          )}
                          <span className="min-w-0 flex-1 text-sm font-medium text-ink-800 leading-snug">
                            {r.title}
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-300" aria-hidden>
                            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {query.trim().length < 2 && (
              <p className="px-4 py-5 text-center text-xs text-ink-400">
                Escribe al menos 2 caracteres para buscar
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

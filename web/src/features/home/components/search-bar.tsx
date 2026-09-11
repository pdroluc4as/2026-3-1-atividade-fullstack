"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

type SearchBarProps = {
  variant?: "default" | "header";
};

export function SearchBar({ variant = "default" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    });
  }

  function handleClear() {
    setQuery("");
    inputRef.current?.focus();
    startTransition(() => {
      router.push("/");
    });
  }

  const isHeader = variant === "header";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search
            className={`pointer-events-none absolute left-3.5 h-4 w-4 ${isHeader ? "text-white/50" : "text-slate-400"}`}
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar discussões..."
            aria-label="Pesquisar discussões"
            className={`w-full rounded-full border py-2.5 pl-10 pr-10 text-sm placeholder:transition focus:outline-none focus:ring-2 ${
              isHeader
                ? "border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/15 focus:ring-white/20"
                : "border-slate-200 bg-slate-100 text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-primary/20"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar pesquisa"
              className={`absolute right-3 flex h-5 w-5 items-center justify-center rounded-full transition ${
                isHeader
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-slate-300 text-slate-600 hover:bg-slate-400"
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {isPending && (
          <p className={`mt-1.5 px-3 text-xs ${isHeader ? "text-white/50" : "text-slate-400"}`}>
            Pesquisando...
          </p>
        )}
      </form>
    </div>
  );
}


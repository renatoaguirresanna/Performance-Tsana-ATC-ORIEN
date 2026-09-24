"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/Logo";

type KbResult = {
  id: string;
  title: string;
  question: string;
  answer: string;
  empresa: string | null;
  keywords: string[];
  rank: number;
};

export function Buscador() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KbResult[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setSearchId(data.searchId ?? null);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 350);
  }

  function handleClick(articleId: string) {
    if (!searchId) return;
    fetch("/api/search/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchId, articleId }),
    });
  }

  const compact = searched || query.length > 0;

  return (
    <div
      className={`flex flex-1 flex-col items-center px-4 ${
        compact ? "pt-16 md:pt-20" : "justify-center"
      }`}
    >
      <div className={compact ? "mb-6" : "mb-8"}>
        <Logo size={compact ? "sm" : "lg"} />
      </div>

      <div className="w-full max-w-xl">
        <div className="flex items-center gap-3 rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-3 shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow">
          <svg
            className="h-5 w-5 shrink-0 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Ej: ¿BCP cuenta con nutrición? ¿Yape tiene orientaciones?"
            className="w-full bg-transparent outline-none placeholder:text-zinc-400"
          />
        </div>
      </div>

      <div className="mt-8 w-full max-w-2xl">
        {loading && (
          <p className="text-center text-sm text-zinc-500">Buscando…</p>
        )}

        {!loading && searched && results.length === 0 && (
          <p className="text-center text-sm text-zinc-500">
            Sin resultados para &ldquo;{query}&rdquo;. Esta consulta queda registrada
            para que el equipo la agregue al buscador.
          </p>
        )}

        <ul className="space-y-5">
          {results.map((r) => (
            <li
              key={r.id}
              onClick={() => handleClick(r.id)}
              className="cursor-pointer rounded-lg p-3 -mx-3 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {r.empresa && (
                  <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 font-medium">
                    {r.empresa}
                  </span>
                )}
              </div>
              <h3 className="mt-1 text-lg text-[#1a0dab] dark:text-[#8ab4f8] hover:underline">
                {r.question}
              </h3>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                {r.answer}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

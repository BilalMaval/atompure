"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string | null;
}

export function SearchBar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <form onSubmit={handleSubmit}>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products..."
          aria-label="Search products"
          className="h-10 w-full rounded-full border border-beige-300 bg-cream-50 px-4 text-sm focus:border-sage-500 focus:outline-none"
        />
      </form>

      {isOpen && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-12 z-30 max-h-80 overflow-y-auto rounded-xl border border-beige-200 bg-cream-50 py-2 shadow-lg">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={`/shop/${result.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-beige-100"
              >
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-beige-100">
                  {result.imageUrl && (
                    <Image src={result.imageUrl} alt={result.name} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-charcoal-800">{result.name}</p>
                  <p className="text-xs text-charcoal-500">{formatPrice(result.basePrice)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

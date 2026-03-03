"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  size?: "lg" | "md";
  placeholder?: string;
}

interface Suggestion {
  slug: string;
  name: string;
  city: string;
  country: string;
}

export default function SearchBar({
  defaultValue = "",
  size = "md",
  placeholder = "Search by city, region, or store name\u2026",
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  };

  const fetchSuggestions = useCallback(async (text: string) => {
    if (text.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/stores/suggest?q=${encodeURIComponent(text.trim())}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
      setShowDropdown((data.suggestions ?? []).length > 0);
      setActiveIndex(-1);
    } catch {
      // silently fail
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      router.push(`/store/${suggestions[activeIndex].slug}`);
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputClass =
    size === "lg" ? "h-14 text-lg px-5 pr-14" : "h-11 text-sm px-4 pr-12";

  const buttonClass =
    size === "lg" ? "h-10 w-10 right-2" : "h-8 w-8 right-1.5";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className={`w-full rounded-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all ${inputClass}`}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        <button
          type="submit"
          className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors ${buttonClass}`}
          aria-label="Search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              role="option"
              aria-selected={i === activeIndex}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                i === activeIndex ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                router.push(`/store/${s.slug}`);
                setShowDropdown(false);
              }}
            >
              <svg
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <div className="min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {s.city}, {s.country}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

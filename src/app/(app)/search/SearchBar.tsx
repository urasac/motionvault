"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies and series…"
        className="w-full rounded-full border border-border bg-surface-2 py-3 pl-5 pr-12 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/60"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-accent p-2 text-accent-foreground"
        aria-label="Search"
      >
        🔍
      </button>
    </form>
  );
}

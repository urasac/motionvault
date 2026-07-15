"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { LogModal } from "@/components/LogModal";
import {
  addToListAction,
  toggleFavoriteAction,
  toggleWatchlistAction,
} from "@/lib/actions";
import type { TitleInput } from "@/lib/title-cache";

export function TitleActions({
  title,
  initialInWatchlist,
  initialIsFavorite,
  userLists,
}: {
  title: TitleInput;
  initialInWatchlist: boolean;
  initialIsFavorite: boolean;
  userLists: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [logOpen, setLogOpen] = useState(false);
  const [listMenuOpen, setListMenuOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleWatchlist() {
    setPending(true);
    try {
      const res = await toggleWatchlistAction(title);
      setInWatchlist(res.inWatchlist);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleFavorite() {
    setPending(true);
    try {
      const res = await toggleFavoriteAction(title);
      setIsFavorite(res.isFavorite);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function handleAddToList(listId: string) {
    setListMenuOpen(false);
    await addToListAction(listId, title);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => setLogOpen(true)}>+ Log this</Button>
      <Button
        variant={inWatchlist ? "primary" : "secondary"}
        onClick={handleWatchlist}
        disabled={pending}
      >
        {inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
      </Button>
      <Button
        variant="secondary"
        onClick={handleFavorite}
        disabled={pending}
        aria-pressed={isFavorite}
      >
        {isFavorite ? "♥ Favorited" : "♡ Favorite"}
      </Button>
      <div className="relative">
        <Button variant="outline" onClick={() => setListMenuOpen((v) => !v)}>
          + Add to list
        </Button>
        {listMenuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-xl">
            {userLists.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted">
                No custom lists yet.
              </p>
            ) : (
              userLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleAddToList(list.id)}
                  className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-surface-2"
                >
                  {list.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {logOpen && (
        <LogModal title={title} onClose={() => setLogOpen(false)} />
      )}
    </div>
  );
}

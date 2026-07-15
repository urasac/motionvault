"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/StarRating";
import { deleteWatchEntryAction } from "@/lib/actions";

export function WatchEntryRow({
  id,
  rating,
  review,
  watchedOn,
  rewatch,
}: {
  id: string;
  rating: number | null;
  review: string | null;
  watchedOn: string;
  rewatch: boolean;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hidden) return null;

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface-2 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {new Date(watchedOn).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          {rewatch && (
            <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
              Rewatch
            </span>
          )}
        </div>
        {rating !== null && (
          <div className="mt-1.5">
            <StarRating value={rating} readOnly size="sm" />
          </div>
        )}
        {review && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
            {review}
          </p>
        )}
      </div>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await deleteWatchEntryAction(id);
            setHidden(true);
            router.refresh();
          })
        }
        className="shrink-0 cursor-pointer text-xs text-muted hover:text-danger disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

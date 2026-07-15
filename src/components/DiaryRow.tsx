"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/StarRating";
import { deleteWatchEntryAction } from "@/lib/actions";

export function DiaryRow({
  id,
  rating,
  review,
  watchedOn,
  rewatch,
  title,
}: {
  id: string;
  rating: number | null;
  review: string | null;
  watchedOn: string;
  rewatch: boolean;
  title: {
    tmdbId: number;
    mediaType: "MOVIE" | "TV";
    name: string;
    posterPath: string | null;
  };
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hidden) return null;

  const href = `/title/${title.mediaType.toLowerCase()}/${title.tmdbId}`;

  return (
    <div className="flex items-start gap-4 p-4">
      <Link href={href} className="h-20 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
        {title.posterPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://image.tmdb.org/t/p/w185${title.posterPath}`}
            alt={title.name}
            className="h-full w-full object-cover"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={href}
            className="text-sm font-medium text-foreground hover:text-accent"
          >
            {title.name}
          </Link>
          <span className="text-xs text-muted">
            {new Date(watchedOn).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {rewatch ? " · Rewatch" : ""}
          </span>
        </div>
        {rating !== null && (
          <div className="mt-1">
            <StarRating value={rating} readOnly size="sm" />
          </div>
        )}
        {review && (
          <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">
            {review}
          </p>
        )}
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await deleteWatchEntryAction(id);
              setHidden(true);
              router.refresh();
            })
          }
          className="mt-1.5 cursor-pointer text-xs text-muted hover:text-danger disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

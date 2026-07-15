"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/StarRating";
import { logWatchAction } from "@/lib/actions";
import type { TitleInput } from "@/lib/title-cache";

export function LogModal({
  title,
  onClose,
}: {
  title: TitleInput;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [watchedOn, setWatchedOn] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [rewatch, setRewatch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await logWatchAction({
        title,
        rating: rating || undefined,
        review: review || undefined,
        watchedOn,
        rewatch,
      });
      router.refresh();
      onClose();
    } catch {
      setError("Couldn't save this log. Try again.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Log {title.name}
            </h2>
            <p className="text-xs text-muted">
              Add it to your diary with a rating and review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer text-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Your rating
            </label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Watched on
            </label>
            <input
              type="date"
              value={watchedOn}
              onChange={(e) => setWatchedOn(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Review (optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              placeholder="What did you think?"
              className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/60"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={rewatch}
              onChange={(e) => setRewatch(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-[var(--accent)]"
            />
            This is a rewatch
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save log"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PosterCard, type PosterItem } from "@/components/PosterCard";
import { removeFromListAction } from "@/lib/actions";

export function RemovableTitleCard({
  item,
  listId,
  titleId,
}: {
  item: PosterItem;
  listId: string;
  titleId: string;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (hidden) return null;

  return (
    <div className="relative">
      <PosterCard item={item} />
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await removeFromListAction(listId, titleId);
            setHidden(true);
            router.refresh();
          })
        }
        className="mt-1.5 w-full cursor-pointer rounded-md border border-border py-1 text-[11px] text-muted transition hover:border-danger hover:text-danger disabled:opacity-50"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}

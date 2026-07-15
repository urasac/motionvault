import { requireUser } from "@/lib/current-user";
import { ensureWatchlist } from "@/lib/title-cache";
import { prisma } from "@/lib/prisma";
import { RemovableTitleCard } from "@/components/RemovableTitleCard";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const user = await requireUser();
  const watchlist = await ensureWatchlist(user.id);

  const items = await prisma.listItem.findMany({
    where: { listId: watchlist.id },
    orderBy: { addedAt: "desc" },
    include: { title: true },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-4xl tracking-wide text-foreground">
        WATCHLIST
      </h1>
      <p className="mt-1 text-sm text-muted">
        {items.length} title{items.length === 1 ? "" : "s"} queued up.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">Your watchlist is empty.</p>
          <a
            href="/search"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Find something to add →
          </a>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <RemovableTitleCard
              key={item.id}
              listId={watchlist.id}
              titleId={item.titleId}
              item={{
                tmdbId: item.title.tmdbId,
                mediaType: item.title.mediaType === "TV" ? "tv" : "movie",
                name: item.title.name,
                posterPath: item.title.posterPath,
                year: item.title.releaseDate?.slice(0, 4),
                voteAverage: item.title.voteAverage,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { RemovableTitleCard } from "@/components/RemovableTitleCard";
import { DeleteListButton } from "./DeleteListButton";

export const dynamic = "force-dynamic";

export default async function ListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      items: { include: { title: true }, orderBy: { addedAt: "desc" } },
    },
  });

  if (!list || list.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-xs text-muted">
        <Link href="/lists" className="hover:text-accent">
          ← All lists
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-foreground">
            {list.name.toUpperCase()}
          </h1>
          {list.description && (
            <p className="mt-1 text-sm text-muted">{list.description}</p>
          )}
          <p className="mt-1 text-xs text-muted">
            {list.items.length} title{list.items.length === 1 ? "" : "s"}
          </p>
        </div>
        {!list.isWatchlist && <DeleteListButton listId={list.id} />}
      </div>

      {list.items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">This list is empty.</p>
          <Link
            href="/search"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Find something to add →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list.items.map((item) => (
            <RemovableTitleCard
              key={item.id}
              listId={list.id}
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

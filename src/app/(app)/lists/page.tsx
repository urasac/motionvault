import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { CreateListForm } from "./CreateListForm";

export const dynamic = "force-dynamic";

export default async function ListsPage() {
  const user = await requireUser();

  const lists = await prisma.list.findMany({
    where: { userId: user.id, isWatchlist: false },
    orderBy: { createdAt: "desc" },
    include: {
      items: { take: 4, include: { title: true }, orderBy: { addedAt: "desc" } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-foreground">
            YOUR LISTS
          </h1>
          <p className="mt-1 text-sm text-muted">
            Custom collections you&apos;ve built.
          </p>
        </div>
        <CreateListForm />
      </div>

      {lists.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            No lists yet. Create one to start grouping titles.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/50"
            >
              <div className="flex items-center gap-1 -space-x-6">
                {list.items.length > 0 ? (
                  list.items.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-[2/3] w-16 overflow-hidden rounded-md border-2 border-surface bg-surface-2 shadow-lg"
                    >
                      {item.title.posterPath && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w185${item.title.posterPath}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex aspect-[2/3] w-16 items-center justify-center rounded-md border-2 border-surface bg-surface-2 text-lg">
                    🗂️
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">
                {list.name}
              </h2>
              {list.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted">
                  {list.description}
                </p>
              )}
              <p className="mt-2 text-xs text-accent">
                {list._count.items} title{list._count.items === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

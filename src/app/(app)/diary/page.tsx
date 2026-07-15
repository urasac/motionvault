import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { DiaryRow } from "@/components/DiaryRow";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const user = await requireUser();

  const entries = await prisma.watchEntry.findMany({
    where: { userId: user.id },
    orderBy: { watchedOn: "desc" },
    include: { title: true },
  });

  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const key = entry.watchedOn.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl tracking-wide text-foreground">
        DIARY
      </h1>
      <p className="mt-1 text-sm text-muted">
        {entries.length} entr{entries.length === 1 ? "y" : "ies"} logged.
      </p>

      {entries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            Nothing logged yet — go log something you&apos;ve watched.
          </p>
          <a
            href="/search"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Search titles →
          </a>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {Array.from(groups.entries()).map(([month, monthEntries]) => (
            <section key={month}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
                {month}
              </h2>
              <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
                {monthEntries.map((entry) => (
                  <DiaryRow
                    key={entry.id}
                    id={entry.id}
                    rating={entry.rating}
                    review={entry.review}
                    watchedOn={entry.watchedOn.toISOString()}
                    rewatch={entry.rewatch}
                    title={{
                      tmdbId: entry.title.tmdbId,
                      mediaType: entry.title.mediaType,
                      name: entry.title.name,
                      posterPath: entry.title.posterPath,
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RATING_LABELS = ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"];
const MONTH_FORMAT = new Intl.DateTimeFormat(undefined, { month: "short" });

function Bar({
  label,
  value,
  max,
  displayValue,
}: {
  label: string;
  value: number;
  max: number;
  displayValue: string | number;
}) {
  const heightPct = max === 0 ? 0 : Math.max(value > 0 ? 6 : 0, (value / max) * 100);
  return (
    <div className="flex flex-1 flex-col items-center gap-1.5" title={`${label}: ${displayValue}`}>
      <span className="text-[11px] font-medium text-muted tabular-nums">
        {value > 0 ? displayValue : ""}
      </span>
      <div className="flex h-32 w-full items-end justify-center">
        <div
          className="w-full max-w-[22px] rounded-t-[4px] bg-accent transition-all"
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const widthPct = max === 0 ? 0 : Math.max(value > 0 ? 4 : 0, (value / max) * 100);
  return (
    <div className="flex items-center gap-3" title={`${label}: ${value}`}>
      <span className="w-28 shrink-0 truncate text-xs text-muted">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${widthPct}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

export default async function StatsPage() {
  const user = await requireUser();

  const [entries, ratedEntries] = await Promise.all([
    prisma.watchEntry.findMany({
      where: { userId: user.id },
      include: { title: true },
    }),
    prisma.watchEntry.findMany({
      where: { userId: user.id, rating: { not: null } },
      select: { rating: true },
    }),
  ]);

  const uniqueTitleIds = new Set(entries.map((e) => e.titleId));
  const uniqueTitles = entries.filter(
    (e, idx) => entries.findIndex((x) => x.titleId === e.titleId) === idx
  );
  const movieCount = uniqueTitles.filter((e) => e.title.mediaType === "MOVIE").length;
  const seriesCount = uniqueTitles.filter((e) => e.title.mediaType === "TV").length;

  const avgRating =
    ratedEntries.length > 0
      ? ratedEntries.reduce((sum, e) => sum + (e.rating ?? 0), 0) / ratedEntries.length
      : null;

  const ratingBuckets = Array.from({ length: 10 }, (_, i) => {
    const bucket = i + 1;
    return ratedEntries.filter((e) => e.rating === bucket).length;
  });
  const maxRatingCount = Math.max(1, ...ratingBuckets);

  const genreCounts = new Map<string, number>();
  for (const id of uniqueTitleIds) {
    const entry = entries.find((e) => e.titleId === id);
    const genres = entry?.title.genres?.split(",").map((g) => g.trim()).filter(Boolean) ?? [];
    for (const genre of genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }
  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxGenreCount = Math.max(1, ...topGenres.map(([, count]) => count));

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_FORMAT.format(d) };
  });
  const monthCounts = months.map(({ key, label }) => {
    const [y, m] = key.split("-").map(Number);
    const count = entries.filter((e) => {
      const wd = e.watchedOn;
      return wd.getFullYear() === y && wd.getMonth() === m;
    }).length;
    return { label, count };
  });
  const maxMonthCount = Math.max(1, ...monthCounts.map((m) => m.count));

  const kpis = [
    { label: "Titles logged", value: uniqueTitleIds.size },
    { label: "Movies", value: movieCount },
    { label: "Series", value: seriesCount },
    { label: "Average rating", value: avgRating ? `${(avgRating / 2).toFixed(1)}★` : "—" },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-4xl tracking-wide text-foreground">STATS</h1>
      <p className="mt-1 text-sm text-muted">A look at your viewing habits.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface p-5">
            <p className="font-display text-3xl text-accent">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.label}</p>
          </div>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted">
            Log a few titles to see your stats take shape.
          </p>
        </div>
      ) : (
        <>
          <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 text-sm font-semibold text-foreground">
              Rating distribution
            </h2>
            <div className="flex gap-1.5 sm:gap-3">
              {ratingBuckets.map((count, i) => (
                <Bar
                  key={i}
                  label={RATING_LABELS[i]}
                  value={count}
                  max={maxRatingCount}
                  displayValue={count}
                />
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Top genres
              </h2>
              {topGenres.length === 0 ? (
                <p className="text-sm text-muted">No genre data yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {topGenres.map(([genre, count]) => (
                    <HorizontalBar
                      key={genre}
                      label={genre}
                      value={count}
                      max={maxGenreCount}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                Activity, last 12 months
              </h2>
              <div className="flex gap-1.5 sm:gap-2">
                {monthCounts.map((m, i) => (
                  <Bar
                    key={i}
                    label={m.label}
                    value={m.count}
                    max={maxMonthCount}
                    displayValue={m.count}
                  />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

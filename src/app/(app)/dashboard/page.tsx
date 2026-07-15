import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getTrending, titleOf, yearOf } from "@/lib/tmdb";
import { PosterCard } from "@/components/PosterCard";
import { StarRating } from "@/components/StarRating";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();

  const [totalWatched, thisYearCount, avgRatingResult, watchlistCount, recentEntries] =
    await Promise.all([
      prisma.watchEntry.count({ where: { userId: user.id } }),
      prisma.watchEntry.count({
        where: {
          userId: user.id,
          watchedOn: { gte: new Date(`${new Date().getFullYear()}-01-01`) },
        },
      }),
      prisma.watchEntry.aggregate({
        where: { userId: user.id, rating: { not: null } },
        _avg: { rating: true },
      }),
      prisma.listItem.count({
        where: { list: { userId: user.id, isWatchlist: true } },
      }),
      prisma.watchEntry.findMany({
        where: { userId: user.id },
        orderBy: { watchedOn: "desc" },
        take: 6,
        include: { title: true },
      }),
    ]);

  const avgRating = avgRatingResult._avg.rating;

  let trending: {
    id: number;
    media_type?: string;
    name: string;
    posterPath: string | null | undefined;
    year: string | null;
    voteAverage: number | null | undefined;
  }[] = [];
  try {
    const data = await getTrending("all", "day");
    trending = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 12)
      .map((r) => ({
        id: r.id,
        media_type: r.media_type,
        name: titleOf(r),
        posterPath: r.poster_path,
        year: yearOf(r),
        voteAverage: r.vote_average,
      }));
  } catch {
    trending = [];
  }

  const stats = [
    { label: "Titles logged", value: totalWatched },
    { label: `Logged in ${new Date().getFullYear()}`, value: thisYearCount },
    {
      label: "Average rating",
      value: avgRating ? (avgRating / 2).toFixed(1) : "—",
    },
    { label: "On watchlist", value: watchlistCount },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-4xl tracking-wide text-foreground">
        WELCOME BACK, {user.username.toUpperCase()}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Here&apos;s what&apos;s happening in your vault.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <p className="font-display text-3xl text-accent">{s.value}</p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Recent activity
          </h2>
          <Link href="/diary" className="text-xs text-accent hover:underline">
            View diary →
          </Link>
        </div>

        {recentEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
            <p className="text-sm text-muted">
              You haven&apos;t logged anything yet.
            </p>
            <Link
              href="/search"
              className="mt-3 inline-block text-sm text-accent hover:underline"
            >
              Find something to watch →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
            {recentEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/title/${entry.title.mediaType.toLowerCase()}/${entry.title.tmdbId}`}
                className="flex items-center gap-4 p-4 transition hover:bg-surface-2"
              >
                <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-surface-2">
                  {entry.title.posterPath && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://image.tmdb.org/t/p/w185${entry.title.posterPath}`}
                      alt={entry.title.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {entry.title.name}
                  </p>
                  <p className="text-xs text-muted">
                    {entry.watchedOn.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {entry.rewatch ? " · Rewatch" : ""}
                  </p>
                  {entry.rating !== null && (
                    <div className="mt-1">
                      <StarRating value={entry.rating} readOnly size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            Trending today
          </h2>
          <Link href="/search" className="text-xs text-accent hover:underline">
            Browse more →
          </Link>
        </div>
        {trending.length === 0 ? (
          <p className="text-sm text-muted">
            Trending titles are unavailable right now.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {trending.map((item) => (
              <PosterCard
                key={`${item.media_type}-${item.id}`}
                item={{
                  tmdbId: item.id,
                  mediaType: item.media_type === "tv" ? "tv" : "movie",
                  name: item.name,
                  posterPath: item.posterPath,
                  year: item.year,
                  voteAverage: item.voteAverage,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

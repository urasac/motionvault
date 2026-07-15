import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { getTrending, searchMulti, titleOf, yearOf } from "@/lib/tmdb";
import { PosterCard } from "@/components/PosterCard";
import { SearchBar } from "./SearchBar";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const query = q?.trim();

  let results: {
    id: number;
    media_type?: string;
    name: string;
    posterPath: string | null | undefined;
    year: string | null;
    voteAverage: number | null | undefined;
  }[] = [];
  let errored = false;
  let heading = "Trending this week";

  try {
    if (query) {
      heading = `Results for "${query}"`;
      const data = await searchMulti(query);
      results = data.results
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r) => ({
          id: r.id,
          media_type: r.media_type,
          name: titleOf(r),
          posterPath: r.poster_path,
          year: yearOf(r),
          voteAverage: r.vote_average,
        }));
    } else {
      const data = await getTrending("all", "week");
      results = data.results
        .filter((r) => r.media_type === "movie" || r.media_type === "tv")
        .map((r) => ({
          id: r.id,
          media_type: r.media_type,
          name: titleOf(r),
          posterPath: r.poster_path,
          year: yearOf(r),
          voteAverage: r.vote_average,
        }));
    }
  } catch {
    errored = true;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl tracking-wide text-foreground">
        SEARCH
      </h1>
      <div className="mt-4 max-w-xl">
        <SearchBar />
      </div>

      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-muted">
        {heading}
      </h2>

      {errored ? (
        <p className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Couldn&apos;t reach the movie database right now. Please try again
          shortly.
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted">
          No results found. Try a different title.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {results.map((item) => (
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

      <p className="mt-10 text-center text-xs text-muted">
        <Link href="/dashboard" className="hover:text-accent">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  backdropUrl,
  getDetails,
  posterUrl,
  profileUrl,
  titleOf,
  yearOf,
  type MediaType,
} from "@/lib/tmdb";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { TitleActions } from "@/components/TitleActions";
import { WatchEntryRow } from "@/components/WatchEntryRow";
import { PosterCard } from "@/components/PosterCard";
import type { TitleInput } from "@/lib/title-cache";

export const dynamic = "force-dynamic";

export default async function TitleDetailPage({
  params,
}: {
  params: Promise<{ mediaType: string; id: string }>;
}) {
  const { mediaType: rawMediaType, id } = await params;
  if (rawMediaType !== "movie" && rawMediaType !== "tv") notFound();
  const mediaType = rawMediaType as MediaType;
  const tmdbId = Number(id);
  if (!Number.isFinite(tmdbId)) notFound();

  const user = await requireUser();

  let details;
  try {
    details = await getDetails(mediaType, tmdbId);
  } catch {
    notFound();
  }

  const name = titleOf(details);
  const year = yearOf(details);
  const backdrop = backdropUrl(details.backdrop_path);
  const poster = posterUrl(details.poster_path, "w342");
  const runtime =
    mediaType === "movie"
      ? details.runtime
      : details.episode_run_time?.[0];

  const titleInput: TitleInput = {
    tmdbId,
    mediaType: mediaType === "movie" ? "MOVIE" : "TV",
    name,
    posterPath: details.poster_path ?? null,
    backdropPath: details.backdrop_path ?? null,
    releaseDate: details.release_date ?? details.first_air_date ?? null,
    overview: details.overview ?? null,
    voteAverage: details.vote_average ?? null,
    genres: details.genres?.map((g) => g.name).join(", ") ?? null,
  };

  const dbTitle = await prisma.title.findUnique({
    where: {
      tmdbId_mediaType: { tmdbId, mediaType: titleInput.mediaType },
    },
  });

  const [watchlistItem, favorite, entries, userLists] = dbTitle
    ? await Promise.all([
        prisma.listItem.findFirst({
          where: {
            titleId: dbTitle.id,
            list: { userId: user.id, isWatchlist: true },
          },
        }),
        prisma.favorite.findUnique({
          where: { userId_titleId: { userId: user.id, titleId: dbTitle.id } },
        }),
        prisma.watchEntry.findMany({
          where: { userId: user.id, titleId: dbTitle.id },
          orderBy: { watchedOn: "desc" },
        }),
        prisma.list.findMany({
          where: { userId: user.id, isWatchlist: false },
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [
        null,
        null,
        [],
        await prisma.list.findMany({
          where: { userId: user.id, isWatchlist: false },
          orderBy: { createdAt: "desc" },
        }),
      ];

  const cast = details.credits?.cast?.slice(0, 10) ?? [];
  const similar = details.similar?.results?.slice(0, 12) ?? [];

  return (
    <div className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-10 lg:-mt-10">
      <div className="relative">
        {backdrop && (
          <div className="absolute inset-0 -z-10 h-[420px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backdrop}
              alt=""
              className="h-full w-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
          </div>
        )}

        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-56">
              <div className="aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface-2 shadow-2xl">
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={poster}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl">
                    🎞️
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                {mediaType === "movie" ? "Movie" : "TV Series"}
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-wide text-foreground sm:text-5xl">
                {name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {year && <span>{year}</span>}
                {runtime ? <span>· {runtime} min</span> : null}
                {mediaType === "tv" && details.number_of_seasons ? (
                  <span>
                    · {details.number_of_seasons} season
                    {details.number_of_seasons > 1 ? "s" : ""}
                  </span>
                ) : null}
                {typeof details.vote_average === "number" &&
                  details.vote_average > 0 && (
                    <span className="text-accent">
                      ★ {details.vote_average.toFixed(1)}
                    </span>
                  )}
              </div>
              {details.genres && details.genres.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {details.genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}
              {details.tagline && (
                <p className="mt-4 text-sm italic text-muted">
                  &ldquo;{details.tagline}&rdquo;
                </p>
              )}
              {details.overview && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/90">
                  {details.overview}
                </p>
              )}

              <div className="mt-6">
                <TitleActions
                  title={titleInput}
                  initialInWatchlist={Boolean(watchlistItem)}
                  initialIsFavorite={Boolean(favorite)}
                  userLists={userLists}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-10">
        {cast.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              Cast
            </h2>
            <div className="scrollbar-none flex gap-4 overflow-x-auto pb-2">
              {cast.map((member) => (
                <div key={member.id} className="w-24 shrink-0 text-center">
                  <div className="aspect-square overflow-hidden rounded-full border border-border bg-surface-2">
                    {profileUrl(member.profile_path) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileUrl(member.profile_path) ?? ""}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg">
                        👤
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs font-medium text-foreground">
                    {member.name}
                  </p>
                  <p className="truncate text-[11px] text-muted">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-base font-semibold text-foreground">
            Your activity{" "}
            {entries.length > 0 && (
              <span className="text-muted">({entries.length})</span>
            )}
          </h2>
          {entries.length === 0 ? (
            <p className="text-sm text-muted">
              You haven&apos;t logged this yet. Hit &ldquo;+ Log this&rdquo;
              above once you&apos;ve watched it.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <WatchEntryRow
                  key={entry.id}
                  id={entry.id}
                  rating={entry.rating}
                  review={entry.review}
                  watchedOn={entry.watchedOn.toISOString()}
                  rewatch={entry.rewatch}
                />
              ))}
            </div>
          )}
        </section>

        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 text-base font-semibold text-foreground">
              More like this
            </h2>
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
              {similar.map((item) => (
                <PosterCard
                  key={item.id}
                  item={{
                    tmdbId: item.id,
                    mediaType,
                    name: titleOf(item),
                    posterPath: item.poster_path,
                    year: yearOf(item),
                    voteAverage: item.vote_average,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 text-center text-xs text-muted">
          <Link href="/search" className="hover:text-accent">
            ← Back to search
          </Link>
        </p>
      </div>
    </div>
  );
}

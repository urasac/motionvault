import { prisma } from "@/lib/prisma";
import type { MediaType } from "@prisma/client";

export interface TitleInput {
  tmdbId: number;
  mediaType: MediaType;
  name: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  overview?: string | null;
  voteAverage?: number | null;
  genres?: string | null;
}

export async function upsertTitle(input: TitleInput) {
  return prisma.title.upsert({
    where: {
      tmdbId_mediaType: { tmdbId: input.tmdbId, mediaType: input.mediaType },
    },
    update: {
      name: input.name,
      posterPath: input.posterPath ?? undefined,
      backdropPath: input.backdropPath ?? undefined,
      releaseDate: input.releaseDate ?? undefined,
      overview: input.overview ?? undefined,
      voteAverage: input.voteAverage ?? undefined,
      genres: input.genres ?? undefined,
    },
    create: {
      tmdbId: input.tmdbId,
      mediaType: input.mediaType,
      name: input.name,
      posterPath: input.posterPath,
      backdropPath: input.backdropPath,
      releaseDate: input.releaseDate,
      overview: input.overview,
      voteAverage: input.voteAverage,
      genres: input.genres,
    },
  });
}

export async function ensureWatchlist(userId: string) {
  const existing = await prisma.list.findFirst({
    where: { userId, isWatchlist: true },
  });
  if (existing) return existing;
  return prisma.list.create({
    data: {
      userId,
      name: "Watchlist",
      isWatchlist: true,
      description: "Titles you want to watch",
    },
  });
}

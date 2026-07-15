import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";

export interface PosterItem {
  tmdbId: number;
  mediaType: "movie" | "tv";
  name: string;
  posterPath?: string | null;
  year?: string | null;
  voteAverage?: number | null;
}

export function PosterCard({ item }: { item: PosterItem }) {
  const src = posterUrl(item.posterPath, "w342");

  return (
    <Link
      href={`/title/${item.mediaType}/${item.tmdbId}`}
      className="group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface-2">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
            <span className="text-2xl">🎞️</span>
            <span className="text-xs text-muted">{item.name}</span>
          </div>
        )}
        {typeof item.voteAverage === "number" && item.voteAverage > 0 && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-sm">
            ★ {item.voteAverage.toFixed(1)}
          </span>
        )}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted backdrop-blur-sm">
          {item.mediaType === "movie" ? "Movie" : "TV"}
        </span>
        <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100 group-hover:bg-black/20" />
      </div>
      <p className="mt-2 truncate text-sm font-medium text-foreground group-hover:text-accent">
        {item.name}
      </p>
      {item.year && <p className="text-xs text-muted">{item.year}</p>}
    </Link>
  );
}

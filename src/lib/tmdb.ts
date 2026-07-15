const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBResult {
  id: number;
  media_type?: MediaType;
  title?: string; // movie
  name?: string; // tv
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string; // movie
  first_air_date?: string; // tv
  vote_average?: number;
  genre_ids?: number[];
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  id: string;
  key: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TMDBDetails extends TMDBResult {
  genres?: TMDBGenre[];
  runtime?: number; // movie
  episode_run_time?: number[]; // tv
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
  credits?: { cast: TMDBCastMember[] };
  videos?: { results: TMDBVideo[] };
  similar?: TMDBPaginatedResponse<TMDBResult>;
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string | number | undefined> = {}
): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not configured");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB request failed (${res.status}): ${path} ${body}`);
  }

  return res.json() as Promise<T>;
}

export function posterUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "original" = "w342"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(
  path: string | null | undefined,
  size: "w780" | "w1280" | "original" = "w1280"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w185${path}`;
}

export function titleOf(result: { title?: string; name?: string }): string {
  return result.title ?? result.name ?? "Untitled";
}

export function yearOf(result: {
  release_date?: string;
  first_air_date?: string;
}): string | null {
  const date = result.release_date || result.first_air_date;
  return date ? date.slice(0, 4) : null;
}

export async function getTrending(
  mediaType: "all" | MediaType = "all",
  window: "day" | "week" = "week"
) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBResult>>(
    `/trending/${mediaType}/${window}`
  );
}

export async function searchMulti(query: string, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBResult>>(`/search/multi`, {
    query,
    page,
    include_adult: "false",
  });
}

export async function discoverByType(mediaType: MediaType, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBResult>>(
    `/discover/${mediaType}`,
    { page, sort_by: "popularity.desc" }
  );
}

export async function getTopRated(mediaType: MediaType, page = 1) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBResult>>(
    `/${mediaType}/top_rated`,
    { page }
  );
}

export async function getDetails(mediaType: MediaType, id: number | string) {
  return tmdbFetch<TMDBDetails>(`/${mediaType}/${id}`, {
    append_to_response: "credits,videos,similar",
  });
}

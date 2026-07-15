# Motion Vault

A movie & TV series logging site. Register, log what you watch, rate and
review it, build watchlists and custom collections, and track your stats —
powered by [TMDB](https://www.themoviedb.org/) for movie/series data.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (via the `better-sqlite3` driver adapter)
- NextAuth (Auth.js) v5 with a credentials (username/email + password) provider
- TMDB API for search, trending, and title details

## Getting started

```bash
npm install
npx prisma migrate dev   # creates dev.db and applies the schema
npm run dev
```

Environment variables live in `.env` (already populated for local dev):

- `DATABASE_URL` — SQLite file path
- `TMDB_API_KEY` — TMDB v3 API key
- `AUTH_SECRET` — NextAuth session secret (replace for production)

## Features

- Registration + login (username, email, password)
- Dashboard with quick stats, recent activity, and trending titles
- Search across movies and TV series via TMDB
- Title detail pages: log a watch (rating, review, date, rewatch), favorite,
  add to your watchlist or any custom list
- Default watchlist plus user-created custom lists
- Diary of everything you've logged, grouped by month
- Stats page: rating distribution, top genres, and monthly activity

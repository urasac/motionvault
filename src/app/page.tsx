import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { getTrending, posterUrl } from "@/lib/tmdb";

async function getHeroPosters() {
  try {
    const trending = await getTrending("all", "week");
    return trending.results
      .filter((r) => r.poster_path)
      .slice(0, 18)
      .map((r) => posterUrl(r.poster_path, "w342"));
  } catch {
    return [];
  }
}

const features = [
  {
    title: "Log every watch",
    body: "Mark movies and episodes as watched, rate them, and write reviews the moment the credits roll.",
    icon: "🎬",
  },
  {
    title: "Build watchlists",
    body: "Queue up what's next with your default watchlist, or spin up themed collections like \"90s Horror\" or \"Oscar Bait\".",
    icon: "📼",
  },
  {
    title: "Track your taste",
    body: "See your stats evolve — total titles watched, favorite genres, average rating, and your busiest binge months.",
    icon: "📊",
  },
  {
    title: "Discover what's next",
    body: "Search millions of titles powered by TMDB and surface what's trending right now.",
    icon: "🔍",
  },
];

export default async function Home() {
  const posters = await getHeroPosters();

  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Get started
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        {posters.length > 0 && (
          <div
            className="pointer-events-none absolute inset-0 -z-10 grid grid-cols-6 gap-2 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)] sm:grid-cols-9"
            aria-hidden
          >
            {posters.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src ?? ""}
                alt=""
                className="aspect-[2/3] w-full rounded-md object-cover"
              />
            ))}
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background to-background"
          aria-hidden
        />

        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center">
          <span className="mb-4 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium tracking-wide text-muted">
            Your personal cinema logbook
          </span>
          <h1 className="font-display text-6xl tracking-wide text-foreground sm:text-7xl">
            EVERY MOVIE. <span className="text-accent">EVERY SERIES.</span>{" "}
            LOCKED IN.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Motion Vault is where you log what you watch, rate and review it,
            build watchlists, and watch your taste take shape over time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Create your vault</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/50"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-surface-2 px-8 py-14 text-center">
          <h2 className="font-display text-4xl tracking-wide text-foreground">
            READY TO START YOUR VAULT?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">
            It&apos;s free, it&apos;s fast, and your first watchlist is one
            click away.
          </p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">Get started — it&apos;s free</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted">
        Motion Vault · Movie &amp; TV data provided by{" "}
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-accent"
        >
          TMDB
        </a>
        . This product is not endorsed or certified by TMDB.
      </footer>
    </main>
  );
}

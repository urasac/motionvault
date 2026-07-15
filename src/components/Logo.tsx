import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 font-display tracking-wide ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground text-lg leading-none">
        ▮
      </span>
      <span className="text-2xl text-foreground">
        MOTION <span className="text-accent">VAULT</span>
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/watchlist", label: "Watchlist", icon: "📼" },
  { href: "/lists", label: "Lists", icon: "🗂️" },
  { href: "/diary", label: "Diary", icon: "📖" },
  { href: "/stats", label: "Stats", icon: "📊" },
];

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-surface-2 hover:text-foreground"
            }`}
          >
            <span aria-hidden>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({
  username,
  avatarColor,
}: {
  username: string;
  avatarColor: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {username.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {username}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer text-xs text-muted hover:text-accent"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AppNav({
  username,
  avatarColor,
}: {
  username: string;
  avatarColor: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="mb-8 px-1">
          <Logo />
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-6">
          <UserFooter username={username} avatarColor={avatarColor} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <Logo />
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="cursor-pointer rounded-lg border border-border p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>
      {mobileOpen && (
        <div className="flex flex-col gap-4 border-b border-border bg-surface px-4 py-4 md:hidden">
          <NavLinks
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
          <UserFooter username={username} avatarColor={avatarColor} />
        </div>
      )}
    </>
  );
}

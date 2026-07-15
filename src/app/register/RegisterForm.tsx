"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-lg border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/60";

export function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created. Please sign in.");
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-muted">
          Username
        </label>
        <input
          id="username"
          className={inputClass}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="cinephile42"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

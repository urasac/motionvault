import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">
            Log in to get back to your vault.
          </p>
          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h1 className="text-xl font-semibold text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">
            Start logging what you watch.
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

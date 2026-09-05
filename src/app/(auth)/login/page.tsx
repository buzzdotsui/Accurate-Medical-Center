"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await signIn.email({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message || "Invalid email or password. Please try again.");
      return;
    }

    if (data) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-playfair text-4xl font-extrabold leading-[1.04] tracking-[-0.035em] text-foreground sm:text-[2.65rem]">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Enter your credentials to access the portal.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="doctor@accuratemedical.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className={`h-12 rounded-xl bg-white px-4 shadow-sm transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground/55 ${error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-black/[0.1] focus-visible:border-primary focus-visible:ring-primary/20"}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/70">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/75 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className={`h-12 rounded-xl bg-white px-4 shadow-sm transition-[border-color,box-shadow] duration-200 ${error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-black/[0.1] focus-visible:border-primary focus-visible:ring-primary/20"}`}
          />
        </div>

        {error && (
          <div id="login-error" role="alert" aria-live="polite" className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm leading-5 text-destructive">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-[0_12px_28px_rgba(3,22,26,0.16)] transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary/90 hover:shadow-[0_16px_34px_rgba(3,22,26,0.2)] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4" loading={loading}>
          Sign in
        </Button>
      </form>

      <div className="border-t border-black/[0.08] pt-5 text-center text-xs leading-5 text-muted-foreground">
        Patient access portal coming soon.{" "}
        <Link href="/patient" className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/75 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Learn more
        </Link>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth/client";
import { AlertCircle, LockKeyhole, Mail } from "lucide-react";
import { displayHeadingClassName, displayHeadingStyle, displayHeadingVariantClassNames } from "@/marketing/typography";
import { contentReveal, headingReveal, pageReveal } from "@/marketing/animations";
import { motion } from "framer-motion";

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
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="space-y-8 sm:space-y-9">
      <motion.div variants={contentReveal} className="space-y-3">
        <motion.p variants={contentReveal} className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Staff portal</motion.p>
        <motion.h1
          variants={headingReveal}
          className={`${displayHeadingClassName} ${displayHeadingVariantClassNames.auth} text-foreground`}
          style={displayHeadingStyle}
        >
          Welcome back
        </motion.h1>
        <motion.p variants={contentReveal} className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
          Enter your credentials to access the portal.
        </motion.p>
      </motion.div>

      <motion.form variants={contentReveal} className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
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
            icon={<Mail aria-hidden className="h-4 w-4" />}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className={`h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 placeholder:text-muted-foreground/50 focus-visible:-translate-y-px focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)] ${error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-black/[0.1] focus-visible:border-primary focus-visible:ring-primary/20"}`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
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
            icon={<LockKeyhole aria-hidden className="h-4 w-4" />}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className={`h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:-translate-y-px focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)] ${error ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20" : "border-black/[0.1] focus-visible:border-primary focus-visible:ring-primary/20"}`}
          />
        </div>

        {error && (
          <div id="login-error" role="alert" aria-live="polite" className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm leading-5 text-destructive">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-[0.95rem] font-bold tracking-wide text-primary-foreground shadow-[0_12px_28px_rgba(3,22,26,0.16)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_36px_rgba(3,22,26,0.22)] active:translate-y-0 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4" loading={loading}>
          Sign in
        </Button>
      </motion.form>

      <motion.div variants={contentReveal} className="rounded-2xl border border-black/[0.07] bg-white/60 px-4 py-4 text-center text-xs leading-5 text-muted-foreground shadow-sm">
        Patient access portal coming soon.{" "}
        <Link href="/patient" className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/75 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          Learn more
        </Link>
      </motion.div>
    </motion.div>
  );
}

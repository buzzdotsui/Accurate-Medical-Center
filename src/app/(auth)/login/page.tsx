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
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="space-y-10 sm:space-y-12">
      <motion.div variants={contentReveal} className="space-y-4">
        <motion.p variants={contentReveal} className="text-xs font-bold uppercase tracking-[0.2em] text-primary/70">Staff portal</motion.p>
        <motion.h1
          variants={headingReveal}
          className={`${displayHeadingClassName} text-4xl sm:text-5xl text-foreground`}
          style={displayHeadingStyle}
        >
          Welcome back
        </motion.h1>
        <motion.p variants={contentReveal} className="max-w-sm text-base leading-7 text-muted-foreground sm:text-lg">
          Enter your credentials to access the portal.
        </motion.p>
      </motion.div>

      <motion.form variants={contentReveal} className="space-y-6" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="space-y-3">
          <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60 ml-2">
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
            icon={<Mail aria-hidden className="h-5 w-5 text-muted-foreground/50" />}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className="h-14 text-base bg-black/[0.03] border-transparent hover:bg-black/[0.05] focus-visible:bg-white focus-visible:border-primary/30 focus-visible:shadow-[0_0_0_4px_rgba(212,232,66,0.15)] transition-all rounded-2xl px-5"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60 ml-2">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:text-primary/75 focus-visible:outline-none"
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
            icon={<LockKeyhole aria-hidden className="h-5 w-5 text-muted-foreground/50" />}
            error={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            className="h-14 text-base bg-black/[0.03] border-transparent hover:bg-black/[0.05] focus-visible:bg-white focus-visible:border-primary/30 focus-visible:shadow-[0_0_0_4px_rgba(212,232,66,0.15)] transition-all rounded-2xl px-5"
          />
        </div>

        {error && (
          <div id="login-error" role="alert" aria-live="polite" className="flex items-start gap-3 rounded-2xl border-none bg-destructive/[0.08] px-5 py-4 text-sm leading-5 text-destructive font-medium">
            <AlertCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full mt-6 h-14 text-lg rounded-2xl shadow-lg shadow-primary/20" size="lg" loading={loading}>
          Sign in
        </Button>
      </motion.form>

      <motion.div variants={contentReveal} className="rounded-2xl border-none bg-black/[0.02] px-5 py-6 text-center text-sm leading-5 text-muted-foreground">
        Patients: sign in with your registered account above.{" "}
        <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
          Create a patient account
        </Link>
      </motion.div>
    </motion.div>
  );
}

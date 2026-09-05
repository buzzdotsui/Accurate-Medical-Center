"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, signIn } from "@/lib/auth/client";
import { displayHeadingClassName } from "@/marketing/typography";
import { contentReveal, headingReveal, pageReveal } from "@/marketing/animations";
import { motion } from "framer-motion";
import { AlertCircle, LockKeyhole, Mail, UserRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Step 1: Create the Better Auth user account
    const { data, error: authError } = await signUp.email({
      email,
      password,
      name: `${firstName} ${lastName}`.trim(),
    });

    if (authError) {
      setLoading(false);
      setError(authError.message || "Failed to create account. Please try again.");
      return;
    }

    if (!data) {
      setLoading(false);
      setError("Registration failed unexpectedly. Please try again.");
      return;
    }

    // Step 2: Sign in to create a session (autoSignIn is disabled in auth config)
    const { error: signInError } = await signIn.email({ email, password });

    if (signInError) {
      setLoading(false);
      setError(
        "Account created but automatic sign-in failed. Please sign in manually at /login."
      );
      return;
    }

    // Step 3: Create the Patient profile linked to this auth account
    try {
      const res = await fetch('/api/v1/patients/self-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' is the default for same-origin fetches
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        setLoading(false);
        // Safe recovery: auth user exists — direct them to login, server can create profile on next visit
        setError(
          result.error
            ? `${result.error} — Please sign in to complete your profile setup.`
            : "Account created, but patient profile setup failed. Please sign in and contact support if this persists."
        );
        return;
      }

      // Success — navigate to the role-based dashboard router
      router.push("/dashboard");
      router.refresh();
    } catch (_err) {
      setLoading(false);
      setError(
        "Network error while creating patient profile. Your account was created — please sign in at /login."
      );
    }
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal} className="space-y-8 sm:space-y-9">
      <motion.div variants={contentReveal} className="space-y-3">
        <motion.p variants={contentReveal} className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">New staff profile</motion.p>
        <motion.h1 variants={headingReveal} className={`${displayHeadingClassName} text-[clamp(2.2rem,8.5vw,2.85rem)] text-foreground`}>
          Create Patient Account
        </motion.h1>
        <motion.p variants={contentReveal} className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
          Sign up to access your medical records and appointments.
        </motion.p>
      </motion.div>

      <motion.form variants={contentReveal} className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
              First name
            </label>
            <Input 
              id="firstName" 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              icon={<UserRound aria-hidden className="h-4 w-4" />}
              className="h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
              Last name
            </label>
            <Input 
              id="lastName" 
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              icon={<UserRound aria-hidden className="h-4 w-4" />}
              className="h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
            Email address
          </label>
          <Input 
            id="email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<Mail aria-hidden className="h-4 w-4" />}
            className="h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)]"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-foreground/65">
            Password
          </label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            icon={<LockKeyhole aria-hidden className="h-4 w-4" />}
            className="h-12 rounded-2xl bg-white px-4 pl-11 text-[0.95rem] shadow-[0_6px_20px_rgba(3,22,26,0.04)] transition-[border-color,box-shadow,transform] duration-200 focus-visible:-translate-y-px focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:shadow-[0_10px_24px_rgba(3,22,26,0.08)]"
          />
        </div>

        {error && (
          <div id="register-error" role="alert" aria-live="polite" className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.06] px-4 py-3 text-sm leading-5 text-destructive">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" className="h-12 w-full rounded-2xl bg-primary text-[0.95rem] font-bold tracking-wide text-primary-foreground shadow-[0_12px_28px_rgba(3,22,26,0.16)] transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_18px_36px_rgba(3,22,26,0.22)] active:translate-y-0 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </motion.form>

      <motion.div variants={contentReveal} className="rounded-2xl border border-black/[0.07] bg-white/60 px-4 py-4 text-center text-sm leading-5 text-muted-foreground shadow-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </motion.div>
    </motion.div>
  );
}

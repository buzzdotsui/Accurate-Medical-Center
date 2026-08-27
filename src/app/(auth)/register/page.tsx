"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp, signIn } from "@/lib/auth/client";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Create Patient Account
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign up to access your medical records and appointments.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First name
            </label>
            <Input 
              id="firstName" 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last name
            </label>
            <Input 
              id="lastName" 
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address
          </label>
          <Input 
            id="email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

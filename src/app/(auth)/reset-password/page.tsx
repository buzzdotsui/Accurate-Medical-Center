"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth/client";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect to forgot-password if no token in URL
  if (!token) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Invalid reset link
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              This password reset link is missing or invalid. Please request a new one.
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="w-full h-11">
          <Link href="/forgot-password">Request new reset link</Link>
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Password updated
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
        </div>
        <Button asChild className="w-full h-11">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: authError } = await resetPassword({
      token: token!,
      newPassword,
    });

    setLoading(false);

    if (authError) {
      setError(
        authError.message?.toLowerCase().includes("expired") || authError.message?.toLowerCase().includes("invalid")
          ? "This reset link has expired or is invalid. Please request a new one."
          : authError.message || "Failed to reset password. Please try again."
      );
      return;
    }

    setSuccess(true);
    // Also redirect after a short delay
    setTimeout(() => router.push("/login"), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Set new password
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Choose a strong password for your account.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            New password
          </label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              error={!!error}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
            Confirm password
          </label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            error={!!error}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p>{error}</p>
              {(error.includes("expired") || error.includes("invalid")) && (
                <Link
                  href="/forgot-password"
                  className="underline font-medium hover:no-underline mt-1 inline-block"
                >
                  Request a new reset link
                </Link>
              )}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-semibold" loading={loading}>
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-muted rounded-lg w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-11 bg-muted rounded-lg" />
          <div className="h-11 bg-muted rounded-lg" />
          <div className="h-11 bg-muted rounded-lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

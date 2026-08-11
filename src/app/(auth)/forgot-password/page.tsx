"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // In a real implementation, we would call the authClient.forgetPassword here
    // await authClient.forgetPassword({ email, redirectTo: "/reset-password" });
    
    // Simulate API call for now
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Check your email
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm">
              We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
            </p>
          </div>
        </div>
        
        <Button asChild variant="outline" className="w-full h-11">
          <Link href="/login">Return to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
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
          />
        </div>

        <Button type="submit" className="w-full h-11 text-base font-semibold" loading={loading}>
          Send reset link
        </Button>
      </form>
    </div>
  );
}

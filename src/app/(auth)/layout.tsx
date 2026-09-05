import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Stethoscope, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { BrandLockup } from "@/marketing/BrandLockup";
import { displayHeadingClassName } from "@/marketing/typography";
import { MotionConfig } from "framer-motion";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
    <div data-auth className="flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-[#f7f8f5] lg:grid lg:grid-cols-[minmax(24rem,0.82fr)_minmax(34rem,1.18fr)]">
      {/* Left Pane - Auth Form */}
      <div className="order-2 flex min-w-0 flex-1 flex-col justify-center border-t border-black/[0.07] px-5 py-9 sm:px-10 sm:py-12 lg:order-1 lg:min-h-screen lg:border-r lg:border-t-0 lg:px-[clamp(2.5rem,6vw,7rem)] lg:py-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center justify-between gap-4 sm:mb-12">
            <Link href="/" className="group flex min-w-0 items-center gap-3 text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
              <Logo className="h-8 w-8 shrink-0 text-primary sm:h-9 sm:w-9" />
              <BrandLockup size="header" className="text-primary" />
            </Link>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/40 sm:block">
              Portal access
            </span>
          </div>
          {children}
        </div>
      </div>

      {/* Right Pane - Visual/Brand */}
      <div className="order-1 relative flex min-h-[300px] w-full overflow-hidden bg-primary sm:min-h-[360px] lg:order-2 lg:min-h-screen">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(244,242,245,0.14),transparent_42%),radial-gradient(circle_at_0%_100%,rgba(244,242,245,0.08),transparent_38%)]" />
        <div aria-hidden className="absolute inset-4 rounded-[1.5rem] border border-white/[0.09] sm:inset-7 sm:rounded-[2rem] lg:inset-12 xl:inset-16" />

        <div className="relative flex w-full flex-col justify-end px-7 pb-10 pt-20 sm:px-12 sm:pb-14 lg:justify-center lg:px-16 lg:py-16 xl:px-24">
          <div className="max-w-2xl space-y-7 text-white sm:space-y-10 lg:space-y-12">
            <div className="space-y-5">
              <p className="auth-reveal text-[9px] font-bold uppercase tracking-[0.3em] text-white/55 sm:text-[10px]" style={{ animationDelay: "80ms" }}>
                Secure staff portal
              </p>
              <h2 className={`auth-reveal max-w-xl text-[clamp(2.35rem,7vw,5.3rem)] ${displayHeadingClassName}`} style={{ animationDelay: "160ms" }}>
                Healing Minds.<br />Restoring Lives.
              </h2>
              <p className="auth-reveal max-w-xl text-sm leading-[1.75] text-white/70 sm:text-lg" style={{ animationDelay: "260ms" }}>
                Welcome to the staff and administrative portal for Accurate Medical Center.
                <br />
                Sign in to access your workspace.
              </p>
            </div>

            <div className="auth-reveal flex items-center gap-3 text-[11px] font-semibold tracking-wide text-white/60 lg:hidden" style={{ animationDelay: "340ms" }}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08]">
                <ShieldCheck aria-hidden className="h-4 w-4 text-white/80" />
              </span>
              Secure, private clinical workspace
            </div>

            <div className="auth-reveal hidden grid-cols-1 gap-7 border-t border-white/[0.14] pt-8 sm:grid-cols-3 sm:gap-6 lg:grid" style={{ animationDelay: "360ms" }}>
              <div className="space-y-3 border-l border-white/[0.12] pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08]">
                  <Stethoscope aria-hidden className="h-4 w-4 text-white/80" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">Clinical Excellence</h3>
                <p className="text-sm leading-relaxed text-white/55">
                  Delivering precise, evidence-based care to every patient, every time.
                </p>
              </div>
              <div className="space-y-3 border-l border-white/[0.12] pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08]">
                  <ShieldCheck aria-hidden className="h-4 w-4 text-white/80" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">Patient Privacy</h3>
                <p className="text-sm leading-relaxed text-white/55">
                  Strict confidentiality and HIPAA-compliant data practices.
                </p>
              </div>
              <div className="space-y-3 border-l border-white/[0.12] pl-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.16] bg-white/[0.08]">
                  <Clock aria-hidden className="h-4 w-4 text-white/80" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">Timely Service</h3>
                <p className="text-sm leading-relaxed text-white/55">
                  Optimized workflows to reduce wait times and improve outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MotionConfig>
  );
}

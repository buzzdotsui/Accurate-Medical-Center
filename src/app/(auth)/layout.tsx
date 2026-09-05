import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Stethoscope, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { BrandLockup } from "@/marketing/BrandLockup";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div data-auth className="flex min-h-screen flex-col bg-[#f7f8f5] lg:flex-row">
      {/* Left Pane - Auth Form */}
      <div className="order-2 flex flex-1 flex-col justify-center border-t border-black/[0.06] px-4 py-12 sm:px-6 lg:order-1 lg:flex-none lg:border-t-0 lg:border-r lg:px-20 lg:py-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="group mb-8 flex items-center gap-3 text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
              <Logo className="w-8 h-8 text-primary" />
              <BrandLockup size="header" className="text-primary" />
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right Pane - Visual/Brand */}
      <div className="order-1 relative flex min-h-[560px] w-full overflow-hidden bg-primary lg:order-2 lg:min-h-screen lg:w-0 lg:flex-1">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(244,242,245,0.14),transparent_42%),radial-gradient(circle_at_0%_100%,rgba(244,242,245,0.08),transparent_38%)]" />
        <div aria-hidden className="absolute inset-8 rounded-[2rem] border border-white/[0.09] lg:inset-12 xl:inset-16" />
        
        <div className="relative flex w-full flex-col justify-center px-10 py-16 sm:px-16 lg:p-16 xl:p-24">
          <div className="max-w-2xl space-y-10 text-white lg:space-y-12">
            <div className="space-y-5">
              <p className="auth-reveal text-[10px] font-semibold uppercase tracking-[0.32em] text-white/55" style={{ animationDelay: "80ms" }}>
                Secure staff portal
              </p>
              <h2 className="auth-reveal max-w-xl font-playfair text-[clamp(2.7rem,5vw,5.3rem)] font-extrabold leading-[0.98] tracking-[-0.04em]" style={{ animationDelay: "160ms" }}>
                Healing Minds.<br/>Restoring Lives.
              </h2>
              <p className="auth-reveal max-w-xl text-base leading-[1.8] text-white/70 sm:text-lg" style={{ animationDelay: "260ms" }}>
                Welcome to the staff and administrative portal for Accurate Medical Center. Sign in to access your workspace.
              </p>
            </div>
            
            <div className="auth-reveal grid grid-cols-1 gap-7 border-t border-white/[0.14] pt-8 sm:grid-cols-3 sm:gap-6" style={{ animationDelay: "360ms" }}>
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
  );
}

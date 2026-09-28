import { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Stethoscope, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { BrandLockup } from "@/marketing/BrandLockup";
import { displayHeadingClassName, displayHeadingStyle } from "@/marketing/typography";
import { MotionConfig } from "framer-motion";
import { AuthBrandAnim } from "./_components/AuthBrandAnim";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div data-auth className="flex min-h-screen min-h-[100svh] w-full flex-col bg-[#fdfdfc] lg:flex-row">
        
        {/* Left Side: Auth Form (40%) */}
        <div className="order-2 flex w-full flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:order-1 lg:w-[40%] lg:flex-none lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
            {/* Mobile Logo */}
            <div className="mb-10 lg:hidden">
              <Link href="/" className="group flex items-center gap-3 text-primary transition-opacity hover:opacity-80">
                <Logo className="h-8 w-8 shrink-0 text-primary" />
                <BrandLockup size="header" className="text-primary" />
              </Link>
            </div>
            
            {children}
          </div>
        </div>

        {/* Right Side: Massive Brand Area (60%) */}
        <div className="order-1 relative hidden w-full flex-1 lg:order-2 lg:flex lg:w-[60%]">
          {/* Background Image with Perfect Cinematic Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ 
              backgroundImage: 'url("/images/IMG-20260813-WA0025.jpg")' 
            }}
          />
          {/* Deepen the contrast with a multiply blend */}
          <div className="absolute inset-0 bg-[#061815]/90 mix-blend-multiply" />
          
          {/* Add the brand primary color as a rich gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/95 via-primary/70 to-transparent mix-blend-color" />
          
          {/* Soft vignette and vertical gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/40 to-primary/95" />
          
          {/* Add a very subtle noise/glow effect for texture */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />

          {/* Brand Content */}
          <div className="relative z-10 flex h-full w-full flex-col justify-between px-16 py-20 xl:px-24 xl:py-24">
            <Link href="/" className="group flex items-center gap-3 text-white transition-transform hover:scale-105 focus-visible:outline-none">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-2xl">
                <Logo className="h-8 w-8 shrink-0" />
              </div>
              <BrandLockup size="header" className="text-white" />
            </Link>

            <div className="flex flex-col justify-end space-y-10 pb-8 h-full">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-[#d4e842]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Secure Portal Access
                  </span>
                </div>
                <h2 
                  className="max-w-2xl text-[clamp(3rem,8vw,6.5rem)] font-extrabold leading-[1.05] tracking-tight text-white" 
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Healing Minds.<br />Restoring Lives.
                </h2>
              </div>
              
              <div className="pt-6 border-t border-white/10">
                <AuthBrandAnim />
              </div>
            </div>
          </div>
        </div>

      </div>
    </MotionConfig>
  );
}

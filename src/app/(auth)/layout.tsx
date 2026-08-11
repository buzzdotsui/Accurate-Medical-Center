import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Stethoscope, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Pane - Auth Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3 font-heading font-bold text-2xl text-primary mb-8 hover:opacity-80 transition-opacity">
              <Logo className="w-8 h-8 text-primary" />
              <span className="leading-none flex flex-col">
                <span>{siteConfig.shortName}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-medium mt-0.5">Medical Center</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>

      {/* Right Pane - Visual/Brand */}
      <div className="relative hidden w-0 flex-1 lg:block bg-grey-900 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[120px] opacity-10 -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-[100px] opacity-5 -ml-64 -mb-64" />
        
        <div className="relative h-full flex flex-col justify-center p-16 xl:p-24">
          <div className="max-w-2xl text-white space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl xl:text-5xl font-heading font-bold leading-tight">
                Healing Minds.<br/>Restoring Lives.
              </h2>
              <p className="text-lg text-grey-300 max-w-xl">
                Welcome to the staff and administrative portal for Accurate Medical Center. Sign in to access your workspace.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-grey-800">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">Clinical Excellence</h3>
                <p className="text-grey-400 text-sm leading-relaxed">
                  Delivering precise, evidence-based care to every patient, every time.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">Patient Privacy</h3>
                <p className="text-grey-400 text-sm leading-relaxed">
                  Strict confidentiality and HIPAA-compliant data practices.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">Timely Service</h3>
                <p className="text-grey-400 text-sm leading-relaxed">
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

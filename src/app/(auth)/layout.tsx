import { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, HeartPulse } from "lucide-react";
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

      {/* Right Pane - Visual/Marketing */}
      <div className="relative hidden w-0 flex-1 lg:block bg-grey-900 overflow-hidden">
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary rounded-full blur-[120px] opacity-20 -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary rounded-full blur-[100px] opacity-10 -ml-64 -mb-64" />
        
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-2xl text-white space-y-8">
            <h2 className="text-4xl font-heading font-bold leading-tight">
              A Unified Healthcare Platform Built for Excellence.
            </h2>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Enterprise Security</h3>
                <p className="text-grey-400 text-sm leading-relaxed">
                  Military-grade encryption and strict Role-Based Access Control ensuring patient data is always protected.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Patient-Centric Care</h3>
                <p className="text-grey-400 text-sm leading-relaxed">
                  Seamlessly connecting doctors, nurses, and labs to deliver faster, more accurate medical care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

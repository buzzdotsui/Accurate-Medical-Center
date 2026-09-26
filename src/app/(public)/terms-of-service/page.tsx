import { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { termsContent } from "./content";

export const metadata: Metadata = {
  title: "Terms of Service | Accurate Medical Center",
  description:
    "Read our Terms of Service for using the Accurate Medical Centre Hospital Management System (HMS) and patient portal.",
  alternates: { canonical: "/terms-of-service" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://accuratemedicalcenter.com/terms-of-service",
    siteName: "Accurate Medical Center",
    title: "Terms of Service | Accurate Medical Center",
    description: "Terms of Service for the Accurate Medical Centre HMS and patient portal.",
    images: [{ url: "/images/hero-poster.jpg", width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Accurate Medical Center",
    description: "Terms of Service for the Accurate Medical Centre HMS and patient portal.",
    images: [{ url: "/images/hero-poster.jpg" }],
  },
  robots: { index: true, follow: true },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#03161a] text-white pt-32 pb-20 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top center, rgba(255,255,255,0.05) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-4xl mx-auto px-5 relative z-10">
        <article className="prose prose-invert max-w-none" style={{ color: "#e2e8f0" }}>
          <Markdown content={termsContent} />
        </article>
      </div>
    </div>
  );
}
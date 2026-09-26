import { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { privacyPolicyContent } from "./content";

export const metadata: Metadata = {
  title: "Privacy Policy | Accurate Medical Center",
  description:
    "Read our Privacy Policy to understand how Accurate Medical Center collects, uses, and protects your personal and health information in compliance with the Nigeria Data Protection Regulation (NDPR).",
  alternates: { canonical: "/privacy-policy" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://accuratemedicalcenter.com/privacy-policy",
    siteName: "Accurate Medical Center",
    title: "Privacy Policy | Accurate Medical Center",
    description:
      "How we collect, use, and protect your personal and health information under NDPR.",
    images: [{ url: "/images/hero-poster.jpg", width: 1920, height: 1080 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Accurate Medical Center",
    description:
      "How we collect, use, and protect your personal and health information under NDPR.",
    images: [{ url: "/images/hero-poster.jpg" }],
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
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
          <Markdown content={privacyPolicyContent} />
        </article>
      </div>
    </div>
  );
}
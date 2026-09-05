import { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "./BookingForm";
import { BookingPageMotion } from "./BookingPageMotion";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Request Care",
  description: "Request an appointment at Accurate Medical Center for specialist care and consultation.",
  alternates: { canonical: "/book-appointment" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/book-appointment",
    siteName: siteConfig.name,
    title: "Request Care",
    description: "Request an appointment at Accurate Medical Center for specialist care and consultation.",
    images: [{
      url: siteConfig.ogImage,
      width: 1920,
      height: 1080,
      alt: "Accurate Medical Center in Akure, Ondo State",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Request Care",
    description: "Request an appointment at Accurate Medical Center for specialist care and consultation.",
    images: [{
      url: siteConfig.ogImage,
      alt: "Accurate Medical Center in Akure, Ondo State",
    }],
  },
};

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen bg-[#03161a] text-white pt-32 pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          background: "radial-gradient(ellipse at top center, rgba(255,255,255,0.05) 0%, transparent 60%)"
        }}
      />
      
      <div className="max-w-3xl mx-auto px-5 relative z-10">
        <BookingPageMotion>
          {/* Suspense boundary is required because BookingForm uses useSearchParams */}
          <Suspense fallback={
            <div className="bg-white/5 border border-[#1b3135] rounded-2xl p-8 h-96 flex items-center justify-center animate-pulse">
              <p className="text-[#a4b5b8]">Loading booking form...</p>
            </div>
          }>
            <BookingForm />
          </Suspense>
        </BookingPageMotion>
      </div>
    </div>
  );
}

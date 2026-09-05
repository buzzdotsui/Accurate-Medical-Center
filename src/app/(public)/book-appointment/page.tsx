import { Metadata } from "next";
import { Suspense } from "react";
import BookingForm from "./BookingForm";
import { displayHeadingClassName, displayHeadingStyle, displayHeadingVariantClassNames } from "@/marketing/typography";

export const metadata: Metadata = {
  title: "Book an Appointment | Accurate Medical Center",
  description: "Request an appointment at Accurate Medical Center for specialist care and consultation.",
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
        <div className="text-center mb-10">
          <h1 className={`${displayHeadingClassName} ${displayHeadingVariantClassNames.appointment} mb-4 text-white`} style={displayHeadingStyle}>
            Request Care
          </h1>
          <p className="text-[#a4b5b8] text-lg max-w-xl mx-auto">
            Fill out the form below to request an appointment. Our reception team will get back to you shortly to confirm your booking.
          </p>
        </div>

        {/* Suspense boundary is required because BookingForm uses useSearchParams */}
        <Suspense fallback={
          <div className="bg-white/5 border border-[#1b3135] rounded-2xl p-8 h-96 flex items-center justify-center animate-pulse">
            <p className="text-[#a4b5b8]">Loading booking form...</p>
          </div>
        }>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { submitPublicAppointmentRequest } from "./actions";
import { ArrowRight, CheckCircle2, CalendarIcon, User, Phone, Mail, Stethoscope, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    service: defaultService,
    preferredDate: new Date(),
    notes: "",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError("Please fill in all required personal details.");
        return;
      }
    }
    setError(null);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service || !formData.preferredDate) {
      setError("Please select a service and preferred date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitPublicAppointmentRequest({
        ...formData,
        preferredDate: formData.preferredDate.toISOString(),
      });

      if (res.success) {
        setSuccess(res.referenceId as string);
        setStep(3);
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepVariant = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  if (step === 3 && success) {
    return (
      <motion.div initial="hidden" animate="visible" variants={currentStepVariant} className="text-center p-8 bg-white/5 border border-[#1b3135] rounded-2xl">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Request Confirmed</h2>
        <p className="text-[#a4b5b8] mb-6">Your appointment request has been securely sent to our reception team.</p>
        <div className="bg-[#03161a] border border-[#1b3135] rounded-lg p-4 mb-8 inline-block">
          <p className="text-sm text-[#7a8f92] mb-1">Reference ID</p>
          <p className="text-xl font-mono text-white tracking-wider">{success}</p>
        </div>
        <p className="text-sm text-[#7a8f92]">
          Our team will contact you shortly on <strong className="text-[#f4f2f5]">{formData.phone}</strong> to confirm the exact time slot.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white/5 border border-[#1b3135] rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
      {/* Stepper */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 1 ? "bg-white text-[#03161a]" : "bg-[#1b3135] text-white"}`}>1</div>
        <div className={`flex-1 h-1 mx-2 rounded-full ${step >= 2 ? "bg-white/50" : "bg-[#1b3135]"}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step === 2 ? "bg-white text-[#03161a]" : "bg-[#1b3135] text-white"}`}>2</div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={currentStepVariant} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a4b5b8]">First Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                    <input 
                      required 
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Jane"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a4b5b8]">Last Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                    <input 
                      required 
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a4b5b8]">Phone Number <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="08012345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a4b5b8]">Email Address <span className="text-[#7a8f92] font-normal">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-white text-[#03161a] hover:bg-[#f4f2f5] font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={currentStepVariant} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a4b5b8]">Service <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <select 
                    required
                    value={formData.service}
                    onChange={e => setFormData(p => ({ ...p, service: e.target.value }))}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select a service</option>
                    {siteConfig.services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a4b5b8]">Preferred Date <span className="text-red-400">*</span></label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92] pointer-events-none" />
                  <input
                    required
                    type="date"
                    value={formData.preferredDate instanceof Date ? formData.preferredDate.toISOString().split("T")[0] : ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setFormData(p => ({ ...p, preferredDate: new Date(e.target.value) }))}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a4b5b8]">Additional Notes <span className="text-[#7a8f92] font-normal">(Optional)</span></label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-[#03161a] border border-[#1b3135] text-white p-4 rounded-lg focus:outline-none focus:border-white/40 transition-colors resize-none h-24"
                  placeholder="Any specific symptoms or requests?"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-1/3 bg-[#1b3135] text-white hover:bg-[#1b3135]/80 font-semibold py-3.5 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-white text-[#03161a] hover:bg-[#f4f2f5] font-semibold py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Confirm Request</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

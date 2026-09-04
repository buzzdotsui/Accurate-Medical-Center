"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site";
import { PublicAppointmentRequestSchema } from "@/lib/validations/appointment";
import { ArrowRight, CheckCircle2, CalendarIcon, User, Phone, Mail, Stethoscope, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BookingFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  service: string;
  preferredDate: string;
  notes: string;
};
type BookingFormErrors = Partial<Record<keyof BookingFormState, string>>;

interface AppointmentApiResponse {
  success: boolean;
  data?: { status?: string; submissionId?: string };
  error?: { message?: string };
}

const emptyForm = (service = ""): BookingFormState => ({
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  service,
  preferredDate: "",
  notes: "",
});

export default function BookingForm() {
  const searchParams = useSearchParams();
  const defaultService = searchParams.get("service") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [formData, setFormData] = useState<BookingFormState>(() => emptyForm(defaultService));
  const isSubmitting = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error || success) statusRef.current?.focus();
  }, [error, success]);

  const setField = <Field extends keyof BookingFormState>(field: Field, value: BookingFormState[Field]) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const setValidationErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
    const nextErrors: BookingFormErrors = {};
    for (const issue of issues) {
      const field = issue.path[0] as keyof BookingFormState;
      if (field in formData && !nextErrors[field]) nextErrors[field] = issue.message;
    }
    setErrors(nextErrors);
  };

  const handleNext = () => {
    if (step === 1) {
      const validation = PublicAppointmentRequestSchema.pick({
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
      }).safeParse(formData);
      if (!validation.success) {
        setValidationErrors(validation.error.issues);
        const firstFieldIssue = validation.error.issues.find((issue) => issue.path[0] in formData);
        setError(firstFieldIssue?.message ?? "Please correct the highlighted personal details.");
        return;
      }
    }
    setError(null);
    setErrors({});
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    const form = new FormData(e.currentTarget);
    const validation = PublicAppointmentRequestSchema.safeParse({
      ...formData,
      website: typeof form.get("website") === "string" ? form.get("website") : "",
    });
    if (!validation.success) {
      setValidationErrors(validation.error.issues);
      const firstFieldIssue = validation.error.issues.find((issue) => issue.path[0] in formData);
      setError(firstFieldIssue?.message ?? "Please correct the highlighted fields.");
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    setError(null);
    setErrors({});

    try {
      const response = await fetch("/api/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const result = (await response.json().catch(() => null)) as AppointmentApiResponse | null;

      if (!response.ok || !result?.success || !result.data?.submissionId) {
        setError(result?.error?.message || "We couldn't submit your appointment request right now. Please try again.");
        return;
      }

      setSuccess(result.data.submissionId);
      setFormData(emptyForm(defaultService));
      setStep(3);
    } catch {
      setError("We couldn't submit your appointment request right now. Please try again.");
    } finally {
      isSubmitting.current = false;
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
      <motion.div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" initial="hidden" animate="visible" variants={currentStepVariant} className="text-center p-8 bg-white/5 border border-[#1b3135] rounded-2xl focus:outline-none">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Request Submitted</h2>
        <p className="text-[#a4b5b8] mb-6">Your appointment request has been submitted successfully. Our reception team will contact you to confirm availability.</p>
        <div className="bg-[#03161a] border border-[#1b3135] rounded-lg p-4 mb-8 inline-block">
          <p className="text-sm text-[#7a8f92] mb-1">Reference ID</p>
          <p className="text-xl font-mono text-white tracking-wider">{success}</p>
        </div>
        <p className="text-sm text-[#7a8f92]">This request does not automatically confirm an appointment.</p>
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
        <div ref={statusRef} tabIndex={-1} role="alert" className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3 focus:outline-none">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} noValidate aria-busy={loading}>
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden" />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" variants={currentStepVariant} initial="hidden" animate="visible" exit="exit" className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="appointment-first-name" className="text-sm font-medium text-[#a4b5b8]">First Name <span aria-hidden className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                    <input 
                      required 
                      id="appointment-first-name"
                      name="firstName"
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setField("firstName", e.target.value)}
                      aria-invalid={Boolean(errors.firstName)}
                      aria-describedby={errors.firstName ? "appointment-first-name-error" : undefined}
                      className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Jane"
                    />
                  </div>
                  {errors.firstName && <p id="appointment-first-name-error" className="text-sm text-red-200">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="appointment-last-name" className="text-sm font-medium text-[#a4b5b8]">Last Name <span aria-hidden className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                    <input 
                      required 
                      id="appointment-last-name"
                      name="lastName"
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setField("lastName", e.target.value)}
                      aria-invalid={Boolean(errors.lastName)}
                      aria-describedby={errors.lastName ? "appointment-last-name-error" : undefined}
                      className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && <p id="appointment-last-name-error" className="text-sm text-red-200">{errors.lastName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="appointment-phone" className="text-sm font-medium text-[#a4b5b8]">Phone Number <span aria-hidden className="text-red-400">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <input 
                    required 
                    id="appointment-phone"
                    name="phone"
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setField("phone", e.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "appointment-phone-error" : undefined}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="08012345678"
                  />
                </div>
                {errors.phone && <p id="appointment-phone-error" className="text-sm text-red-200">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="appointment-email" className="text-sm font-medium text-[#a4b5b8]">Email Address <span className="text-[#7a8f92] font-normal">(Optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <input 
                    type="email" 
                    id="appointment-email"
                    name="email"
                    value={formData.email}
                    onChange={e => setField("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "appointment-email-error" : undefined}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>
                {errors.email && <p id="appointment-email-error" className="text-sm text-red-200">{errors.email}</p>}
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
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
                <label htmlFor="appointment-service" className="text-sm font-medium text-[#a4b5b8]">Service <span aria-hidden className="text-red-400">*</span></label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92]" />
                  <select 
                    required
                    id="appointment-service"
                    name="service"
                    value={formData.service}
                    onChange={e => setField("service", e.target.value)}
                    aria-invalid={Boolean(errors.service)}
                    aria-describedby={errors.service ? "appointment-service-error" : undefined}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors appearance-none"
                  >
                    <option value="" disabled>Select a service</option>
                    {siteConfig.services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                {errors.service && <p id="appointment-service-error" className="text-sm text-red-200">{errors.service}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="appointment-preferred-date" className="text-sm font-medium text-[#a4b5b8]">Preferred Date <span aria-hidden className="text-red-400">*</span></label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a8f92] pointer-events-none" />
                  <input
                    required
                    id="appointment-preferred-date"
                    name="preferredDate"
                    type="date"
                    value={formData.preferredDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => setField("preferredDate", e.target.value)}
                    aria-invalid={Boolean(errors.preferredDate)}
                    aria-describedby={errors.preferredDate ? "appointment-preferred-date-error" : undefined}
                    className="w-full bg-[#03161a] border border-[#1b3135] text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-white/40 transition-colors [color-scheme:dark]"
                  />
                </div>
                {errors.preferredDate && <p id="appointment-preferred-date-error" className="text-sm text-red-200">{errors.preferredDate}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="appointment-notes" className="text-sm font-medium text-[#a4b5b8]">Additional Notes <span className="text-[#7a8f92] font-normal">(Optional)</span></label>
                <textarea 
                  value={formData.notes}
                  id="appointment-notes"
                  name="notes"
                  onChange={e => setField("notes", e.target.value)}
                  aria-invalid={Boolean(errors.notes)}
                  aria-describedby={errors.notes ? "appointment-notes-error" : undefined}
                  className="w-full bg-[#03161a] border border-[#1b3135] text-white p-4 rounded-lg focus:outline-none focus:border-white/40 transition-colors resize-none h-24"
                  placeholder="Any scheduling preference or question?"
                />
                {errors.notes && <p id="appointment-notes-error" className="text-sm text-red-200">{errors.notes}</p>}
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

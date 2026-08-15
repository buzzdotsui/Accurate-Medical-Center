"use client";

import { useState, type FormEvent } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Calendar } from "lucide-react";
import { siteConfig } from "@/config/site";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeUpSmall,
  staggerContainer,
  staggerContainerSlow,
  ctaLift,
  EASE_OUT,
} from "./animations";

const phone    = siteConfig.contact.phone.primary;
const whatsapp = siteConfig.contact.phone.whatsapp;
const display  = siteConfig.contact.phone.displayPrimary;
const email    = siteConfig.contact.email.general;

interface FormState { name: string; phone: string; email: string; message: string; }
const INITIAL: FormState = { name: "", phone: "", email: "", message: "" };

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300"
        style={{
          backgroundColor: "rgba(3,22,26,0.04)",
          border: "1px solid rgba(3,22,26,0.07)",
        }}
      >
        <Icon
          className="w-[18px] h-[18px]"
          strokeWidth={1.75}
          aria-hidden
          style={{ color: "rgba(3,22,26,0.7)" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.24em] mb-2"
          style={{ color: "rgba(3,22,26,0.45)" }}
        >
          {label}
        </p>
        <div
          className="text-[14px] sm:text-[15px] leading-[1.7]"
          style={{ color: "rgba(3,22,26,0.82)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const [form,      setForm]      = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const subject = encodeURIComponent(
      `Enquiry from ${form.name} via Accurate Medical Center Website`,
    );
    const body = encodeURIComponent(
      `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm(INITIAL);
    }, 800);
  };

  const inputCls =
    "w-full rounded-xl px-4 py-3.5 text-[14px] transition-all duration-300 border focus:outline-none focus:ring-2 placeholder:opacity-35";
  const inputStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderColor: "rgba(3,22,26,0.09)",
    color: "#03161a",
    ["--tw-ring-color" as never]: "rgba(3,22,26,0.18)",
  };

  return (
    <section
      id="contact"
      className="py-24 sm:py-32 lg:py-40 relative overflow-hidden"
      aria-labelledby="contact-heading"
      style={{ backgroundColor: "#f4f2f5" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 100% 0%, rgba(3,22,26,0.04) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 0% 100%, rgba(3,22,26,0.03) 0%, transparent 60%)",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 15% 0%, rgba(255,255,255,0.8) 0%, transparent 70%), radial-gradient(ellipse 55% 45% at 90% 100%, rgba(255,255,255,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainerSlow}
          className="mb-14 sm:mb-16 lg:mb-20 max-w-3xl"
        >
          <motion.p
            variants={fadeUpSmall}
            className="text-[11px] font-semibold uppercase tracking-[0.32em] mb-5"
            style={{ color: "rgba(3,22,26,0.52)" }}
          >
            Get In Touch
          </motion.p>
          <motion.h2
            variants={fadeUp}
            id="contact-heading"
            className="text-4xl sm:text-5xl lg:text-[4.25rem] font-bold italic leading-[1.06] tracking-tight mb-6"
            style={{
              fontFamily: "var(--font-playfair-display)",
              color: "#03161a",
            }}
          >
            Contact and Location
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-[15px] sm:text-lg font-light leading-[1.8] max-w-2xl"
            style={{ color: "rgba(3,22,26,0.7)" }}
          >
            Ready to book, visit, or speak with a member of our team? We are here to help
            you take the next step in your healthcare journey.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="flex flex-col gap-10 lg:gap-12"
          >
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-4 mb-6">
                <span
                  aria-hidden
                  className="h-px flex-1 max-w-[40px]"
                  style={{ backgroundColor: "rgba(3,22,26,0.12)" }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: "rgba(3,22,26,0.42)" }}
                >
                  Reach Us
                </span>
              </div>

              <motion.a
                href={`tel:${phone}`}
                variants={ctaLift}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="group inline-flex items-center gap-4 px-6 py-5 rounded-2xl mb-10 sm:mb-12 w-full sm:w-auto"
                style={{
                  backgroundColor: "#03161a",
                  color: "#f4f2f5",
                  boxShadow: "0 20px 50px rgba(3,22,26,0.12)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-400 ease-out group-hover:scale-110 group-hover:-rotate-6"
                  style={{
                    backgroundColor: "rgba(244,242,245,0.1)",
                    color: "#f4f2f5",
                  }}
                >
                  <Phone className="w-[19px] h-[19px]" strokeWidth={2} aria-hidden />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.24em]"
                    style={{ color: "rgba(244,242,245,0.55)" }}
                  >
                    Call us directly
                  </span>
                  <span className="font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                    {display}
                  </span>
                </div>
              </motion.a>
            </motion.div>

            <div className="flex flex-col gap-7 sm:gap-8">
              <motion.div variants={fadeUpSmall}>
                <InfoRow icon={MapPin} label="Hospital Address">
                  <span>
                    First Floor, Olukayode House,
                    <br />
                    Oshinle Street / Oluwatuyi Road, Akure
                    <br />
                    <span
                      className="text-[12.5px] block mt-1"
                      style={{ color: "rgba(3,22,26,0.5)" }}
                    >
                      Beside FCMB Bank at Oshinle Roundabout, off Hospital Road
                    </span>
                    <span className="block mt-1">Ondo State, Nigeria</span>
                  </span>
                </InfoRow>
              </motion.div>

              <motion.div variants={fadeUpSmall}>
                <InfoRow icon={Phone} label="Telephone">
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-[#03161a] transition-colors font-semibold text-[16px]"
                  >
                    {display}
                  </a>
                  <span
                    className="block text-[12px] mt-1"
                    style={{ color: "rgba(3,22,26,0.45)" }}
                  >
                    Available during working hours. 24/7 emergency response.
                  </span>
                </InfoRow>
              </motion.div>

              <motion.div variants={fadeUpSmall}>
                <InfoRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-[#03161a] transition-colors break-all"
                  >
                    {email}
                  </a>
                </InfoRow>
              </motion.div>

              <motion.div variants={fadeUpSmall}>
                <InfoRow icon={Clock} label="Working Hours">
                  <div className="space-y-2">
                    <div className="flex justify-between gap-8">
                      <span>Monday to Friday</span>
                      <span className="font-medium">{siteConfig.contact.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span>Saturday</span>
                      <span className="font-medium">{siteConfig.contact.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span>Sunday</span>
                      <span className="font-medium">{siteConfig.contact.hours.sunday}</span>
                    </div>
                    <div
                      className="mt-3 pt-3 flex items-center gap-2.5"
                      style={{ borderTop: "1px solid rgba(3,22,26,0.07)" }}
                    >
                      <span
                        aria-hidden
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#ef4444" }}
                      />
                      <span className="font-semibold" style={{ color: "#03161a" }}>
                        {siteConfig.contact.hours.emergency}
                      </span>
                    </div>
                  </div>
                </InfoRow>
              </motion.div>
            </div>

            <motion.div
              variants={fadeUp}
              className="rounded-[1.5rem] sm:rounded-[1.75rem] overflow-hidden"
              style={{
                height: "260px",
                border: "1px solid rgba(3,22,26,0.08)",
                boxShadow: "0 20px 60px rgba(3,22,26,0.08)",
              }}
            >
              <iframe
                title="Accurate Medical Center location on Google Maps"
                src="https://maps.google.com/maps?q=Olukayode+House+Oshinle+Akure+Ondo&z=15&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                  filter:
                    "invert(0.08) hue-rotate(180deg) contrast(1.02) brightness(1.01)",
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: EASE_OUT, delay: 0.05 }}
            className="relative rounded-[1.75rem] sm:rounded-[2rem] p-7 sm:p-10 lg:p-12 overflow-hidden self-start lg:sticky lg:top-28"
            style={{
              backgroundColor: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(3,22,26,0.07)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow:
                "0 30px 80px rgba(3,22,26,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-0 left-0 right-0 h-px pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(3,22,26,0.14) 50%, transparent 100%)",
              }}
            />

            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 py-14 sm:py-20 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  <CheckCircle
                    className="w-16 h-16"
                    aria-hidden
                    style={{ color: "#22c55e" }}
                    strokeWidth={1.7}
                  />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#03161a] tracking-tight">
                  Message Sent
                </h3>
                <p
                  className="text-sm sm:text-[15px] max-w-xs leading-[1.7]"
                  style={{ color: "rgba(3,22,26,0.6)" }}
                >
                  Your email client should have opened with a pre-filled message.
                  We will get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm underline underline-offset-4 transition-colors hover:text-[#03161a] mt-3"
                  style={{ color: "rgba(3,22,26,0.5)" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: "rgba(3,22,26,0.04)",
                      border: "1px solid rgba(3,22,26,0.07)",
                    }}
                  >
                    <Calendar
                      className="w-[18px] h-[18px]"
                      strokeWidth={1.8}
                      aria-hidden
                      style={{ color: "rgba(3,22,26,0.72)" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-[#03161a] tracking-tight">
                      Send a Message
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: "rgba(3,22,26,0.5)" }}
                    >
                      We typically respond within one business day.
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-[11px] font-medium mb-2 tracking-wide"
                    style={{ color: "rgba(3,22,26,0.58)" }}
                  >
                    Full Name
                    <span aria-hidden className="text-red-500 ml-1">
                      *
                    </span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Adebayo Okafor"
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-[11px] font-medium mb-2 tracking-wide"
                      style={{ color: "rgba(3,22,26,0.58)" }}
                    >
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0800 000 0000"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[11px] font-medium mb-2 tracking-wide"
                      style={{ color: "rgba(3,22,26,0.58)" }}
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[11px] font-medium mb-2 tracking-wide"
                    style={{ color: "rgba(3,22,26,0.58)" }}
                  >
                    Message
                    <span aria-hidden className="text-red-500 ml-1">
                      *
                    </span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you."
                    className={`${inputCls} resize-none`}
                    style={inputStyle}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  variants={ctaLift}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="group relative inline-flex items-center justify-center gap-2.5 w-full py-[18px] rounded-2xl text-[14px] font-semibold disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                  style={{ backgroundColor: "#03161a", color: "#f4f2f5" }}
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(244,242,245,0.08) 0%, transparent 55%)",
                    }}
                  />
                  {loading ? (
                    <>
                      <span
                        className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin relative z-10"
                        aria-hidden
                      />
                      <span className="relative z-10">Opening email client…</span>
                    </>
                  ) : (
                    <>
                      <Send
                        className="relative z-10 w-[17px] h-[17px] shrink-0 transition-transform duration-400 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden
                      />
                      <span className="relative z-10 tracking-wide">Send Message</span>
                    </>
                  )}
                </motion.button>

                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
                  style={{ borderTop: "1px solid rgba(3,22,26,0.07)" }}
                >
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-medium border transition-all duration-300 hover:bg-[#03161a]/[0.03]"
                    style={{
                      borderColor: "rgba(3,22,26,0.1)",
                      color: "rgba(3,22,26,0.75)",
                    }}
                  >
                    <Phone
                      className="w-4 h-4"
                      aria-hidden
                    />
                    Call the Hospital
                  </a>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-[13px] font-medium border transition-all duration-300 hover:bg-[#03161a]/[0.03]"
                    style={{
                      borderColor: "rgba(3,22,26,0.1)",
                      color: "rgba(3,22,26,0.75)",
                    }}
                  >
                    <Mail className="w-4 h-4" aria-hidden />
                    WhatsApp
                  </a>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

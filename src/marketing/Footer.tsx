"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site";
import { MapPin, Mail, ArrowUp, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUpSmall, fadeUp, EASE, sectionReveal } from "./animations";
import { BrandLockup } from "./BrandLockup";

const NAV_LINKS = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/#vision-mission" },
  { label: "Services",    href: "/#services" },
  { label: "Vision",      href: "/#vision-mission" },
  { label: "Experience",  href: "/#experience" },
  { label: "Contact",     href: "/#contact" },
] as const;

const SERVICE_LINKS = [
  { label: "Psychological Therapy", value: "Psychological Therapy" },
  { label: "Maternity & Delivery", value: "Pregnancy & Maternal Care" },
  { label: "Outpatient Care", value: "Outpatient Clinic" },
  { label: "Addictions Care", value: "Addiction Care" },
  { label: "Ambulance Services", value: "Ambulance Services" },
  { label: "Online Consultations", value: "Online Consultation" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    document.getElementById("home")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.95, ease: EASE }}
      className="relative pt-24 sm:pt-32 pb-10"
      style={{ backgroundColor: "#000000" }}
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(244,242,245,0.16) 50%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(244,242,245,0.85) 1px, transparent 0)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 0%, black 28%, transparent 82%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 0%, black 28%, transparent 82%)",
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none opacity-40"
        style={{
          top: "-1px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <svg width="66" height="14" viewBox="0 0 66 14" aria-hidden>
          <path
            d="M0 13.5 L22 13.5 L33 0.5 L44 13.5 L66 13.5"
            fill="none"
            stroke="rgba(244,242,245,0.08)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.06 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-12 mb-[72px]"
        >
          <motion.div
            variants={fadeUpSmall}
            className="flex flex-col gap-6 lg:col-span-1"
          >
            <div className="flex items-center gap-3 group">
              <div className="rounded-xl overflow-hidden shrink-0">
                <Image
                  src="/marketing/images/logo.jpeg"
                  alt="Accurate Medical Center"
                  width={54}
                  height={54}
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <BrandLockup size="footer" className="text-[#f4f2f5]" />
            </div>
            <p
              className="text-[13.5px] leading-[1.8] max-w-xs"
              style={{ color: "rgba(244,242,245,0.54)" }}
            >
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {[
                {
                  label: "Facebook",
                  href: siteConfig.social.facebook,
                  icon: (props: React.SVGProps<SVGSVGElement>) => (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...props}
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: siteConfig.social.instagram,
                  icon: (props: React.SVGProps<SVGSVGElement>) => (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...props}
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                },
                {
                  label: "Twitter",
                  href: siteConfig.social.twitter,
                  icon: (props: React.SVGProps<SVGSVGElement>) => (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      {...props}
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white/52 transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  style={{ backgroundColor: "rgba(244,242,245,0.055)" }}
                  aria-label={`Follow us on ${social.label}`}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(244,242,245,0.13)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "rgba(244,242,245,0.055)";
                  }}
                >
                  <social.icon className="w-4 h-4" aria-hidden />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeUpSmall} className="flex flex-col gap-[22px]">
            <h3
              className="text-[10px] font-semibold tracking-[0.32em] uppercase"
              style={{ color: "rgba(244,242,245,0.38)" }}
            >
              Quick Links
            </h3>
            <ul className="flex flex-col gap-3.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2.5 text-[13.5px] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                    style={{ color: "rgba(244,242,245,0.54)" }}
                  >
                    <span
                      aria-hidden
                      className="h-px w-4 origin-left scale-x-0 rounded-full bg-white/30 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUpSmall} className="flex flex-col gap-[22px]">
            <h3
              className="text-[10px] font-semibold tracking-[0.32em] uppercase"
              style={{ color: "rgba(244,242,245,0.38)" }}
            >
              Our Services
            </h3>
            <ul className="flex flex-col gap-3.5">
              {SERVICE_LINKS.map((service) => (
                <li key={service.value}>
                  <Link
                    href={`/book-appointment?service=${encodeURIComponent(service.value)}`}
                    className="group flex items-center gap-2.5 text-[13.5px] transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                    style={{ color: "rgba(244,242,245,0.54)" }}
                  >
                    <span
                      aria-hidden
                      className="h-px w-4 origin-left scale-x-0 rounded-full bg-white/30 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-[22px]">
            <h3
              className="text-[10px] font-semibold tracking-[0.32em] uppercase"
              style={{ color: "rgba(244,242,245,0.38)" }}
            >
              Contact
            </h3>
            <ul className="flex flex-col gap-6">
              <li className="flex items-start gap-[14px]">
                <MapPin
                  className="w-4 h-4 mt-0.5 shrink-0"
                  aria-hidden
                  style={{ color: "rgba(244,242,245,0.36)" }}
                />
                <span
                  className="text-[13.5px] leading-[1.78]"
                  style={{ color: "rgba(244,242,245,0.66)" }}
                >
                  {siteConfig.contact.address.full}
                </span>
              </li>
              <li className="flex items-center gap-3.5 gap-[14px]">
                <Phone
                  className="w-4 h-4 shrink-0"
                  aria-hidden
                  style={{ color: "rgba(244,242,245,0.36)" }}
                />
                <a
                  href={`tel:${siteConfig.contact.phone.primary}`}
                  className="text-[13.5px] font-medium transition-colors duration-200 hover:text-white"
                  style={{ color: "rgba(244,242,245,0.84)" }}
                >
                  {siteConfig.contact.phone.displayPrimary}
                </a>
              </li>
              <li className="flex items-center gap-3.5 gap-[14px]">
                <Mail
                  className="w-4 h-4 shrink-0"
                  aria-hidden
                  style={{ color: "rgba(244,242,245,0.36)" }}
                />
                <a
                  href={`mailto:${siteConfig.contact.email.general}`}
                  className="text-[13.5px] transition-colors duration-200 hover:text-white break-all"
                  style={{ color: "rgba(244,242,245,0.6)" }}
                >
                  {siteConfig.contact.email.general}
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <div
          className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-[12.5px]"
          style={{ borderTop: "1px solid rgba(244,242,245,0.07)" }}
        >
          <div style={{ color: "rgba(244,242,245,0.36)" }}>
            &copy; {year} Accurate Medical Center. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 font-medium transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
            style={{ color: "rgba(244,242,245,0.54)" }}
            aria-label="Scroll back to the top of the page"
          >
            Back to top
            <span className="relative inline-flex items-center justify-center w-[34px] h-[34px] rounded-full transition-transform duration-300 group-hover:-translate-y-0.5"
              style={{ backgroundColor: "rgba(244,242,245,0.06)" }}
            >
              <ArrowUp className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </motion.footer>
  );
}

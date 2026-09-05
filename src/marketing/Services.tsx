"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ambulance,
  Baby,
  Bed,
  Brain,
  FlaskConical,
  HeartHandshake,
  Radiation,
  ScanLine,
  Scissors,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { fadeUp, fadeUpFast, ctaLift } from "./animations";

const BG_NEUTRAL = "#faf9f8";
const CHARCOAL = "#1a1f22";
const CHARCOAL_MUTED = "rgba(26,31,34,0.65)";
const LEMON = "#d4e842";
const BORDER = "rgba(26,31,34,0.08)";

type IconKey =
  | "brain"
  | "heart-handshake"
  | "shield-check"
  | "baby"
  | "stethoscope"
  | "scissors"
  | "bed"
  | "scan-line"
  | "radiation"
  | "flask-conical"
  | "ambulance";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number; style?: React.CSSProperties }>> = {
  brain: Brain,
  "heart-handshake": HeartHandshake,
  "shield-check": ShieldCheck,
  baby: Baby,
  stethoscope: Stethoscope,
  scissors: Scissors,
  bed: Bed,
  "scan-line": ScanLine,
  radiation: Radiation,
  "flask-conical": FlaskConical,
  ambulance: Ambulance,
};

const SERVICES = [
  {
    id: "01",
    icon: "brain" as IconKey,
    title: "Psychological Therapy",
    desc: "Confidential, compassionate counseling and mental health support for individuals and families.",
  },
  {
    id: "02",
    icon: "heart-handshake" as IconKey,
    title: "Infertility Care",
    desc: "Advanced, compassionate fertility treatments designed to help you build your family.",
  },
  {
    id: "03",
    icon: "shield-check" as IconKey,
    title: "Addiction Care",
    desc: "Structured, dignified addiction recovery programs tailored to each patient's unique journey.",
  },
  {
    id: "04",
    icon: "baby" as IconKey,
    title: "Pregnancy Delivery",
    desc: "Safe, supportive maternity and delivery care from experienced healthcare professionals.",
  },
  {
    id: "05",
    icon: "stethoscope" as IconKey,
    title: "Outpatient Clinic Services",
    desc: "Comprehensive outpatient services focusing on accurate diagnosis and effective treatment.",
  },
  {
    id: "06",
    icon: "scissors" as IconKey,
    title: "Surgery",
    desc: "State-of-the-art surgical care performed by experienced specialists in a safe environment.",
  },
  {
    id: "07",
    icon: "bed" as IconKey,
    title: "Admissions",
    desc: "Comfortable, monitored inpatient wards providing 24-hour medical and nursing care.",
  },
  {
    id: "08",
    icon: "scan-line" as IconKey,
    title: "Ultrasound Scan",
    desc: "Advanced diagnostic ultrasound imaging for accurate and timely medical assessments.",
  },
  {
    id: "09",
    icon: "radiation" as IconKey,
    title: "X-ray Services",
    desc: "Rapid and precise radiological imaging to support accurate clinical diagnoses.",
  },
  {
    id: "10",
    icon: "flask-conical" as IconKey,
    title: "Laboratories",
    desc: "Fully equipped diagnostic laboratory services delivering reliable and rapid test results.",
  },
  {
    id: "11",
    icon: "ambulance" as IconKey,
    title: "Ambulance Services",
    desc: "Rapid-response emergency transport fully equipped for critical medical support.",
  },
];

const APPOINTMENT_SERVICE_BY_MARKETING_TITLE: Record<string, string> = {
  "Psychological Therapy": "Psychological Therapy",
  "Infertility Care": "Infertility Care",
  "Addiction Care": "Addiction Care",
  "Pregnancy Delivery": "Pregnancy & Maternal Care",
  "Outpatient Clinic Services": "Outpatient Clinic",
  "Surgery": "Surgical Services",
  "Admissions": "Outpatient Clinic",
  "Ultrasound Scan": "Ultrasound Scan",
  "X-ray Services": "X-Ray Services",
  "Laboratories": "Laboratory Services",
  "Ambulance Services": "Ambulance Services",
};

export function Services() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="services"
      className="relative w-full py-24 sm:py-32 lg:py-40"
      aria-labelledby="services-heading"
      style={{ backgroundColor: BG_NEUTRAL, color: CHARCOAL }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="mb-20 sm:mb-28"
        >
          <motion.span
            variants={fadeUpFast}
            className="block text-xs font-bold uppercase tracking-[0.2em] mb-6"
            style={{ color: CHARCOAL_MUTED }}
          >
            Our Services
          </motion.span>
          <motion.h2
            variants={fadeUpFast}
            id="services-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
            style={{ fontFamily: "var(--font-playfair)", color: CHARCOAL }}
          >
            Specialized Care <br className="hidden sm:block" />
            <span className="font-semibold">tailored to your needs.</span>
          </motion.h2>
        </motion.div>

        <div className="flex flex-col border-t" style={{ borderColor: BORDER }}>
          {SERVICES.map((srv, idx) => {
            const Icon = ICONS[srv.icon];
            const isHovered = hoveredIdx === idx;

            return (
              <Link href={`/book-appointment?service=${encodeURIComponent(APPOINTMENT_SERVICE_BY_MARKETING_TITLE[srv.title])}`} key={srv.id} passHref legacyBehavior>
                <motion.a
                  initial="hidden"
                  whileInView="visible"
                  whileTap={{ scale: 0.995 }}
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeUp}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onFocus={() => setHoveredIdx(idx)}
                  onBlur={() => setHoveredIdx(null)}
                  className="group relative block min-h-20 cursor-pointer overflow-hidden border-b py-10 transition-[background-color,border-color,transform] duration-300 active:bg-black/[0.025] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#03161a] sm:py-14 md:flex md:items-center"
                  style={{ borderColor: BORDER }}
                >
                {/* Hover Background Reveal */}
                <div 
                  className="absolute inset-0 transition-opacity duration-500 ease-out pointer-events-none"
                  style={{ backgroundColor: "rgba(26,31,34,0.02)", opacity: isHovered ? 1 : 0 }}
                />

                <div className="relative z-10 flex w-full flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12 lg:gap-20 px-2">
                  <div className="flex items-center gap-6 sm:gap-12 lg:gap-20 md:w-1/2">
                    <span 
                      className="text-2xl sm:text-3xl font-light tracking-tight transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                      style={{ color: isHovered ? CHARCOAL : CHARCOAL_MUTED }}
                    >
                      {srv.id}
                    </span>
                    <div className="flex items-center gap-6">
                      <div 
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,border-color,box-shadow,transform] duration-300 group-hover:-translate-y-0.5 group-hover:scale-[1.04] group-focus-visible:-translate-y-0.5 group-focus-visible:scale-[1.04]"
                        style={{ 
                          backgroundColor: isHovered ? LEMON : "transparent",
                          border: isHovered ? "1px solid transparent" : `1px solid ${BORDER}`
                        }}
                      >
                        <Icon aria-hidden strokeWidth={1.7} className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110" style={{ color: CHARCOAL }} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.02em]">
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  <div className="md:w-1/2 flex items-center justify-between pl-[4.5rem] md:pl-0">
                    <p className="text-base sm:text-lg max-w-md font-light leading-relaxed transition-colors duration-300" style={{ color: CHARCOAL_MUTED }}>
                      {srv.desc}
                    </p>
                    <ArrowRight 
                      className="hidden h-6 w-6 lg:block transition-[opacity,transform] duration-500" 
                      style={{ 
                        color: CHARCOAL, 
                        opacity: isHovered ? 1 : 0, 
                        transform: isHovered ? "translateX(0)" : "translateX(-15px)" 
                      }} 
                    />
                  </div>
                </div>
                </motion.a>
              </Link>
            );
          })}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-20 flex justify-center lg:justify-start"
        >
          <Link href="/book-appointment" passHref legacyBehavior>
            <motion.a
              variants={ctaLift}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-[18px] text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#03161a]"
              style={{
                backgroundColor: CHARCOAL,
                color: "#fff",
                boxShadow: "0 10px 30px rgba(26,31,34,0.15)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, ${CHARCOAL} 0%, rgba(50,55,58,1) 100%)`,
                }}
              />
              <span className="relative z-10 tracking-wide">Book an Appointment</span>
              <ArrowRight className="relative z-10 w-[18px] h-[18px] transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

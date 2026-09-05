"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
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
import {
  ctaLift,
  contentReveal,
  headingReveal,
  serviceRowReveal,
  servicesStagger,
  sectionReveal,
} from "./animations";
import { displayHeadingClassName, displayHeadingStyle } from "./typography";

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

const SERVICE_ICON_MOTION: Record<IconKey, Variants> = {
  brain: { rest: { scale: 1, x: 0, y: 0 }, active: { scale: 1.08, x: 1, y: -1 } },
  "heart-handshake": { rest: { scale: 1 }, active: { scale: 1.09 } },
  "shield-check": { rest: { scale: 1, y: 0 }, active: { scale: 1.06, y: -1 } },
  baby: { rest: { y: 0, scale: 1 }, active: { y: -3, scale: 1.05 } },
  stethoscope: { rest: { x: 0, scale: 1 }, active: { x: 2, scale: 1.05 } },
  scissors: { rest: { rotate: 0, scale: 1 }, active: { rotate: -5, scale: 1.04 } },
  bed: { rest: { y: 0, scale: 1 }, active: { y: -2, scale: 1.04 } },
  "scan-line": { rest: { x: 0, scale: 1 }, active: { x: 2, scale: 1.04 } },
  radiation: { rest: { scale: 1 }, active: { scale: 1.055 } },
  "flask-conical": { rest: { y: 0, scale: 1 }, active: { y: -2, scale: 1.04 } },
  ambulance: { rest: { x: 0, scale: 1 }, active: { x: 3, scale: 1.04 } },
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
          variants={sectionReveal}
          className="mb-20 sm:mb-28"
        >
          <motion.span
            variants={contentReveal}
            className="block text-xs font-bold uppercase tracking-[0.2em] mb-6"
            style={{ color: CHARCOAL_MUTED }}
          >
            Our Services
          </motion.span>
          <motion.h2
            variants={headingReveal}
            id="services-heading"
            className={`text-4xl sm:text-5xl lg:text-6xl ${displayHeadingClassName}`}
            style={{ ...displayHeadingStyle, color: CHARCOAL }}
          >
            Specialized Care <br className="hidden sm:block" />
            <span className="font-semibold">tailored to your needs.</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15, margin: "-70px" }}
          variants={servicesStagger}
          className="flex flex-col border-t"
          style={{ borderColor: BORDER }}
        >
          {SERVICES.map((srv, idx) => {
            const Icon = ICONS[srv.icon];
            const isHovered = hoveredIdx === idx;

            return (
              <Link href={`/book-appointment?service=${encodeURIComponent(APPOINTMENT_SERVICE_BY_MARKETING_TITLE[srv.title])}`} key={srv.id} passHref legacyBehavior>
                <motion.a
                  whileHover="hover"
                  whileFocus="hover"
                  whileTap={{ scale: 0.995 }}
                  variants={serviceRowReveal}
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
                    <motion.span
                      initial="rest"
                      animate={isHovered ? "active" : "rest"}
                      variants={{
                        rest: { x: 0, opacity: 0.72 },
                        active: { x: 3, opacity: 1, transition: { duration: 0.25 } },
                      }}
                      className="text-2xl sm:text-3xl font-light tracking-tight"
                      style={{ color: isHovered ? CHARCOAL : CHARCOAL_MUTED }}
                    >
                      {srv.id}
                    </motion.span>
                    <div className="flex items-center gap-6">
                      <motion.div
                        initial="rest"
                        animate={isHovered ? "active" : "rest"}
                        variants={{
                          rest: { y: 0, scale: 1 },
                          active: { y: -2, scale: 1.04, transition: { duration: 0.28 } },
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,border-color,box-shadow] duration-300"
                        style={{ 
                          backgroundColor: isHovered ? LEMON : "transparent",
                          border: isHovered ? "1px solid transparent" : `1px solid ${BORDER}`
                        }}
                      >
                        <motion.div initial="rest" animate={isHovered ? "active" : "rest"} variants={SERVICE_ICON_MOTION[srv.icon]} transition={{ duration: 0.3 }}>
                          <Icon aria-hidden strokeWidth={1.7} className="h-5 w-5" style={{ color: CHARCOAL }} />
                        </motion.div>
                      </motion.div>
                      <motion.h3
                        initial="rest"
                        animate={isHovered ? "active" : "rest"}
                        variants={{ rest: { x: 0 }, active: { x: 4, transition: { duration: 0.28 } } }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-[-0.02em]"
                      >
                        {srv.title}
                      </motion.h3>
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
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={contentReveal}
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
                className="absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full opacity-0 transition-[transform,opacity] duration-500 ease-out group-hover:translate-x-[300%] group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
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

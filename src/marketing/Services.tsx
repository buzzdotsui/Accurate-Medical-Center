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

const BG_NEUTRAL = "var(--marketing-ivory)";
const CHARCOAL = "var(--marketing-ink)";
const CHARCOAL_MUTED = "rgba(3,22,26,0.65)";
const PRIMARY = "var(--primary)";
const BORDER = "var(--border)";

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
    icon: "brain" as IconKey,
    title: "Psychological Therapy",
    desc: "Confidential, compassionate counseling and mental health support for individuals and families.",
  },
  {
    icon: "heart-handshake" as IconKey,
    title: "Infertility Care",
    desc: "Advanced, compassionate fertility treatments designed to help you build your family.",
  },
  {
    icon: "shield-check" as IconKey,
    title: "Addiction Care",
    desc: "Structured, dignified addiction recovery programs tailored to each patient's unique journey.",
  },
  {
    icon: "baby" as IconKey,
    title: "Pregnancy Delivery",
    desc: "Safe, supportive maternity and delivery care from experienced healthcare professionals.",
  },
  {
    icon: "stethoscope" as IconKey,
    title: "Outpatient Clinic Services",
    desc: "Comprehensive outpatient services focusing on accurate diagnosis and effective treatment.",
  },
  {
    icon: "scissors" as IconKey,
    title: "Surgery",
    desc: "State-of-the-art surgical care performed by experienced specialists in a safe environment.",
  },
  {
    icon: "bed" as IconKey,
    title: "Admissions",
    desc: "Comfortable, monitored inpatient wards providing 24-hour medical and nursing care.",
  },
  {
    icon: "scan-line" as IconKey,
    title: "Ultrasound Scan",
    desc: "Advanced diagnostic ultrasound imaging for accurate and timely medical assessments.",
  },
  {
    icon: "radiation" as IconKey,
    title: "X-ray Services",
    desc: "Rapid and precise radiological imaging to support accurate clinical diagnoses.",
  },
  {
    icon: "flask-conical" as IconKey,
    title: "Laboratories",
    desc: "Fully equipped diagnostic laboratory services delivering reliable and rapid test results.",
  },
  {
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
      style={{ backgroundColor: "var(--marketing-ivory)", color: "var(--marketing-ink)" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionReveal}
          className="mb-20 sm:mb-28"
        >
          <motion.h2
            variants={headingReveal}
            id="services-heading"
            className={`text-4xl sm:text-5xl lg:text-6xl ${displayHeadingClassName}`}
            style={{ ...displayHeadingStyle, color: "var(--marketing-ink)" }}
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVICES.map((srv, idx) => {
            const Icon = ICONS[srv.icon];
            const isHovered = hoveredIdx === idx;

            return (
              <Link href={`/book-appointment?service=${encodeURIComponent(APPOINTMENT_SERVICE_BY_MARKETING_TITLE[srv.title])}`} key={srv.title} passHref legacyBehavior>
                <motion.article
                  whileHover="hover"
                  whileFocus="hover"
                  whileTap={{ scale: 0.99 }}
                  variants={serviceRowReveal}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onFocus={() => setHoveredIdx(idx)}
                  onBlur={() => setHoveredIdx(null)}
                  className="group relative flex flex-col h-full p-6 rounded-2xl transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
                  style={{
                    backgroundColor: "var(--card)",
                    border: `1px solid ${BORDER}`,
                    boxShadow: isHovered ? "0 12px 32px rgba(3,22,26,0.08)" : "none",
                    borderColor: isHovered ? "var(--primary)" : BORDER,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial="rest"
                      animate={isHovered ? "active" : "rest"}
                      variants={{
                        rest: { scale: 1 },
                        active: { scale: 1.05, transition: { duration: 0.28 } },
                      }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-[background-color,border-color] duration-300"
                      style={{
                        backgroundColor: isHovered ? "var(--primary)" : "transparent",
                        border: isHovered ? "1px solid transparent" : `1px solid ${BORDER}`,
                      }}
                    >
                      <Icon
                        aria-hidden
                        strokeWidth={1.7}
                        className="h-6 w-6 transition-colors duration-300"
                        style={{
                          color: isHovered ? "var(--primary-foreground)" : "var(--marketing-ink)",
                        }}
                      />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold leading-tight tracking-tight truncate" style={{ color: "var(--marketing-ink)" }}>
                        {srv.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-relaxed flex-1" style={{ color: CHARCOAL_MUTED }}>
                    {srv.desc}
                  </p>
                  <motion.div
                    initial="rest"
                    animate={isHovered ? "active" : "rest"}
                    variants={{ rest: { x: 0, opacity: 0 }, active: { x: 4, opacity: 1, transition: { duration: 0.28 } } }}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </motion.div>
                </motion.article>
              </Link>
            );
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={contentReveal}
          className="mt-16 flex justify-center lg:justify-start"
        >
          <Link href="/book-appointment" passHref legacyBehavior>
            <motion.a
              variants={ctaLift}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-[18px] text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                boxShadow: "0 10px 30px rgba(196,106,63,0.15)",
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

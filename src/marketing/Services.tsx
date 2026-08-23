"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Baby, Stethoscope, Shield, Ambulance, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import { fadeUp, fadeUpFast, ctaLift } from "./animations";

const BG_NEUTRAL = "#faf9f8";
const CHARCOAL = "#1a1f22";
const CHARCOAL_MUTED = "rgba(26,31,34,0.65)";
const LEMON = "#d4e842";
const BORDER = "rgba(26,31,34,0.08)";

type IconKey = "brain" | "baby" | "stethoscope" | "shield" | "ambulance" | "video";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number; style?: React.CSSProperties }>> = {
  brain: Brain,
  baby: Baby,
  stethoscope: Stethoscope,
  shield: Shield,
  ambulance: Ambulance,
  video: Video,
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
    icon: "baby" as IconKey,
    title: "Infertility Care",
    desc: "Advanced, compassionate fertility treatments designed to help you build your family.",
  },
  {
    id: "03",
    icon: "shield" as IconKey,
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
    icon: "stethoscope" as IconKey,
    title: "Surgery",
    desc: "State-of-the-art surgical care performed by experienced specialists in a safe environment.",
  },
  {
    id: "07",
    icon: "stethoscope" as IconKey,
    title: "Admissions",
    desc: "Comfortable, monitored inpatient wards providing 24-hour medical and nursing care.",
  },
  {
    id: "08",
    icon: "video" as IconKey,
    title: "Ultrasound Scan",
    desc: "Advanced diagnostic ultrasound imaging for accurate and timely medical assessments.",
  },
  {
    id: "09",
    icon: "video" as IconKey,
    title: "X-ray Services",
    desc: "Rapid and precise radiological imaging to support accurate clinical diagnoses.",
  },
  {
    id: "10",
    icon: "brain" as IconKey,
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

export function Services() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section
      id="services"
      className="relative w-full py-24 sm:py-32 lg:py-40"
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
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]"
            style={{ fontFamily: "var(--font-playfair-display)", color: CHARCOAL }}
          >
            Specialized Care <br className="hidden sm:block" />
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>tailored to your needs.</span>
          </motion.h2>
        </motion.div>

        <div className="flex flex-col border-t" style={{ borderColor: BORDER }}>
          {SERVICES.map((srv, idx) => {
            const Icon = ICONS[srv.icon];
            const isHovered = hoveredIdx === idx;

            return (
              <Link href={`/book-appointment?service=${encodeURIComponent(srv.title)}`} key={srv.id} passHref legacyBehavior>
                <motion.a
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="group relative flex flex-col md:flex-row items-start md:items-center py-10 sm:py-14 border-b transition-colors duration-500 cursor-pointer overflow-hidden block"
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
                      className="text-2xl sm:text-3xl font-light tracking-tight transition-colors duration-300"
                      style={{ color: isHovered ? CHARCOAL : CHARCOAL_MUTED }}
                    >
                      {srv.id}
                    </span>
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ 
                          backgroundColor: isHovered ? LEMON : "transparent",
                          border: isHovered ? "1px solid transparent" : `1px solid ${BORDER}`
                        }}
                      >
                        <Icon strokeWidth={1.5} className="w-5 h-5 transition-colors duration-300" style={{ color: CHARCOAL }} />
                      </div>
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight">
                        {srv.title}
                      </h3>
                    </div>
                  </div>

                  <div className="md:w-1/2 flex items-center justify-between pl-[4.5rem] md:pl-0">
                    <p className="text-base sm:text-lg max-w-md font-light leading-relaxed transition-colors duration-300" style={{ color: CHARCOAL_MUTED }}>
                      {srv.desc}
                    </p>
                    <ArrowRight 
                      className="hidden lg:block w-6 h-6 transition-all duration-500" 
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
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-[18px] rounded-full text-[15px] font-semibold overflow-hidden"
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
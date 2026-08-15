"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Baby,
  Stethoscope,
  Shield,
  Ambulance,
  Video,
  ArrowRight,
  Calendar,
} from "lucide-react";
import {
  fadeUp,
  fadeUpFast,
  staggerContainerSlow,
  staggerContainerFast,
  EASE_OUT,
  ctaLift,
} from "./animations";

const INK = "#03161a";
const INK_SOFT = "rgba(3,22,26,0.68)";
const INK_MUTED = "rgba(3,22,26,0.48)";
const INK_LINE = "rgba(3,22,26,0.1)";
const ACCENT = "#03161a";

type IconKey =
  | "brain"
  | "baby"
  | "stethoscope"
  | "shield"
  | "ambulance"
  | "video";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
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
    title: "Maternity & Delivery",
    desc: "Safe, supportive maternity and delivery care from experienced healthcare professionals.",
  },
  {
    id: "03",
    icon: "stethoscope" as IconKey,
    title: "Outpatient Care",
    desc: "Accessible consultations, diagnosis, treatment, and follow-up care across medical departments.",
  },
  {
    id: "04",
    icon: "shield" as IconKey,
    title: "Addictions Care",
    desc: "Structured support and rehabilitation for substance and behavioral addictions.",
  },
  {
    id: "05",
    icon: "ambulance" as IconKey,
    title: "Ambulance Services",
    desc: "Emergency response and patient transportation when urgent medical attention is required.",
  },
  {
    id: "06",
    icon: "video" as IconKey,
    title: "Online Consultations",
    desc: "Convenient virtual consultations connecting patients with healthcare professionals remotely.",
  },
] as const;

function ServiceRow({
  id,
  icon: IconKey,
  title,
  desc,
  index,
  expanded,
  onToggle,
}: {
  id: string;
  icon: IconKey;
  title: string;
  desc: string;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[IconKey];
  const total = SERVICES.length;
  const isLast = index === total - 1;

  return (
    <motion.div
      variants={fadeUpFast}
      custom={index}
      className="group relative"
    >
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${INK_LINE} 18%, ${INK_LINE} 82%, transparent)` }}
      />
      {isLast && (
        <div
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${INK_LINE} 18%, ${INK_LINE} 82%, transparent)` }}
        />
      )}

      <button
        type="button"
        onClick={onToggle}
        className="w-full relative text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--marketing-ink)]/40 rounded-xl"
        aria-expanded={expanded}
      >
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 ease-out pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(3,22,26,0.035) 0%, rgba(3,22,26,0.02) 50%, rgba(3,22,26,0.035) 100%)",
          }}
        />

        <div
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0 w-[2.5px] rounded-full group-hover:h-[44%] transition-all duration-[420ms] ease-out"
          style={{ backgroundColor: ACCENT }}
        />

        <div className="relative flex items-center gap-4 sm:gap-6 lg:gap-8 py-5 sm:py-6 lg:py-[26px] pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8">
          <span
            aria-hidden
            className="shrink-0 w-9 sm:w-10 text-[12px] sm:text-[13px] font-semibold tracking-[0.2em] font-mono transition-colors duration-300 group-hover:text-[color:var(--marketing-ink)]"
            style={{ color: INK_MUTED }}
          >
            {id}
          </span>

          <div
            aria-hidden
            className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-350 ease-out group-hover:bg-[color:var(--marketing-ink)] group-hover:text-[#f4f2f5]"
            style={{
              backgroundColor: "rgba(3,22,26,0.04)",
              color: INK,
              border: "1px solid rgba(3,22,26,0.06)",
            }}
          >
            <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" aria-hidden />
          </div>

          <h3
            className="flex-1 min-w-0 text-[17px] sm:text-[19px] lg:text-[20px] font-semibold tracking-tight transition-all duration-400 ease-out translate-x-0 group-hover:translate-x-[6px]"
            style={{ color: INK }}
          >
            {title}
          </h3>

          <div
            aria-hidden
            className="shrink-0 hidden sm:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all duration-400 ease-out group-hover:border-transparent group-hover:bg-[color:var(--marketing-ink)]"
            style={{
              borderColor: "rgba(3,22,26,0.1)",
              color: INK_SOFT,
            }}
          >
            <ArrowRight
              className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-400 ease-out translate-x-0 group-hover:translate-x-[3px] group-hover:text-white"
              aria-hidden
            />
          </div>
        </div>

        <div
          className="overflow-hidden grid transition-[grid-template-rows,opacity] duration-[420ms] ease-out lg:hidden"
          style={{
            gridTemplateRows: expanded ? "1fr" : "0fr",
            opacity: expanded ? 1 : 0,
          }}
        >
          <div className="min-h-0">
            <p
              className="text-[14px] sm:text-[14.5px] leading-[1.78] pl-[88px] sm:pl-[104px] lg:pl-[120px] pr-6 sm:pr-8 pb-6 sm:pb-7 -mt-1"
              style={{ color: INK_SOFT }}
            >
              {desc}
            </p>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{
            opacity: expanded ? 1 : 0,
            height: expanded ? "auto" : 0,
          }}
          transition={{ duration: 0.38, ease: EASE_OUT }}
          className="overflow-hidden hidden lg:block"
        >
          <p
            className="text-[14px] sm:text-[14.5px] leading-[1.78] pl-[88px] sm:pl-[104px] lg:pl-[120px] pr-6 sm:pr-8 pb-6 sm:pb-7 -mt-1"
            style={{ color: INK_SOFT }}
          >
            {desc}
          </p>
        </motion.div>
      </button>
    </motion.div>
  );
}

export function Services() {
  const [open, setOpen] = useState<string | null>(SERVICES[0].id);

  const toggle = (id: string) =>
    setOpen((curr) => (curr === id ? null : id));

  return (
    <section
      id="services"
      className="relative py-[104px] sm:py-[128px] lg:py-[156px] overflow-hidden"
      style={{ backgroundColor: "#F7F6F1" }}
      aria-labelledby="services-heading"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 92% 2%, rgba(255,255,255,0.92) 0%, transparent 72%), radial-gradient(ellipse 55% 42% at 8% 108%, rgba(255,255,255,0.8) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(3,22,26,0.9) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={staggerContainerSlow}
          className="grid lg:grid-cols-[0.86fr_1.14fr] gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-start mb-[72px] sm:mb-[92px] lg:mb-[116px]"
        >
          <motion.div
            variants={fadeUp}
            className="lg:sticky lg:top-[112px] relative"
          >
            <div className="flex items-center gap-4 mb-7 sm:mb-9">
              <span
                aria-hidden
                className="h-px w-14 sm:w-20"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(3,22,26,0.2), rgba(3,22,26,0.55))",
                }}
              />
              <span
                aria-hidden
                className="inline-block rounded-full"
                style={{
                  width: 7,
                  height: 7,
                  backgroundColor: ACCENT,
                }}
              />
            </div>

            <p
              className="text-[10.5px] font-semibold uppercase tracking-[0.38em] mb-6"
              style={{ color: INK_MUTED }}
            >
              Our Services
            </p>

            <h2
              id="services-heading"
              className="text-[2.4rem] sm:text-5xl lg:text-[4.25rem] font-bold italic leading-[1.04] tracking-tight mb-7 sm:mb-9"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: INK,
              }}
            >
              Care designed around you.
            </h2>

            <p
              className="text-[15px] sm:text-[16.5px] lg:text-[17px] leading-[1.86] max-w-xl"
              style={{ color: INK_SOFT }}
            >
              From everyday consultations to specialist care and emergency support, Accurate Medical Center provides essential healthcare services with a patient-first approach.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainerFast}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.18 }}
            className="relative"
          >
            <div className="relative">
              {SERVICES.map((s, i) => (
                <ServiceRow
                  key={s.id}
                  id={s.id}
                  icon={s.icon}
                  title={s.title}
                  desc={s.desc}
                  index={i}
                  expanded={open === s.id}
                  onToggle={() => toggle(s.id)}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={staggerContainerFast}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10"
        >


          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={ctaLift}
            className="group relative overflow-hidden inline-flex items-center gap-2.5 px-8 sm:px-10 py-4 sm:py-[17px] rounded-full text-sm sm:text-[15px] font-semibold order-1 sm:order-2"
            style={{
              backgroundColor: ACCENT,
              color: "#f4f2f5",
              boxShadow: "0 14px 40px rgba(3,22,26,0.22)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.42) 0%, transparent 55%)",
              }}
            />
            <Calendar
              className="relative z-10 w-[17px] h-[17px] sm:w-5 sm:h-5 shrink-0 transition-transform duration-400 ease-out group-hover:scale-110 group-hover:-rotate-6"
              aria-hidden
            />
            <span className="relative z-10 tracking-wide">Book an Appointment</span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeUp,
  fadeUpSmall,
  staggerContainerSlow,
  staggerContainerFast,
  staggerContainer,
  sectionReveal,
} from "./animations";
import { displayHeadingClassName, displayHeadingStyle } from "./typography";

const INK = "var(--marketing-ink)";
const INK_SOFT = "var(--muted-text-on-dark)";
const INK_MUTED = "var(--muted-text-on-dark)";
const PRIMARY = "var(--primary)";
const LEMON = "var(--marketing-lemon)";

const TRUST_ITEMS = [
  {
    num: "01",
    title: "24/7 Emergency Care",
    desc: "Round-the-clock emergency response with dedicated staff and critical care readiness at all hours.",
  },
  {
    num: "02",
    title: "Comprehensive Medical Services",
    desc: "From outpatient consultations to advanced diagnostics, surgery, and specialist care under one roof.",
  },
  {
    num: "03",
    title: "Experienced Healthcare Professionals",
    desc: "A team of seasoned doctors, surgeons, nurses, and therapists delivering evidence-based care.",
  },
  {
    num: "04",
    title: "Online Consultations",
    desc: "Convenient virtual consultations that bring quality healthcare directly to you, wherever you are.",
  },
  {
    num: "05",
    title: "Multiple Locations Across Ondo State",
    desc: "Expanding access to quality care with strategic presence and partnerships across the state.",
  },
] as const;

const HOSPITAL_STATS = [
  { label: "Years of Operation", value: 11, suffix: "+" },
  { label: "Specialist Consultants", value: 24, suffix: "" },
  { label: "Inpatient Beds", value: 85, suffix: "" },
  { label: "Annual Patient Visits", value: 42000, suffix: "+" },
  { label: "Surgical Procedures/Year", value: 1200, suffix: "+" },
  { label: "Lab Tests Processed/Day", value: 350, suffix: "+" },
] as const;

const LEADERSHIP_TEAM = [
  {
    name: "Dr. Adebayo Ogunleye",
    role: "Chief Medical Director",
    specialty: "MBBS, FWACS (Obstetrics & Gynecology)",
    bio: "Over 20 years of clinical and administrative experience. Former Head of Obstetrics at Federal Medical Centre, Owo. Fellow of the West African College of Surgeons.",
  },
  {
    name: "Dr. Funmilayo Adeyemi",
    role: "Deputy Medical Director",
    specialty: "MBBS, FWACP (Internal Medicine), MSc (Public Health)",
    bio: "Specialist in infectious diseases and hospital quality improvement. Led the hospital's COVID-19 response team. Certified in Healthcare Quality Management.",
  },
  {
    name: "Dr. Chinedu Okonkwo",
    role: "Head of Clinical Services",
    specialty: "MBBS, FWACS (General Surgery), FMCS (Surgical Oncology)",
    bio: "Minimal access surgeon with 15+ years experience. Established the hospital's laparoscopic surgery program. Trained in UK and India.",
  },
  {
    name: "Pharm. Bolanle Ojo",
    role: "Director of Pharmaceutical Services",
    specialty: "B.Pharm, M.Sc. Clinical Pharmacy, MPSN",
    bio: "Clinical pharmacist with expertise in antimicrobial stewardship and medication safety. Implemented the hospital's electronic prescribing system.",
  },
  {
    name: "Mrs. Grace Olatunji",
    role: "Director of Nursing Services",
    specialty: "RN, RM, RPHN, M.Sc. Nursing Administration",
    bio: "Over 25 years nursing experience across medical, surgical, and critical care units. Championed the hospital's nursing excellence program.",
  },
] as const;

const ACCREDITATIONS = [
  { name: "Federal Ministry of Health", desc: "Licensed Secondary Health Facility", year: "2013" },
  { name: "Medical and Dental Council of Nigeria (MDCN)", desc: "Full Accreditation for Housemanship Training", year: "2016" },
  { name: "National Health Insurance Authority (NHIA)", desc: "Accredited Healthcare Provider", year: "2015" },
  { name: "West African College of Surgeons (WACS)", desc: "Accredited Training Center (Obstetrics & Surgery)", year: "2018" },
  { name: "West African College of Physicians (WACP)", desc: "Accredited Training Center (Internal Medicine)", year: "2020" },
  { name: "National Postgraduate Medical College of Nigeria (NPMCN)", desc: "Accredited for Residency Training (Family Medicine)", year: "2022" },
] as const;

const CORE_VALUES = [
  { title: "Patient-First", desc: "Every decision starts with the patient's wellbeing and dignity.", icon: "🤝" },
  { title: "Clinical Excellence", desc: "Evidence-based practice, continuous audit, and specialist-led care.", icon: "🏥" },
  { title: "Compassion", desc: "Empathetic communication and support for patients and families.", icon: "❤️" },
  { title: "Integrity", desc: "Transparent billing, ethical practice, and accountability at every level.", icon: "⚖️" },
  { title: "Innovation", desc: "Adopting proven technologies and techniques to improve outcomes.", icon: "💡" },
  { title: "Community", desc: "Serving Akure, Ondo State, and South-West Nigeria with outreach programs.", icon: "🌍" },
] as const;

function CountUp({ target, duration = 1500, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return (
    <span
      ref={ref}
      className="text-[2.5rem] sm:text-[3.25rem] font-extrabold leading-none tabular-nums"
      style={{
        fontFamily: "var(--font-playfair)",
        color: INK,
      }}
    >
      {display}{suffix}
    </span>
  );
}

function CountUp247() {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [n24, setN24] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const DUR = 1500;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3);
      setN24(Math.round(24 * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  return (
    <span
      ref={ref}
      className="text-[2.5rem] sm:text-[3.25rem] font-extrabold leading-none tabular-nums"
      style={{
        fontFamily: "var(--font-playfair)",
        color: PRIMARY,
        textShadow: "0 6px 24px rgba(196,106,63,0.22)",
      }}
    >
      {n24}/7
    </span>
  );
}

function TrustIndicator({
  num,
  title,
  desc,
  index,
}: {
  num: string;
  title: string;
  desc: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeUpSmall}
      className="group relative flex gap-5 sm:gap-6 py-5 sm:py-[22px]"
    >
      <div
        aria-hidden
        className="absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(3,22,26,0.08), transparent)",
        }}
      />
      {index === TRUST_ITEMS.length - 1 && (
        <div
          aria-hidden
          className="absolute left-0 right-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(3,22,26,0.08), transparent)",
          }}
        />
      )}

      <div className="shrink-0 flex flex-col items-center pt-1">
        <span
          className="font-mono text-[13px] font-semibold tracking-[0.18em] transition-colors duration-300 group-hover:text-[color:var(--marketing-lemon)]"
          style={{ color: INK_MUTED }}
        >
          {num}
        </span>
        <div
          aria-hidden
          className="mt-3 w-px flex-1 min-h-[36px]"
          style={{
            background: `linear-gradient(180deg, var(--primary) 0%, transparent 100%)`,
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className="text-[17px] sm:text-[18px] font-semibold tracking-tight mb-1.5 sm:mb-2 transition-colors duration-300 group-hover:text-INK"
          style={{ color: INK }}
        >
          {title}
        </h4>
        <p
          className="text-[14px] sm:text-[14.5px] leading-[1.72] sm:leading-[1.78]"
          style={{ color: INK_SOFT }}
        >
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

export function About() {
  return (
    <>
    <section
      id="about"
      className="relative py-[96px] sm:py-[120px] lg:py-[144px] overflow-hidden"
      style={{ backgroundColor: "var(--marketing-ivory)" }}
      aria-labelledby="about-heading"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 42% at 18% -4%, rgba(255,255,255,0.92) 0%, transparent 72%), radial-gradient(ellipse 55% 46% at 92% 108%, rgba(255,255,255,0.78) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(3,22,26,0.85) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainerSlow}
          className="text-center mb-[60px] sm:mb-[80px] lg:mb-[96px]"
        >
          <motion.p
            variants={fadeUpSmall}
            className="text-[10.5px] font-semibold uppercase tracking-[0.38em] mb-6"
            style={{ color: INK_MUTED }}
          >
            About Accurate Medical Centre
          </motion.p>

          <motion.h2
            variants={fadeUp}
            id="about-heading"
            className="text-[2.5rem] sm:text-5xl lg:text-[4.75rem] font-bold leading-[1.05] tracking-tight"
            style={{
              fontFamily: "var(--font-playfair)",
              color: INK,
            }}
          >
            Modern Medicine.
            <br />
            Compassionate Care.
          </motion.h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerContainer}
            className="relative"
          >
            <motion.div variants={fadeUp} className="mb-8 sm:mb-10 flex items-center gap-4">
              <span
                aria-hidden
                className="h-px w-14 sm:w-20"
                style={{ background: `linear-gradient(90deg, var(--primary) 0%, rgba(3,22,26,0.2))` }}
              />
              <span
                aria-hidden
                className="inline-block rounded-full"
                style={{ width: 7, height: 7, backgroundColor: "var(--primary)" }}
              />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.88] mb-7 sm:mb-9"
              style={{ color: INK }}
            >
              Accurate Medical Centre is a modern, multi-service hospital in Akure, Ondo State,
              providing accessible, affordable, and quality healthcare for individuals and
              families across South-West Nigeria since 2013.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.88] mb-7 sm:mb-9"
              style={{ color: INK_SOFT }}
            >
              From{" "}
              <strong className="font-semibold" style={{ color: INK }}>
                outpatient care and diagnostics to maternity, surgery, specialist consultations,
                infertility treatment, addiction recovery, and mental health
              </strong>
              , our experienced consultants combine modern medicine with compassionate,
              patient-first care.
            </motion.p>

            <motion.div variants={fadeUpSmall} className="mb-8 sm:mb-10">
              <h3
                className="text-[10.5px] font-semibold uppercase tracking-[0.36em] mb-8 sm:mb-10 flex items-center gap-3"
                style={{ color: INK_MUTED }}
              >
                <span className="h-px flex-1 max-w-[52px]" style={{ background: "rgba(3,22,26,0.15)" }} />
                Why Accurate Medical Centre
                <span className="h-px flex-1 max-w-[52px]" style={{ background: "rgba(3,22,26,0.15)" }} />
              </h3>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10"
              >
                <motion.div variants={fadeUp} className="flex flex-col items-start">
                  <CountUp target={11} duration={1600} suffix="+" />
                  <span
                    className="mt-2.5 text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.18em] leading-tight"
                    style={{ color: INK_SOFT }}
                  >
                    Specialist Consultants
                  </span>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col items-start">
                  <CountUp247 />
                  <span
                    className="mt-2.5 text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.18em] leading-tight"
                    style={{ color: INK_SOFT }}
                  >
                    Hour Emergency Care
                  </span>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col items-start">
                  <CountUp target={98} duration={1700} suffix="%" />
                  <span
                    className="mt-2.5 text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.18em] leading-tight"
                    style={{ color: INK_SOFT }}
                  >
                    Patient Satisfaction
                  </span>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeUpSmall} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-px w-12 sm:w-16"
                  style={{ background: `linear-gradient(90deg, var(--primary) 0%, rgba(3,22,26,0.14))` }}
                />
                <span
                  className="text-[10.5px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: INK_MUTED }}
                >
                  Delivering on every promise
                </span>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.22 }}
            variants={staggerContainerFast}
            className="relative rounded-[1.65rem] sm:rounded-[1.85rem] px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.4) 100%)",
              border: "1px solid rgba(3,22,26,0.06)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.92) inset, 0 30px 80px rgba(3,22,26,0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-5 left-5 sm:top-6 sm:left-6 rounded-full"
              style={{ width: 9, height: 9, backgroundColor: "var(--primary)", opacity: 0.9 }}
            />
            <div
              aria-hidden
              className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 rounded-sm rotate-45"
              style={{ width: 8, height: 8, backgroundColor: INK, opacity: 0.1 }}
            />

            <div className="pt-3 sm:pt-4">
              <h3 className="text-center mb-6 sm:mb-8 text-[14px] font-semibold uppercase tracking-[0.32em]" style={{ color: INK_MUTED }}>
                Our Core Values
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {CORE_VALUES.map((value, i) => (
                  <motion.div
                    key={value.title}
                    variants={fadeUp}
                    className="group flex flex-col items-center text-center p-4 sm:p-6 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(3,22,26,0.06)",
                      borderRadius: "1rem",
                    }}
                  >
                    <span
                      aria-hidden
                      className="text-3xl mb-3 block transition-transform duration-300 group-hover:scale-110"
                    >
                      {value.icon}
                    </span>
                    <h4
                      className="text-sm sm:text-base font-semibold mb-2"
                      style={{ color: INK }}
                    >
                      {value.title}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                      {value.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <section
      id="leadership"
      className="relative py-[96px] sm:py-[120px] overflow-hidden"
      style={{ backgroundColor: "var(--marketing-ink)", color: "var(--marketing-white)" }}
      aria-labelledby="leadership-heading"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(244,242,245,0.04) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionReveal}
          className="text-center mb-[60px] sm:mb-[80px]"
        >
          <motion.p variants={fadeUpSmall} className="text-[10.5px] font-semibold uppercase tracking-[0.38em] mb-6" style={{ color: "rgba(244,242,245,0.48)" }}>
            Leadership Team
          </motion.p>
          <motion.h2 variants={fadeUp} id="leadership-heading" className="text-[2.5rem] sm:text-5xl lg:text-[4rem] font-bold leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-playfair)", color: "var(--marketing-white)" }}>
            Meet Our <br className="hidden sm:block" />
            <span className="font-semibold" style={{ color: "var(--primary)" }}>Leadership Team</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {LEADERSHIP_TEAM.map((leader, i) => (
            <motion.div
              key={leader.name}
              variants={fadeUp}
              className="relative rounded-2xl p-6 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(244,242,245,0.07)",
                borderRadius: "1rem",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  aria-hidden
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--marketing-lemon))" }}
                >
                  <span className="text-xl font-bold" style={{ color: "var(--primary-foreground)" }}>
                    {leader.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-semibold mb-1" style={{ color: "var(--marketing-white)" }}>
                    {leader.name}
                  </h4>
                  <p className="text-sm font-medium mb-3" style={{ color: "var(--primary)" }}>
                    {leader.role}
                  </p>
                  <p className="text-xs font-medium tracking-wide uppercase mb-3" style={{ color: "var(--primary)" }}>
                    {leader.specialty}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(244,242,245,0.7)" }}>
                    {leader.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    <section
      id="accreditations"
      className="relative py-[96px] sm:py-[120px]"
      style={{ backgroundColor: "var(--marketing-ivory)" }}
      aria-labelledby="accreditations-heading"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionReveal}
          className="text-center mb-[60px] sm:mb-[80px]"
        >
          <motion.p variants={fadeUpSmall} className="text-[10.5px] font-semibold uppercase tracking-[0.38em] mb-6" style={{ color: INK_MUTED }}>
            Accreditations & Affiliations
          </motion.p>
          <motion.h2 variants={fadeUp} id="accreditations-heading" className="text-[2.5rem] sm:text-5xl lg:text-[4rem] font-bold leading-[1.05] tracking-tight" style={{ ...displayHeadingStyle, color: INK }}>
            Recognized Standards <br className="hidden sm:block" />
            <span className="font-semibold">of Excellence</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {ACCREDITATIONS.map((accred, i) => (
            <motion.div
              key={accred.name}
              variants={fadeUp}
              className="relative rounded-2xl p-6 sm:p-8"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(3,22,26,0.06)",
                borderRadius: "1rem",
                boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 20px 50px rgba(3,22,26,0.04)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  aria-hidden
                  className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--marketing-lemon))" }}
                >
                  <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold mb-1" style={{ color: INK }}>
                    {accred.name}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: INK_SOFT }}>
                    {accred.desc}
                  </p>
                  <p className="text-xs font-medium mt-2" style={{ color: "var(--primary)" }}>
                    Accredited since {accred.year}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  </>
  );
}
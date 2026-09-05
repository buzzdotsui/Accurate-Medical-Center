"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeUp,
  fadeUpSmall,
  staggerContainerSlow,
  staggerContainerFast,
  staggerContainer,
} from "./animations";

const LEMON = "#03161a";
const INK = "#03161a";
const INK_SOFT = "rgba(3,22,26,0.65)";
const INK_MUTED = "rgba(3,22,26,0.48)";

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

function CountUp({ target, duration = 1500, suffix = "" }: { target: number, duration?: number, suffix?: string }) {
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
      className="text-[2.5rem] sm:text-[3.25rem] font-bold italic leading-none tabular-nums"
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
      className="text-[2.5rem] sm:text-[3.25rem] font-bold italic leading-none tabular-nums"
      style={{
        fontFamily: "var(--font-playfair)",
        color: LEMON,
        textShadow: "0 6px 24px rgba(3,22,26,0.22)",
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
            background: `linear-gradient(180deg, ${LEMON}35 0%, transparent 100%)`,
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
    <section
      id="about"
      className="relative py-[96px] sm:py-[120px] lg:py-[144px] overflow-hidden"
      style={{ backgroundColor: "#F7F6F1" }}
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

      <div
        aria-hidden
        className="absolute top-[8%] left-[5%] pointer-events-none opacity-25"
        style={{ color: LEMON }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div
        aria-hidden
        className="absolute bottom-[12%] right-[6%] pointer-events-none opacity-[0.07]"
        style={{ color: INK }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

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
            About Accurate Medical Center
          </motion.p>

          <motion.h2
            variants={fadeUp}
            id="about-heading"
            className="text-[2.5rem] sm:text-5xl lg:text-[4.75rem] font-bold italic leading-[1.05] tracking-tight"
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
                style={{ background: `linear-gradient(90deg, ${LEMON}65, rgba(3,22,26,0.2))` }}
              />
              <span
                aria-hidden
                className="inline-block rounded-full"
                style={{ width: 7, height: 7, backgroundColor: LEMON }}
              />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.88] mb-7 sm:mb-9"
              style={{ color: INK }}
            >
              Accurate Medical Center is a modern, multi-service hospital in Akure, Ondo State,
              providing accessible, affordable, and quality healthcare for individuals and
              families.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-[16px] sm:text-[18px] lg:text-[19px] leading-[1.88] mb-7 sm:mb-9"
              style={{ color: INK_SOFT }}
            >
              From{" "}
              <strong className="font-semibold" style={{ color: INK }}>
                outpatient care and diagnostics to maternity, surgery, specialist consultations,
                and psychological therapy
              </strong>
              , our experienced professionals combine modern medicine with compassionate,
              patient-first care.
            </motion.p>

            <motion.div variants={fadeUpSmall} className="mb-8 sm:mb-10">
              <h3
                className="text-[10.5px] font-semibold uppercase tracking-[0.36em] mb-8 sm:mb-10 flex items-center gap-3"
                style={{ color: INK_MUTED }}
              >
                <span className="h-px flex-1 max-w-[52px]" style={{ background: "rgba(3,22,26,0.15)" }} />
                Why Accurate
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
                    Medical Services
                  </span>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col items-start">
                  <CountUp247 />
                  <span
                    className="mt-2.5 text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.18em] leading-tight"
                    style={{ color: INK_SOFT }}
                  >
                    Emergency Care
                  </span>
                </motion.div>

                <motion.div variants={fadeUp} className="flex flex-col items-start">
                  <CountUp target={100} duration={1700} suffix="%" />
                  <span
                    className="mt-2.5 text-[11px] sm:text-[11.5px] font-semibold uppercase tracking-[0.18em] leading-tight"
                    style={{ color: INK_SOFT }}
                  >
                    Patient-First Care
                  </span>
                </motion.div>
              </motion.div>

              <motion.div
                variants={fadeUpSmall}
                className="flex items-center gap-3"
              >
                <span
                  aria-hidden
                  className="h-px w-12 sm:w-16"
                  style={{ background: `linear-gradient(90deg, ${LEMON}70, rgba(3,22,26,0.14))` }}
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
              style={{ width: 9, height: 9, backgroundColor: LEMON, opacity: 0.9 }}
            />
            <div
              aria-hidden
              className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 rounded-sm rotate-45"
              style={{ width: 8, height: 8, backgroundColor: INK, opacity: 0.1 }}
            />

            <div className="pt-3 sm:pt-4">
              {TRUST_ITEMS.map((item, i) => (
                <TrustIndicator
                  key={item.num}
                  num={item.num}
                  title={item.title}
                  desc={item.desc}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

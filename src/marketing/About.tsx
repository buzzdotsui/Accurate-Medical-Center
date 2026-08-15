"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  fadeUp,
  fadeUpSmall,
  fadeIn,
  staggerContainerSlow,
  staggerContainerFast,
  EASE,
  EASE_OUT,
} from "./animations";

const LEMON = "#D4E157";
const LEMON_DARK = "#bccb3c";
const INK = "#03161a";
const INK_SOFT = "rgba(3,22,26,0.65)";
const INK_MUTED = "rgba(3,22,26,0.48)";

function OrnamentalStar({ className = "", size = 10 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function useCountUp(target: number, duration = 1500, suffix = "") {
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

  return { ref, display: `${display}${suffix}` };
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
    <span ref={ref} className="tabular-nums">
      {n24}/7
    </span>
  );
}

function Metric({
  number,
  label,
  accent,
  variant,
}: {
  number: React.ReactNode;
  label: string;
  accent: boolean;
  variant: "first" | "middle" | "last";
}) {
  const showLeft = variant !== "first";
  const showRight = variant !== "last";

  return (
    <motion.div variants={fadeUp} className="relative flex flex-col items-center text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 hidden lg:block"
        style={{ transform: "translate(-50%, -8px)" }}
      >
        {accent ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.1, duration: 0.7, ease: EASE_OUT }}
            className="rounded-full"
            style={{
              width: 14,
              height: 14,
              background: `radial-gradient(circle, ${LEMON} 0%, rgba(212,225,87,0.0) 70%)`,
              filter: "blur(0.3px)",
            }}
          />
        ) : (
          <span
            className="rounded-full inline-block"
            style={{ width: 6, height: 6, backgroundColor: "rgba(3,22,26,0.18)" }}
          />
        )}
      </div>

      {showLeft && (
        <div
          aria-hidden
          className="hidden lg:block absolute top-1/2 -left-[1px] -translate-y-1/2 h-24 w-px"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(3,22,26,0.12) 50%, transparent 100%)`,
          }}
        />
      )}
      {showRight && (
        <div
          aria-hidden
          className="hidden lg:block absolute top-1/2 -right-[1px] -translate-y-1/2 h-24 w-px"
          style={{
            background: `linear-gradient(180deg, transparent 0%, rgba(3,22,26,0.12) 50%, transparent 100%)`,
          }}
        />
      )}

      <motion.div
        variants={fadeIn}
        className="text-[3.5rem] sm:text-[4.75rem] lg:text-[5.75rem] font-bold tracking-tight leading-[0.95]"
        style={{
          fontFamily: "var(--font-playfair-display)",
          color: accent ? LEMON : INK,
          fontStyle: "italic",
          WebkitTextStroke: accent ? "0" : undefined,
          textShadow: accent
            ? "0 8px 30px rgba(212,225,87,0.22)"
            : "0 1px 0 rgba(255,255,255,0.55)",
        }}
      >
        {number}
      </motion.div>

      <motion.div
        variants={fadeUpSmall}
        className="mt-4 sm:mt-5 flex flex-col items-center gap-2"
      >
        <span
          aria-hidden
          className="h-[1.5px] w-10 sm:w-12 rounded-full"
          style={{
            background: accent
              ? `linear-gradient(90deg, transparent, ${LEMON}, transparent)`
              : `linear-gradient(90deg, transparent, rgba(3,22,26,0.22), transparent)`,
          }}
        />
        <span
          className="text-[12px] sm:text-[13px] lg:text-sm font-semibold uppercase tracking-[0.22em] leading-tight"
          style={{ color: INK_SOFT }}
        >
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}

export function About() {
  const c11 = useCountUp(11, 1500, "+");
  const c100 = useCountUp(100, 1600, "%");

  return (
    <section
      id="about"
      className="relative py-[120px] sm:py-[152px] lg:py-[184px] overflow-hidden"
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
        className="absolute top-28 left-[6%] pointer-events-none"
        style={{ color: LEMON, opacity: 0.4 }}
      >
        <motion.div
          custom={1}
          animate="animate"
          variants={{
            animate: (i: number) => ({
              opacity: [0.25, 0.55, 0.25],
              scale: [1, 1.12, 1],
              rotate: [0, 7, 0],
              transition: {
                duration: 5.5 + (i % 2),
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror" as const,
                delay: i * 0.4,
              },
            }),
          }}
        >
          <OrnamentalStar size={26} />
        </motion.div>
      </div>
      <div
        aria-hidden
        className="absolute bottom-40 right-[8%] pointer-events-none"
        style={{ color: INK, opacity: 0.08 }}
      >
        <motion.div
          custom={2}
          animate="animate"
          variants={{
            animate: (i: number) => ({
              opacity: [0.07, 0.16, 0.07],
              scale: [1, 1.14, 1],
              rotate: [0, -9, 0],
              transition: {
                duration: 6.5 + (i % 2),
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror" as const,
                delay: i * 0.5,
              },
            }),
          }}
        >
          <OrnamentalStar size={42} />
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
          variants={staggerContainerSlow}
          className="text-center mb-[72px] sm:mb-[96px] lg:mb-[120px]"
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
            className="text-[2.5rem] sm:text-5xl lg:text-[4.75rem] font-bold italic leading-[1.05] tracking-tight mb-10 lg:mb-12"
            style={{
              fontFamily: "var(--font-playfair-display)",
              color: INK,
            }}
          >
            Modern Medicine.
            <br />
            Compassionate Care.
          </motion.h2>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
            <span
              aria-hidden
              className="h-px w-14 sm:w-20"
              style={{ background: `linear-gradient(90deg, transparent, rgba(3,22,26,0.22))` }}
            />
            <span
              aria-hidden
              className="inline-block rounded-full"
              style={{ width: 8, height: 8, backgroundColor: LEMON }}
            />
            <span
              aria-hidden
              className="h-px w-14 sm:w-20"
              style={{ background: `linear-gradient(90deg, rgba(3,22,26,0.22), transparent)` }}
            />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-[15.5px] sm:text-[17px] lg:text-lg leading-[1.92] max-w-2xl mx-auto mb-7"
            style={{ color: INK_SOFT }}
          >
            Accurate Medical Center is a modern, multi-service hospital in Akure, Ondo State,
            providing accessible, affordable, and quality healthcare for individuals and
            families.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-[15.5px] sm:text-[17px] lg:text-lg leading-[1.92] max-w-2xl mx-auto"
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
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerContainerFast}
          className="relative"
        >
          <motion.div
            variants={fadeUpSmall}
            className="flex items-center justify-center gap-4 mb-[56px] sm:mb-[68px] lg:mb-[76px]"
          >
            <span
              aria-hidden
              className="h-px w-10 sm:w-16"
              style={{ background: `linear-gradient(90deg, transparent, rgba(3,22,26,0.16))` }}
            />
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              style={{ color: LEMON }}
            >
              <path
                d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span
              aria-hidden
              className="h-px w-10 sm:w-16"
              style={{ background: `linear-gradient(90deg, rgba(3,22,26,0.16), transparent)` }}
            />
          </motion.div>

          <div
            className="relative rounded-[2rem] px-6 py-[64px] sm:px-10 sm:py-[80px] lg:px-16 lg:py-[96px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.35) 100%)",
              border: "1px solid rgba(3,22,26,0.06)",
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.92) inset, 0 30px 80px rgba(3,22,26,0.05)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <div
              aria-hidden
              className="absolute top-5 left-5 sm:top-7 sm:left-7 rounded-full"
              style={{ width: 10, height: 10, backgroundColor: LEMON, opacity: 0.9 }}
            />
            <div
              aria-hidden
              className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 rounded-sm rotate-45"
              style={{ width: 10, height: 10, backgroundColor: INK, opacity: 0.1 }}
            />

            <motion.div
              variants={staggerContainerSlow}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-[68px] sm:gap-10 lg:gap-14 max-w-5xl mx-auto"
            >
              <Metric
                variant="first"
                accent={false}
                number={<span ref={c11.ref} className="tabular-nums">{c11.display}</span>}
                label="Medical Services"
              />
              <Metric
                variant="middle"
                accent
                number={<CountUp247 />}
                label="Emergency Care"
              />
              <Metric
                variant="last"
                accent={false}
                number={<span ref={c100.ref} className="tabular-nums">{c100.display}</span>}
                label="Patient-First Care"
              />
            </motion.div>
          </div>

          <motion.div
            variants={fadeUpSmall}
            className="mt-[56px] sm:mt-[68px] flex items-center justify-center gap-4"
          >
            <span
              aria-hidden
              className="h-px w-16 sm:w-24"
              style={{ background: `linear-gradient(90deg, transparent, rgba(3,22,26,0.18))` }}
            />
            <span
              className="text-[10.5px] font-semibold uppercase tracking-[0.32em]"
              style={{ color: INK_MUTED }}
            >
              Delivering on every promise
            </span>
            <span
              aria-hidden
              className="h-px w-16 sm:w-24"
              style={{ background: `linear-gradient(90deg, rgba(3,22,26,0.18), transparent)` }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

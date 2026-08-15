"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import {
  fadeUp,
  fadeUpSmall,
  staggerContainerSlow,
  ornamentalStar,
  EASE_OUT,
} from "./animations";

const MISSION_ITEMS: readonly string[] = [
  "Provide accessible, high-quality medical care.",
  "Promote physical, mental, and reproductive health.",
  "Integrate modern diagnostic technology with compassionate service.",
  "Improve community wellbeing through preventive and curative healthcare.",
  "Deliver expert online consultations to patients beyond Akure.",
] as const;

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-9 sm:my-11" aria-hidden>
      <div
        className="h-px flex-1 max-w-[84px]"
        style={{ backgroundColor: "rgba(244,242,245,0.14)" }}
      />
      <motion.svg
        custom={0}
        variants={ornamentalStar}
        animate="animate"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        style={{ color: "rgba(244,242,245,0.38)", flexShrink: 0 }}
      >
        <path
          d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
          fill="currentColor"
        />
      </motion.svg>
      <div
        className="h-px flex-1 max-w-[84px]"
        style={{ backgroundColor: "rgba(244,242,245,0.14)" }}
      />
    </div>
  );
}

function BottomDecoration() {
  return (
    <div className="flex items-center justify-center gap-3 mt-12 sm:mt-15" aria-hidden>
      <div
        className="h-px w-13"
        style={{ backgroundColor: "rgba(244,242,245,0.09)" }}
      />
      <motion.svg
        custom={1}
        variants={ornamentalStar}
        animate="animate"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        style={{ color: "rgba(244,242,245,0.2)", flexShrink: 0 }}
      >
        <path
          d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
          fill="currentColor"
        />
      </motion.svg>
      <div
        className="h-px w-13"
        style={{ backgroundColor: "rgba(244,242,245,0.09)" }}
      />
    </div>
  );
}

export function VisionMission() {
  return (
    <section
      id="vision-mission"
      className="py-26 sm:py-[136px] lg:py-[152px] relative overflow-hidden"
      aria-labelledby="vm-heading"
      style={{ backgroundColor: "#03161a" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% 50%, rgba(244,242,245,0.035) 0%, transparent 72%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(244,242,245,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(244,242,245,0.8) 1px, transparent 1px)",
          backgroundSize: "68px 68px",
          maskImage:
            "radial-gradient(ellipse 62% 52% at 50% 50%, black 18%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 62% 52% at 50% 50%, black 18%, transparent 72%)",
        }}
      />

      <h2 id="vm-heading" className="sr-only">
        Our Vision and Our Mission
      </h2>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, ease: EASE_OUT }}
          className="text-center mb-17 sm:mb-[76px]"
        >
          <span
            className="inline-flex items-center gap-3 px-4.5 py-2 rounded-full text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{
              color: "rgba(244,242,245,0.42)",
              backgroundColor: "rgba(244,242,245,0.035)",
              border: "1px solid rgba(244,242,245,0.07)",
            }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "rgba(244,242,245,0.36)" }}
            />
            Our Foundation
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6.5 sm:gap-8 lg:gap-10">
          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainerSlow}
            aria-labelledby="vision-heading"
            className="relative rounded-[1.85rem] sm:rounded-[2.1rem] flex flex-col items-center text-center px-7 sm:px-12 lg:px-14 py-17 sm:py-[88px] lg:py-[104px] overflow-hidden"
            style={{
              backgroundColor: "#000000",
              boxShadow:
                "0 28px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-[inherit] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 28% -8%, rgba(244,242,245,0.06) 0%, transparent 62%)",
              }}
            />
            <div
              aria-hidden
              className="absolute top-0 left-11 right-11 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(244,242,245,0.1), transparent)",
              }}
            />

            <motion.p
              variants={fadeUpSmall}
              className="text-[10px] font-semibold uppercase tracking-[0.34em] mb-8 relative z-10"
              style={{ color: "rgba(244,242,245,0.36)" }}
            >
              01
              <span className="mx-2.5" style={{ color: "rgba(244,242,245,0.16)" }}>·</span>
              Vision
            </motion.p>

            <motion.h3
              variants={fadeUp}
              id="vision-heading"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold italic leading-[1.06] relative z-10 tracking-tight"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: "#f4f2f5",
              }}
            >
              Our Vision
            </motion.h3>

            <OrnamentalDivider />

            <motion.p
              variants={fadeUp}
              className="text-[15px] sm:text-[17px] lg:text-lg font-medium italic leading-[1.8] max-w-xs sm:max-w-sm relative z-10"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: "rgba(244,242,245,0.87)",
              }}
            >
              {siteConfig.vision}
            </motion.p>

            <BottomDecoration />
          </motion.article>

          <motion.article
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainerSlow}
            aria-labelledby="mission-heading"
            className="relative rounded-[1.85rem] sm:rounded-[2.1rem] flex flex-col items-center text-center px-7 sm:px-12 lg:px-14 py-17 sm:py-[88px] lg:py-[104px] overflow-hidden"
            style={{
              backgroundColor: "#000000",
              boxShadow:
                "0 28px 90px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-[inherit] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 72% -8%, rgba(244,242,245,0.06) 0%, transparent 62%)",
              }}
            />
            <div
              aria-hidden
              className="absolute top-0 left-11 right-11 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(244,242,245,0.1), transparent)",
              }}
            />

            <motion.p
              variants={fadeUpSmall}
              className="text-[10px] font-semibold uppercase tracking-[0.34em] mb-8 relative z-10"
              style={{ color: "rgba(244,242,245,0.36)" }}
            >
              02
              <span className="mx-2.5" style={{ color: "rgba(244,242,245,0.16)" }}>·</span>
              Mission
            </motion.p>

            <motion.h3
              variants={fadeUp}
              id="mission-heading"
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-bold italic leading-[1.06] relative z-10 tracking-tight"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: "#f4f2f5",
              }}
            >
              Our Mission
            </motion.h3>

            <OrnamentalDivider />

            <motion.ol
              variants={staggerContainerSlow}
              className="w-full text-left sm:text-center space-y-0 list-none relative z-10"
              aria-label="Mission statement items"
            >
              {MISSION_ITEMS.map((item, i) => (
                <motion.li key={i} variants={fadeUpSmall}>
                  {i > 0 && (
                    <div
                      className="h-px mx-auto mb-[18px] mt-[18px] max-w-[230px] sm:max-w-none"
                      style={{ backgroundColor: "rgba(244,242,245,0.065)" }}
                      aria-hidden
                    />
                  )}
                  <p
                    className="text-sm sm:text-[15.5px] lg:text-base font-medium italic leading-[1.82]"
                    style={{
                      fontFamily: "var(--font-playfair-display)",
                      color: "rgba(244,242,245,0.83)",
                    }}
                  >
                    {item}
                  </p>
                </motion.li>
              ))}
            </motion.ol>

            <BottomDecoration />
          </motion.article>
        </div>
      </div>
    </section>
  );
}

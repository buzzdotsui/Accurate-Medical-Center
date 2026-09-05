"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import {
  contentReveal,
  fadeUpSmall,
  headingReveal,
  panelReveal,
  sectionReveal,
  staggerContainerSlow,
} from "./animations";
import { displayHeadingClassName, displayHeadingStyle, displayHeadingVariantClassNames } from "./typography";

const MISSION_ITEMS: readonly string[] = [
  "Provide accessible, high-quality medical care.",
  "Promote physical, mental, and reproductive health.",
  "Integrate modern diagnostic technology with compassionate service.",
  "Improve community wellbeing through preventive and curative healthcare.",
  "Deliver expert online consultations to patients beyond Akure.",
] as const;

const panelStatementClassName =
  "max-w-xs text-[16px] font-semibold leading-[1.65] sm:max-w-sm sm:text-[18px] lg:text-[19px]";

const panelStatementStyle = {
  fontFamily: "var(--font-playfair)",
  color: "rgba(244,242,245,0.94)",
} as const;

const panelSurfaceStyle = {
  backgroundColor: "#000000",
  boxShadow:
    "0 24px 72px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(244,242,245,0.06)",
} as const;

// Ornamental dividers removed

function VisionPanel() {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={panelReveal}
      custom={0}
      aria-labelledby="vision-heading"
      className="relative rounded-[1.85rem] sm:rounded-[2.1rem] flex flex-col items-center text-center px-7 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-14 overflow-hidden"
      style={panelSurfaceStyle}
    >

      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 28% -8%, rgba(244,242,245,0.08) 0%, transparent 55%), radial-gradient(ellipse at 82% 108%, rgba(244,242,245,0.04) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(244,242,245,0.04) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-0 left-11 right-11 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,242,245,0.22), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-11 right-11 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,242,245,0.08), transparent)",
        }}
      />

      <motion.p
        variants={fadeUpSmall}
        className="text-[10px] font-semibold uppercase tracking-[0.34em] mb-4 relative z-10"
        style={{ color: "rgba(244,242,245,0.4)" }}
      >
        01
        <span className="mx-2.5" style={{ color: "rgba(244,242,245,0.45)" }}>
          ·
        </span>
        Vision
      </motion.p>

      <motion.h3
        variants={headingReveal}
        id="vision-heading"
        className={`text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] relative z-10 mb-4 ${displayHeadingClassName}`}
        style={{
          ...displayHeadingStyle,
          color: "#f4f2f5",
          textShadow: "0 8px 36px rgba(0,0,0,0.6)",
        }}
      >
        Our Vision
      </motion.h3>

      <motion.p
        variants={contentReveal}
        className={`${panelStatementClassName} relative z-10`}
        style={panelStatementStyle}
      >
        {siteConfig.vision}
      </motion.p>
    </motion.article>
  );
}

function MissionPanel() {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={panelReveal}
      custom={0.14}
      aria-labelledby="mission-heading"
      className="relative rounded-[1.85rem] sm:rounded-[2.1rem] flex flex-col items-center text-center px-7 sm:px-10 lg:px-12 py-10 sm:py-12 lg:py-14 overflow-hidden"
      style={panelSurfaceStyle}
    >

      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 72% -8%, rgba(244,242,245,0.08) 0%, transparent 55%), radial-gradient(ellipse at 18% 108%, rgba(244,242,245,0.04) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, rgba(244,242,245,0.04) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-0 left-11 right-11 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,242,245,0.22), transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-11 right-11 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(244,242,245,0.08), transparent)",
        }}
      />

      <motion.p
        variants={fadeUpSmall}
        className="text-[10px] font-semibold uppercase tracking-[0.34em] mb-4 relative z-10"
        style={{ color: "rgba(244,242,245,0.4)" }}
      >
        02
        <span className="mx-2.5" style={{ color: "rgba(244,242,245,0.45)" }}>
          ·
        </span>
        Mission
      </motion.p>

      <motion.h3
        variants={headingReveal}
        id="mission-heading"
        className={`text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] relative z-10 mb-5 ${displayHeadingClassName}`}
        style={{
          ...displayHeadingStyle,
          color: "#f4f2f5",
          textShadow: "0 8px 36px rgba(0,0,0,0.6)",
        }}
      >
        Our Mission
      </motion.h3>

      <motion.ol
        variants={staggerContainerSlow}
        className="w-full text-left sm:text-center space-y-0 list-none relative z-10"
        aria-label="Mission statement items"
      >
        {MISSION_ITEMS.map((item, i) => (
          <motion.li key={i} variants={fadeUpSmall}>
            {i > 0 && (
              <div
                className="h-px mx-auto my-2.5 max-w-[230px] sm:max-w-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(244,242,245,0.085), transparent)",
                }}
                aria-hidden
              />
            )}
            <p
              className={`${panelStatementClassName} mx-auto`}
              style={panelStatementStyle}
            >
              {item}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </motion.article>
  );
}

export function VisionMission() {
  return (
    <section
      id="vision-mission"
      className="py-14 sm:py-20 lg:py-24 relative overflow-hidden"
      aria-labelledby="vm-heading"
      style={{ backgroundColor: "#000000" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -8%, rgba(244,242,245,0.05) 0%, transparent 62%), radial-gradient(ellipse 75% 48% at 50% 108%, rgba(244,242,245,0.03) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
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

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          variants={sectionReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-14"
        >
          <motion.span
            variants={fadeUpSmall}
            className="inline-flex items-center gap-3 px-[22px] py-[10px] rounded-full text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{
              color: "rgba(244,242,245,0.5)",
              backgroundColor: "rgba(244,242,245,0.035)",
              border: "1px solid rgba(244,242,245,0.12)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}
          >
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#f4f2f5", boxShadow: "0 0 10px rgba(244,242,245,0.5)" }}
            />
            Our Foundation
          </motion.span>
          <motion.h2
            variants={headingReveal}
            id="vm-heading"
            className={`mt-6 ${displayHeadingClassName} ${displayHeadingVariantClassNames.section}`}
            style={{
              ...displayHeadingStyle,
              color: "#f4f2f5",
              textShadow: "0 8px 36px rgba(0,0,0,0.48)",
            }}
          >
            <span className="block">Healing Minds.</span>
            <span className="block">Restoring Lives.</span>
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          <VisionPanel />
          <MissionPanel />
        </div>
      </div>
    </section>
  );
}

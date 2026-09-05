"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { contentReveal, headingReveal, pageReveal } from "@/marketing/animations";
import {
  displayHeadingClassName,
  displayHeadingStyle,
  displayHeadingVariantClassNames,
} from "@/marketing/typography";

export function BookingPageMotion({ children }: { children: ReactNode }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={pageReveal}>
      <motion.div variants={contentReveal} className="mb-10 text-center">
        <motion.h1
          variants={headingReveal}
          className={`${displayHeadingClassName} ${displayHeadingVariantClassNames.appointment} mb-4 text-white`}
          style={displayHeadingStyle}
        >
          Request Care
        </motion.h1>
        <motion.p variants={contentReveal} className="mx-auto max-w-xl text-lg text-[#a4b5b8]">
          Fill out the form below to request an appointment. Our reception team will get back to you shortly to confirm your booking.
        </motion.p>
      </motion.div>
      <motion.div variants={contentReveal}>{children}</motion.div>
    </motion.div>
  );
}

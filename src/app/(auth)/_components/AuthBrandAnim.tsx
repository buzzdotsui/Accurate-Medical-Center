"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { displayHeadingClassName, displayHeadingStyle } from "@/marketing/typography";

const ANIMATION_DURATION = 8000;

export function AuthBrandAnim() {
  const [index, setIndex] = useState(0);

  const content = [
    {
      title: "Our Vision",
      text: siteConfig.vision,
    },
    {
      title: "Our Mission",
      text: siteConfig.mission,
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current === 0 ? 1 : 0));
    }, ANIMATION_DURATION);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-32 w-full max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col justify-end"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#d4e842] mb-2">
            {content[index].title}
          </p>
          <h3 
            className={`text-lg sm:text-xl font-medium leading-[1.6] text-white/90`} 
            style={{ fontFamily: "var(--font-plus-jakarta-sans)" }}
          >
            {content[index].text}
          </h3>
        </motion.div>
      </AnimatePresence>
      
      {/* Progress Indicators */}
      <div className="absolute -bottom-8 left-0 flex gap-2">
        {content.map((_, i) => (
          <div key={i} className="h-1 w-10 overflow-hidden rounded-full bg-white/20">
            {i === index && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: ANIMATION_DURATION / 1000, ease: "linear" }}
                className="h-full w-full bg-[#d4e842]"
              />
            )}
            {i < index && (
              <div className="h-full w-full bg-[#d4e842]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

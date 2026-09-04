"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMediaPreloader } from "./MediaPreloaderContext";

// Fallback: if critical media takes longer than 5 s, reveal the site anyway.
// Rationale: hero preload="metadata" fetches only a small header segment
// (~50-150 KB). On a 3G connection (~1 Mbps) this completes in <1.5 s.
// 5 s gives a generous 3× buffer before we bail out.
const FALLBACK_MS = 5000;

export function Loader() {
  const { isReady } = useMediaPreloader();
  const [isVisible, setIsVisible] = useState(true);

  // Primary path: all critical assets ready → hide with a short transition delay.
  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  // Deterministic fallback: page is ALWAYS revealed after FALLBACK_MS.
  // This guarantees no media failure can permanently block the site.
  useEffect(() => {
    const fallbackTimer = setTimeout(() => setIsVisible(false), FALLBACK_MS);
    return () => clearTimeout(fallbackTimer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: "#03161a" }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/marketing/images/logo.jpeg"
                alt="Accurate Medical Center"
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <span 
                className="text-sm font-medium tracking-wide uppercase"
                style={{ color: "rgba(244,242,245,0.7)", letterSpacing: "0.2em" }}
              >
                Preparing your experience
              </span>
              
              <div className="w-40 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: "rgba(244,242,245,0.1)" }}>
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#d4e842" }}
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.8, 
                    ease: "easeInOut" 
                  }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

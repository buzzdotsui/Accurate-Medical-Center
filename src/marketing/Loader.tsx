"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Loader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the loader immediately after hydration and initial render
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: "#03161a" }}
          aria-hidden="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <h1 
              className="text-2xl sm:text-3xl font-bold italic tracking-tight"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: "#f4f2f5",
              }}
            >
              Accurate Medical Center
            </h1>
            <div 
              className="w-12 h-[2px] rounded-full"
              style={{ backgroundColor: "#d4e842" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

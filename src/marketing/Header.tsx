"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Calendar, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EASE,
  backdrop,
  slideInRight,
  drawerNavStagger,
  fadeUpSmall,
  fadeIn,
  ctaLift,
} from "./animations";

const NAV_LINKS = [
  { label: "About",      href: "#vision-mission" },
  { label: "Services",   href: "#services" },
  { label: "Experience", href: "#experience" },
  { label: "Contact",    href: "#contact" },
] as const;

export function Header() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const scrollTo = useCallback((href: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <>
      <motion.header
        role="banner"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: EASE, delay: 0.1 }}
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: scrolled ? "rgba(3, 22, 26, 0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.15)" : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.15)" : "blur(0px)",
          borderBottom: scrolled ? "1px solid rgba(244, 242, 245, 0.08)" : "1px solid transparent",
          boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.2)" : "0 0 0 rgba(0,0,0,0)",
          transition: "background-color 550ms ease, backdrop-filter 550ms ease, -webkit-backdrop-filter 550ms ease, border-color 550ms ease, box-shadow 550ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[78px] lg:h-[88px]">

            <button
              onClick={() => scrollTo("#home")}
              className="flex items-center shrink-0 gap-3.5 sm:gap-4 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              aria-label="Accurate Medical Center, scroll to top"
            >
              <div className="rounded-xl overflow-hidden">
                <Image
                  src="/marketing/images/logo.jpeg"
                  alt="Accurate Medical Center logo"
                  width={58}
                  height={58}
                  className="object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span
                  className="text-[15px] sm:text-[16px] font-bold tracking-[0.04em] uppercase"
                  style={{
                    fontFamily: "var(--font-playfair-display)",
                    fontStyle: "italic",
                    color: "#f4f2f5",
                    letterSpacing: "0.02em",
                  }}
                >
                  Accurate
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em]"
                  style={{ color: "rgba(244,242,245,0.55)" }}
                >
                  Medical Center
                </span>
              </div>
            </button>

            <nav className="hidden lg:flex items-center gap-11" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href + link.label}
                  onClick={() => scrollTo(link.href)}
                  className="group relative text-[13px] font-medium tracking-[0.08em] uppercase text-[#f4f2f5]/65 hover:text-[#f4f2f5] transition-colors duration-300 focus-visible:outline-none"
                >
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-[1.5px] bg-[#f4f2f5] transition-all duration-400 ease-out group-hover:w-full rounded-full" style={{ boxShadow: "0 0 8px rgba(244,242,245,0.4)" }} />
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center">
              <motion.a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo("#contact");
                }}
                variants={ctaLift}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="relative inline-flex items-center gap-2.5 px-[26px] py-[11px] rounded-full text-[13px] font-semibold tracking-wide overflow-hidden group"
                style={{ backgroundColor: "#03161a", color: "#f4f2f5", boxShadow: "0 8px 28px rgba(3,22,26,0.25)" }}
              >
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, transparent 55%)",
                  }}
                />
                <Calendar className="relative z-10 w-4 h-4 shrink-0 transition-transform duration-400 ease-out group-hover:scale-110 group-hover:-rotate-6" aria-hidden="true" />
                <span className="relative z-10">Book an Appointment</span>
              </motion.a>
            </div>

            <button
              className={`lg:hidden p-2.5 rounded-xl text-[#f4f2f5] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 ${
                scrolled ? "hover:bg-white/10" : "hover:bg-black/20"
              }`}
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
            >
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              variants={backdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[60] lg:hidden"
              style={{ backgroundColor: "rgba(3, 22, 26, 0.6)", backdropFilter: "blur(5px)" }}
              aria-hidden="true"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              exit="exit"
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 h-full w-[min(350px,92vw)] z-[70] flex flex-col lg:hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
              style={{
                backgroundColor: "rgba(3, 22, 26, 0.97)",
                backdropFilter: "blur(28px) saturate(1.2)",
                WebkitBackdropFilter: "blur(28px) saturate(1.2)",
                borderLeft: "1px solid rgba(244, 242, 245, 0.08)",
              }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
                <div className="flex items-center gap-3">
                  <Image
                    src="/marketing/images/logo.jpeg"
                    alt="Accurate Medical Center"
                    width={46}
                    height={46}
                    className="rounded-lg object-contain"
                  />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#f4f2f5]/55">
                      Accurate
                    </span>
                    <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#f4f2f5]/40">
                      Medical Center
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-[#f4f2f5]/55 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <motion.nav
                variants={drawerNavStagger}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto px-6 py-9 flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {NAV_LINKS.map((link) => (
                  <motion.button
                    key={link.href + link.label}
                    variants={fadeUpSmall}
                    onClick={() => scrollTo(link.href)}
                    className="group flex items-center justify-between text-left text-[23px] font-medium text-[#f4f2f5]/78 hover:text-white transition-colors py-4 border-b border-white/[0.05]"
                  >
                    <span className="tracking-tight">{link.label}</span>
                    <span
                      aria-hidden
                      className="w-6 h-px bg-[#f4f2f5]/28 transition-all duration-300 ease-out group-hover:w-10 group-hover:bg-[#f4f2f5]/55"
                    />
                  </motion.button>
                ))}
              </motion.nav>

              <motion.div
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.38, duration: 0.5 }}
                className="p-6 pt-5 border-t border-white/[0.07]"
              >
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo("#contact");
                  }}
                  className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl text-sm font-semibold transition-transform active:scale-[0.98] hover:brightness-[0.98]"
                  style={{ backgroundColor: "#03161a", color: "#f4f2f5", boxShadow: "0 10px 32px rgba(3,22,26,0.2)" }}
                >
                  <Calendar className="w-5 h-5" aria-hidden="true" />
                  Book an Appointment
                </a>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

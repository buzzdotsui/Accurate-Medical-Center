"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ArrowRight, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { EASE, heroStagger, fadeUp, fadeInSlow, ctaLift, arrowSlide } from "./animations";

const HERO_VIDEO = "/marketing/videos/hero/hero.mp4";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { scrollY } = useScroll();
  const yBg = useTransform(scrollY, [0, 800], [0, 140]);
  const yContent = useTransform(scrollY, [0, 600], [0, 70]);
  const opacityContent = useTransform(scrollY, [0, 350], [1, 0.2]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = 0.75;
    
    if (v.readyState >= 3) {
      setIsVideoReady(true);
    }
    
    const onMeta = () => {
      v.playbackRate = 0.75;
    };
    const onReady = () => setIsVideoReady(true);
    
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("canplay", onReady);
    v.addEventListener("playing", onReady);
    
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay", onReady);
      v.removeEventListener("playing", onReady);
    };
  }, []);

  const scrollToNext = () => {
    document
      .querySelector("#vision")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{ backgroundColor: "#03161a" }}
      aria-label="Hero, Accurate Medical Center"
    >
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 w-full h-[118%] -top-[9%]"
        aria-hidden
      >
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-[800ms]"
          style={{ 
            backgroundImage: 'url(/marketing/images/logo.jpeg)',
            opacity: isVideoReady ? 0 : 1
          }}
        />
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-out ${isVideoReady ? 'opacity-100' : 'opacity-0'}`}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        />
      </motion.div>

      <motion.div
        variants={fadeInSlow}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse at 50% 18%, transparent 0%, rgba(3,22,26,0.15) 45%, rgba(3,22,26,0.5) 78%, rgba(3,22,26,0.82) 100%),
            radial-gradient(ellipse at 50% 100%, rgba(3,22,26,0.72) 0%, transparent 58%),
            linear-gradient(90deg, rgba(3,22,26,0.48) 0%, transparent 24%, transparent 76%, rgba(3,22,26,0.48) 100%)
          `,
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 58%, rgba(3,22,26,0.58) 100%)",
        }}
      />

      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 text-center pt-[84px] flex flex-col items-center"
      >
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-[3.75rem] lg:text-[5.5rem] xl:text-[6.5rem] font-bold italic leading-[1.03] tracking-tight mb-9 sm:mb-12"
          style={{
            fontFamily: "var(--font-playfair-display)",
            color: "#f4f2f5",
            textShadow:
              "0 10px 50px rgba(3,22,26,0.65), 0 2px 10px rgba(3,22,26,0.45)",
          }}
        >
          Healing Minds, Restoring Lives.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-[15px] sm:text-[17px] lg:text-lg text-[#f4f2f5]/78 max-w-2xl mx-auto mb-14 sm:mb-[72px] leading-[1.82] font-light"
        >
          Accurate Medical Center delivers quality, accessible, compassionate healthcare for every individual and family in Akure and across Ondo State.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-sm sm:max-w-none"
        >
          <motion.a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            variants={ctaLift}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-[18px] rounded-full text-sm sm:text-[15px] font-semibold"
            style={{
              backgroundColor: "#03161a",
              color: "#f4f2f5",
              boxShadow: "0 14px 40px rgba(3,22,26,0.28)",
              border: "1px solid rgba(244,242,245,0.18)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, transparent 55%)",
              }}
            />
            <Calendar
              className="relative z-10 w-[18px] h-[18px] sm:w-5 sm:h-5 shrink-0 transition-transform duration-400 ease-out group-hover:scale-110 group-hover:-rotate-6"
              aria-hidden
            />
            <span className="relative z-10 tracking-wide">Book an Appointment</span>
          </motion.a>

          <motion.a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#services")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            variants={ctaLift}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="group inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-[18px] rounded-full text-sm sm:text-[15px] font-semibold"
            style={{
              color: "#f4f2f5",
              backgroundColor: "rgba(244,242,245,0.06)",
              border: "1px solid rgba(244,242,245,0.22)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <span className="tracking-wide">Explore Our Services</span>
            <motion.div
              variants={arrowSlide}
              initial="rest"
              whileHover="hover"
              className="shrink-0"
            >
              <ArrowRight className="w-[18px] h-[18px] sm:w-5 sm:h-5" aria-hidden />
            </motion.div>
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.8, ease: EASE }}
        onClick={scrollToNext}
        className="absolute bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#f4f2f5]/30 hover:text-[#f4f2f5]/65 transition-colors duration-300 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 rounded-lg px-3 py-2"
        aria-label="Scroll down to Our Foundation"
      >
        <span className="text-[10px] tracking-[0.32em] uppercase font-semibold">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 2.2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop" as const,
            delay: 3,
          }}
        >
          <ChevronDown className="w-5 h-5" aria-hidden />
        </motion.div>
      </motion.button>
    </section>
  );
}

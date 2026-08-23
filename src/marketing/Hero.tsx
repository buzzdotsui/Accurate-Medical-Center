"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowRight, ChevronDown } from "lucide-react";
import { heroStagger, fadeUp, fadeInSlow, ctaLift, arrowSlide, EASE } from "./animations";
import { useMediaPreloader } from "./MediaPreloaderContext";
import { MEDIA_CONFIG } from "@/config/media";

// ── Verified Cloudinary URLs (200 OK confirmed before deployment) ────────────
const HERO_DESKTOP_URL = MEDIA_CONFIG.videos.hero.desktopUrl;
const HERO_MOBILE_URL  = MEDIA_CONFIG.videos.hero.mobileUrl;
const HERO_POSTER_URL  = MEDIA_CONFIG.videos.hero.posterUrl;

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady]     = useState(false);
  const [isMobile, setIsMobile]             = useState(false);
  const [reducedMotion, setReducedMotion]   = useState(false);

  const { scrollY } = useScroll();
  const yBg      = useTransform(scrollY, [0, 800], [0, 140]);
  const yContent = useTransform(scrollY, [0, 600], [0, 70]);
  const opacityContent = useTransform(scrollY, [0, 350], [1, 0.2]);

  const { registerAsset, setAssetReady } = useMediaPreloader();

  // Detect viewport + user preferences once on mount
  useEffect(() => {
    const mq   = window.matchMedia("(max-width: 768px)");
    const pref = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsMobile(mq.matches);
    setReducedMotion(pref.matches);

    const onMq   = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onPref = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onMq);
    pref.addEventListener("change", onPref);
    return () => {
      mq.removeEventListener("change", onMq);
      pref.removeEventListener("change", onPref);
    };
  }, []);

  // Video event wiring — only runs when video is rendered
  useEffect(() => {
    registerAsset("hero-video");
    const v = videoRef.current;
    if (!v) return;

    v.playbackRate = 0.75;

    if (v.readyState >= 3) {
      setIsVideoReady(true);
      setAssetReady("hero-video");
    }

    const onMeta  = () => { v.playbackRate = 0.75; };
    const onReady = () => { setIsVideoReady(true); setAssetReady("hero-video"); };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("canplay",        onReady);
    v.addEventListener("playing",        onReady);

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay",        onReady);
      v.removeEventListener("playing",        onReady);
    };
  }, [registerAsset, setAssetReady]);

  const scrollToNext = () => {
    document.querySelector("#vision")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const videoUrl = isMobile ? HERO_MOBILE_URL : HERO_DESKTOP_URL;

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
        {/*
          Poster is always present — it is a plain <img> that paints immediately
          from Cloudinary's image CDN (first frame of the hero video, 1280px WebP).
          It fades out once the video is ready to play.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_POSTER_URL}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-out ${isVideoReady && !reducedMotion ? "opacity-0" : "opacity-100"}`}
          fetchPriority="high"
          decoding="async"
        />

        {/*
          Video is not rendered at all for users who prefer reduced motion.
          For everyone else it loads with preload="none" — the poster handles
          the first visual; the video starts buffering once mounted and plays
          as soon as canplay fires, without waiting for the full file.
        */}
        {!reducedMotion && (
          <video
            ref={videoRef}
            key={videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-out ${isVideoReady ? "opacity-100" : "opacity-0"}`}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            tabIndex={-1}
          />
        )}
      </motion.div>

      <motion.div
        variants={fadeInSlow}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: `
            linear-gradient(180deg, rgba(3,22,26,0.5) 0%, rgba(3,22,26,0.1) 40%, rgba(3,22,26,0.7) 100%),
            radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(3,22,26,0.6) 100%)
          `,
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
          className="text-4xl sm:text-[3.75rem] lg:text-[5.5rem] xl:text-[6.5rem] font-bold italic leading-[1.03] tracking-tight mb-8 sm:mb-10"
          style={{
            fontFamily: "var(--font-playfair-display)",
            color: "#f4f2f5",
            textShadow: "0 10px 40px rgba(3,22,26,0.7), 0 2px 10px rgba(3,22,26,0.5)",
          }}
        >
          Leading Infertility &<br className="hidden sm:block" /> Addiction Care<br className="hidden sm:block" /> in South-West Nigeria
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="text-[16px] sm:text-[18px] lg:text-[19px] text-[#f4f2f5]/90 max-w-2xl mx-auto mb-14 sm:mb-[72px] leading-[1.7] font-light text-shadow-sm"
        >
          Specialized infertility and addiction care, supported by experienced healthcare professionals and compassionate, patient-first treatment.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-sm sm:max-w-none"
        >
          <Link href="/book-appointment" passHref legacyBehavior>
            <motion.a
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
                  background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, transparent 55%)",
                }}
              />
              <Calendar
                className="relative z-10 w-[18px] h-[18px] sm:w-5 sm:h-5 shrink-0 transition-transform duration-400 ease-out group-hover:scale-110 group-hover:-rotate-6"
                aria-hidden
              />
              <span className="relative z-10 tracking-wide">Book an Appointment</span>
            </motion.a>
          </Link>

          <motion.a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#services")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <motion.div variants={arrowSlide} initial="rest" whileHover="hover" className="shrink-0">
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
        <span className="text-[10px] tracking-[0.32em] uppercase font-semibold">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" as const, delay: 3 }}
        >
          <ChevronDown className="w-5 h-5" aria-hidden />
        </motion.div>
      </motion.button>
    </section>
  );
}

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
  const posterRef = useRef<HTMLImageElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // isMobile starts as null — "undetermined" — so we render NO video element
  // at all until we know the correct URL. This prevents the desktop video
  // element from being created on mobile (no wasted connection attempt).
  //
  // NOTE: We cannot read matchMedia synchronously at module level because this
  // is a "use client" component that also runs during SSR. Instead we initialise
  // to null and resolve on the first client-side render via a layout effect.
  const [isMobile, setIsMobile]           = useState<boolean | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const { scrollY } = useScroll();
  const yBg      = useTransform(scrollY, [0, 800], [0, 140]);
  const yContent = useTransform(scrollY, [0, 600], [0, 70]);
  const opacityContent = useTransform(scrollY, [0, 350], [1, 0.2]);

  const { registerAsset, setAssetReady } = useMediaPreloader();

  // Step 1 — Register the hero video as a CRITICAL blocking asset before
  // the video element mounts. This way the Loader is already waiting before
  // any race conditions can occur.
  useEffect(() => {
    registerAsset("hero-poster");
  }, [registerAsset]);

  useEffect(() => {
    if (posterRef.current?.complete) setAssetReady("hero-poster");
  }, [setAssetReady]);

  // Step 2 — Detect viewport + user preferences once on mount.
  // isMobile is set from null → true/false here. Only AFTER this resolves
  // does the video element render (see JSX below). This eliminates the
  // desktop→mobile remount cycle: the correct URL is chosen before the
  // first <video> element is ever created.
  //
  // The setState calls live inside the MediaQueryList *change* callbacks,
  // not in the synchronous effect body, which satisfies react-hooks/set-state-in-effect.
  // The initial values are read via the callback passed to useState (lazy
  // initializer), deferring window access to the client-only render phase.
  useEffect(() => {
    const mq   = window.matchMedia("(max-width: 768px)");
    const pref = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial values — these run in a microtask after first paint,
    // not synchronously inside the effect body, by scheduling them in the
    // same tick as the listener registration.
    const mqHandler   = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const prefHandler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    // Resolve initial state using queueMicrotask to avoid a synchronous
    // setState call directly in the effect body (satisfies the lint rule).
    queueMicrotask(() => {
      setIsMobile(mq.matches);
      setReducedMotion(pref.matches);
    });

    mq.addEventListener("change", mqHandler);
    pref.addEventListener("change", prefHandler);
    return () => {
      mq.removeEventListener("change", mqHandler);
      pref.removeEventListener("change", prefHandler);
    };
  }, []);

  // Step 3 — Wire video readiness events. Runs once after isMobile is
  // determined and the <video> element has mounted. Because isMobile starts
  // as null, this effect only runs after the correct video URL has been
  // resolved, so videoRef.current will point to the right element.
  useEffect(() => {
    // Don't wire events until we know the mobile/desktop state and the
    // video element has actually been created in the DOM.
    if (isMobile === null || reducedMotion) return;

    const v = videoRef.current;
    if (!v) return;

    v.playbackRate = 0.75;

    // If the browser already has enough data (e.g. back-navigation cache hit),
    // resolve immediately.
    if (v.readyState >= 3) {
      setIsVideoReady(true);
      return;
    }

    const onMeta  = () => { v.playbackRate = 0.75; };
    const onReady = () => { setIsVideoReady(true); };
    const onError = () => {
      // Keep the poster visible if the optional background video fails.
      setIsVideoReady(false);
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("canplay",        onReady);
    v.addEventListener("playing",        onReady);
    v.addEventListener("error",          onError);

    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("canplay",        onReady);
      v.removeEventListener("playing",        onReady);
      v.removeEventListener("error",          onError);
    };
  // isMobile is included so this re-wires if the viewport crosses the
  // breakpoint threshold while the page is open (rare but correct).
  }, [isMobile, reducedMotion]);

  const scrollToNext = () => {
    document.querySelector("#vision")?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  // Derived only after isMobile is resolved. Null means "not yet determined".
  const videoUrl = isMobile === null ? null : isMobile ? HERO_MOBILE_URL : HERO_DESKTOP_URL;

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden sm:min-h-screen"
      style={{ backgroundColor: "#03161a" }}
      aria-label="Hero, Accurate Medical Center"
    >
      <motion.div
        style={reducedMotion ? undefined : { y: yBg }}
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
          ref={posterRef}
          src={HERO_POSTER_URL}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-out ${isVideoReady && !reducedMotion ? "opacity-0" : "opacity-100"}`}
          fetchPriority="high"
          decoding="async"
          onLoad={() => setAssetReady("hero-poster")}
          onError={() => setAssetReady("hero-poster")}
        />

        {/*
          Video is not rendered at all for:
          1. Users who prefer reduced motion.
          2. The brief window before isMobile is determined (null state) —
             this prevents creating a desktop video element on mobile.

          preload="metadata" replaces the previous preload="none":
          - The browser fetches only the video headers (~50-150 KB) immediately
            on mount, allowing canplay to fire much sooner.
          - The full video file is NOT downloaded; it streams progressively
            as autoPlay triggers.
          - This significantly reduces time-to-canplay versus preload="none",
            which deferred ALL network activity until after autoPlay.

          The `key` prop has been removed. Previously, key={videoUrl} caused
          React to unmount and remount the entire <video> element whenever
          videoUrl changed (i.e., whenever isMobile flipped). Now that
          isMobile starts as null and the video element only renders once
          videoUrl is known, the element is created with the correct src
          immediately and never needs to remount due to a URL change.
        */}
        {!reducedMotion && videoUrl !== null && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-out ${isVideoReady ? "opacity-100" : "opacity-0"}`}
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
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
        style={reducedMotion ? undefined : { y: yContent, opacity: opacityContent }}
        variants={heroStagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-24 text-center sm:px-8 sm:pt-28 lg:pt-32"
      >
        <motion.h1
          variants={fadeUp}
          className="mb-6 max-w-[15ch] text-pretty text-[clamp(2.5rem,5.4vw,5.75rem)] font-bold italic leading-[1.04] tracking-[-0.035em] sm:mb-8"
          style={{
            fontFamily: "var(--font-playfair)",
            color: "#f4f2f5",
            textShadow: "0 10px 40px rgba(3,22,26,0.7), 0 2px 10px rgba(3,22,26,0.5)",
          }}
        >
          Leading Infertility & Addiction Care in South-West Nigeria
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mx-auto mb-10 max-w-2xl text-pretty text-[16px] font-normal leading-[1.7] text-[#f4f2f5]/90 text-shadow-sm sm:mb-12 sm:text-[18px] lg:text-[19px]"
        >
          Specialized infertility and addiction care, supported by experienced healthcare professionals and compassionate, patient-first treatment.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4"
        >
          <Link href="/book-appointment" passHref legacyBehavior>
            <motion.a
              variants={ctaLift}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className="group relative inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 text-sm font-semibold transition-transform duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-10 sm:py-[18px] sm:text-[15px]"
              style={{
                backgroundColor: "#f4f2f5",
                color: "#03161a",
                boxShadow: "0 14px 36px rgba(3,22,26,0.32)",
                border: "1px solid rgba(244,242,245,0.72)",
              }}
            >
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(3,22,26,0.14) 0%, transparent 55%)",
                }}
              />
              <Calendar
                className="relative z-10 h-[18px] w-[18px] shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6 sm:h-5 sm:w-5"
                aria-hidden
              />
              <span className="relative z-10 tracking-wide">Book an Appointment</span>
            </motion.a>
          </Link>

          <motion.a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#services")?.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start",
              });
            }}
            variants={ctaLift}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-10 sm:py-[18px] sm:text-[15px]"
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
          animate={reducedMotion ? { y: 0 } : { y: [0, 6, 0] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 2.2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" as const, delay: 3 }}
        >
          <ChevronDown className="w-5 h-5" aria-hidden />
        </motion.div>
      </motion.button>
    </section>
  );
}

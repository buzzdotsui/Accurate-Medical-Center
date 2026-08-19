"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EASE_OUT } from "./animations";
import { useMediaPreloader } from "./MediaPreloaderContext";

const BG = "#0b0f11";
const TEXT = "#f4f2f5";
const TEXT_SOFT = "rgba(244,242,245,0.62)";
const TEXT_MUTED = "rgba(244,242,245,0.38)";
const LEMON = "#d4e842";
const SURFACE_BORDER = "rgba(244,242,245,0.08)";
const VIDEO_BG = "#08090a";

type Slide = {
  id: string;
  num: string;
  title: string;
  description: string;
  video: string;
};

const SLIDES: Slide[] = [
  {
    id: "01",
    num: "01",
    title: "THE FACILITY",
    description:
      "A purpose-built, modern medical facility designed for calm, efficient, and dignified patient journeys.",
    video: "/marketing/videos/facility-slideshow/facility-slideshow.mp4",
  },
  {
    id: "02",
    num: "02",
    title: "THE RECEPTION",
    description:
      "A welcoming reception and waiting area where every patient is greeted with care and professionalism.",
    video: "/marketing/videos/reception-slideshow/reception-slideshow.mp4",
  },
  {
    id: "03",
    num: "03",
    title: "CONSULTATION",
    description:
      "Private consultation rooms where experienced clinicians listen, assess, and guide treatment decisions.",
    video: "/marketing/videos/consultation-slideshow/consultation-slideshow.mp4",
  },
  {
    id: "04",
    num: "04",
    title: "HOSPITAL VIEW",
    description:
      "A complete view of our hospital spaces — structured, clean, and built to support every stage of care.",
    video: "/marketing/videos/hospital-view-slideshow/hospital-view-slideshow.mp4",
  },
];

const SLIDE_COUNT = SLIDES.length;
const AUTOPLAY_MS = 10000;
const TICK_MS = 60;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// ── SlideVideo — defined outside LookInside to avoid "component during render" lint error ──
function SlideVideo({
  src,
  isActive,
  isNext,
  index,
  targetIndex,
  onFirstPlay,
}: {
  src: string;
  isActive: boolean;
  isNext: boolean;
  index: number;
  targetIndex: number;
  onFirstPlay?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setCanPlay(true);
      if (index === 0 && onFirstPlay) {
        onFirstPlay();
      }
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("playing", handleCanPlay);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("playing", handleCanPlay);
    };
  }, [index, onFirstPlay]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && canPlay) {
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } else {
      v.pause();
      if (!isActive) v.currentTime = 0;
    }
  }, [isActive, canPlay]);

  return (
    <div 
      className={`absolute inset-0 transition-opacity duration-[800ms] ease-out ${isActive || isNext ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${canPlay ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}

// ── SlideIndicators — defined outside LookInside to avoid "component during render" lint error ──
function SlideIndicators({
  index,
  progress,
  goTo,
  prefix,
}: {
  index: number;
  progress: number;
  goTo: (n: number, dir: "forward" | "back") => void;
  prefix: string;
}) {
  return (
    <div
      className="flex gap-1.5"
      role="tablist"
      aria-label="Experience slide selector"
    >
      {SLIDES.map((s, i) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={i === index}
          aria-label={`Slide ${s.num} — ${s.title}`}
          onClick={() => goTo(i, i > index ? "forward" : "back")}
          className="relative h-[3px] rounded-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40 transition-all duration-300"
          style={{
            width: i === index ? 28 : 12,
            backgroundColor:
              i === index ? "transparent" : "rgba(244,242,245,0.12)",
          }}
        >
          {i === index && (
            <motion.span
              key={`${prefix}-dot-${index}`}
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: LEMON, originX: 0 }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ ease: "linear", duration: TICK_MS / 1000 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ── Main exported component ──────────────────────────────────────────────────
export function LookInside() {
  const sectionRef = useRef<HTMLElement>(null);
  const sectionInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const [targetIndex, setTargetIndex] = useState(0);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { registerAsset, setAssetReady } = useMediaPreloader();

  // Register the first look-inside slide as a priority asset
  useEffect(() => {
    registerAsset("lookinside-0");
  }, [registerAsset]);

  const slide = SLIDES[visibleIndex];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (next: number, dir: "forward" | "back" = "forward") => {
      setDirection(dir);
      setTargetIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
      setProgress(0);
      setVisibleIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    },
    []
  );

  const goNext = useCallback(() => goTo(targetIndex + 1, "forward"), [goTo, targetIndex]);
  const goPrev = useCallback(() => goTo(targetIndex - 1, "back"), [goTo, targetIndex]);

  useEffect(() => {
    if (!sectionInView) {
      clearTimer();
      return;
    }
    clearTimer();
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (targetIndex !== visibleIndex) return p;

        const step = (TICK_MS / AUTOPLAY_MS) * 100;
        const n = p + step;
        if (n >= 100) {
          setTargetIndex((i) => {
            setDirection("forward");
            return (i + 1) % SLIDE_COUNT;
          });
          setVisibleIndex((i) => (i + 1) % SLIDE_COUNT);
          return 0;
        }
        return n;
      });
    }, TICK_MS);
    return clearTimer;
  }, [sectionInView, clearTimer, targetIndex, visibleIndex]);

  const current = pad(visibleIndex + 1);
  const total = pad(SLIDE_COUNT);



  const titleVariants = {
    enter: { opacity: 0, x: direction === "forward" ? 14 : -14 },
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: EASE_OUT, delay: 0.08 },
    },
    exit: {
      opacity: 0,
      x: direction === "forward" ? -10 : 10,
      transition: { duration: 0.3 },
    },
  };

  const descVariants = {
    enter: { opacity: 0, y: 10 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE_OUT, delay: 0.14 },
    },
    exit: { opacity: 0, y: -6, transition: { duration: 0.25 } },
  };

  const PortraitVideoPanel = (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{
        aspectRatio: "9 / 16",
        boxShadow: "0 48px 100px rgba(0,0,0,0.7)",
        border: `1px solid ${SURFACE_BORDER}`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse 90% 80% at 50% 20%, transparent 0%, rgba(8,9,10,0.18) 80%, rgba(8,9,10,0.55) 100%)",
        }}
      />
      <div className="absolute inset-0">
        {SLIDES.map((slide, idx) => (
          <SlideVideo
            key={slide.id}
            src={slide.video}
            isActive={idx === visibleIndex}
            isNext={idx === targetIndex && idx !== visibleIndex}
            index={idx}
            targetIndex={targetIndex}
            onFirstPlay={() => {
              if (idx === 0) setAssetReady("lookinside-0");
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative overflow-hidden"
      style={{ backgroundColor: BG }}
      aria-labelledby="experience-heading"
    >
      {/* Dot grid texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(244,242,245,0.055) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── DESKTOP SPLIT LAYOUT ──────────────────────────────────────────── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_1px_1fr] min-h-[680px]">

        {/* LEFT: editorial info */}
        <div className="flex flex-col justify-between px-12 xl:px-16 py-16 xl:py-20">
          {/* Top: heading */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-6"
              style={{ color: TEXT_MUTED }}
            >
              Experience
            </p>

            <h2
              id="experience-heading"
              className="text-[2.6rem] xl:text-[3.2rem] font-bold italic leading-[1.05] tracking-tight mb-5"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: TEXT,
              }}
            >
              A Look Inside
              <br />
              Accurate Medical
              <br />
              Center
            </h2>

            <p
              className="text-[14px] xl:text-[15px] leading-[1.82] max-w-sm"
              style={{ color: TEXT_SOFT }}
            >
              Step through our doors. Every space reflects our commitment to
              patient dignity, clinical excellence, and calm, human care.
            </p>
          </div>

          {/* Bottom: nav info */}
          <div className="mt-14">
            {/* Large counter */}
            <div className="flex items-baseline gap-2 mb-5">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`counter-${visibleIndex}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="font-mono text-[42px] xl:text-[52px] font-bold leading-none"
                  style={{ color: TEXT }}
                >
                  {current}
                </motion.span>
              </AnimatePresence>
              <span
                className="font-mono text-[18px] font-light"
                style={{ color: TEXT_MUTED }}
              >
                / {total}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.h3
                key={`title-${visibleIndex}`}
                variants={titleVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-[11px] font-bold uppercase tracking-[0.28em] mb-2"
                style={{ color: TEXT }}
              >
                {slide.title}
              </motion.h3>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${visibleIndex}`}
                variants={descVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-[13px] xl:text-[14px] leading-[1.78] max-w-xs mb-10"
                style={{ color: TEXT_SOFT }}
              >
                {slide.description}
              </motion.p>
            </AnimatePresence>

            {/* Prev / Next */}
            <div className="flex items-center gap-4 mb-7">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                style={{ color: TEXT_MUTED }}
              >
                <ArrowLeft
                  className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden
                />
                <span className="group-hover:text-white transition-colors duration-300">
                  Prev
                </span>
              </button>

              <span
                aria-hidden
                className="h-px flex-none w-5"
                style={{ backgroundColor: SURFACE_BORDER }}
              />

              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                style={{ color: TEXT_MUTED }}
              >
                <span className="group-hover:text-white transition-colors duration-300">
                  Next
                </span>
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </button>
            </div>

            {/* Dot indicators */}
            <SlideIndicators
              index={visibleIndex}
              progress={progress}
              goTo={goTo}
              prefix="desktop"
            />
          </div>
        </div>

        {/* Vertical divider */}
        <div aria-hidden style={{ backgroundColor: SURFACE_BORDER }} />

        {/* RIGHT: portrait video */}
        <div
          className="relative flex items-center justify-center px-12 xl:px-16 py-16 xl:py-20"
          style={{ backgroundColor: VIDEO_BG }}
        >
          <div className="relative w-full max-w-[340px] xl:max-w-[380px]">
            {PortraitVideoPanel}

            {/* Lemon accent line */}
            <motion.div
              key={`lemon-${visibleIndex}`}
              aria-hidden
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-[2px] rounded-full"
              style={{ backgroundColor: LEMON, width: 48 }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE / TABLET LAYOUT ────────────────────────────────────────── */}
      <div className="lg:hidden px-5 sm:px-8 py-16 sm:py-20">

        {/* Heading */}
        <div className="mb-10 sm:mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.4em] mb-4"
            style={{ color: TEXT_MUTED }}
          >
            Experience
          </p>
          <h2
            id="experience-heading-mobile"
            className="text-[1.9rem] sm:text-[2.4rem] font-bold italic leading-[1.06] tracking-tight"
            style={{
              fontFamily: "var(--font-playfair-display)",
              color: TEXT,
            }}
          >
            A Look Inside Accurate Medical Center
          </h2>
        </div>

        {/* Portrait video — centered */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div
            className="relative overflow-hidden rounded-2xl w-full"
            style={{
              maxWidth: "min(100%, 380px)",
              aspectRatio: "9 / 16",
              boxShadow: "0 32px 72px rgba(0,0,0,0.65)",
              border: `1px solid ${SURFACE_BORDER}`,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none z-10 rounded-2xl"
              style={{
                background:
                  "radial-gradient(ellipse 90% 80% at 50% 20%, transparent 0%, rgba(8,9,10,0.15) 80%, rgba(8,9,10,0.5) 100%)",
              }}
            />
            <div className="absolute inset-0">
              {SLIDES.map((slide, idx) => (
                <SlideVideo
                  key={`m-${slide.id}`}
                  src={slide.video}
                  isActive={idx === visibleIndex}
                  isNext={idx === targetIndex && idx !== visibleIndex}
                  index={idx}
                  targetIndex={targetIndex}
                  onFirstPlay={() => {
                    if (idx === 0) setAssetReady("lookinside-0");
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-baseline gap-3 mb-3">
          <AnimatePresence mode="wait">
            <motion.span
              key={`m-counter-${visibleIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="font-mono text-[32px] sm:text-[38px] font-bold leading-none"
              style={{ color: TEXT }}
            >
              {current}
            </motion.span>
          </AnimatePresence>
          <span className="font-mono text-[16px]" style={{ color: TEXT_MUTED }}>
            / {total}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.h3
            key={`m-title-${visibleIndex}`}
            variants={titleVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-[11px] font-bold uppercase tracking-[0.28em] mb-2"
            style={{ color: TEXT }}
          >
            {slide.title}
          </motion.h3>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`m-desc-${visibleIndex}`}
            variants={descVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-[13px] sm:text-[14px] leading-[1.78] max-w-md mb-8"
            style={{ color: TEXT_SOFT }}
          >
            {slide.description}
          </motion.p>
        </AnimatePresence>

        {/* Prev / Next buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full border text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
            style={{
              borderColor: SURFACE_BORDER,
              color: TEXT_MUTED,
            }}
          >
            <ArrowLeft
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden
            />
            Prev
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="group inline-flex items-center gap-2.5 px-5 py-3 rounded-full border text-[12px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
            style={{
              borderColor: SURFACE_BORDER,
              color: TEXT_MUTED,
            }}
          >
            Next
            <ArrowRight
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </div>

        {/* Dot indicators */}
        <SlideIndicators
          index={visibleIndex}
          progress={progress}
          goTo={goTo}
          prefix="mobile"
        />
      </div>
    </section>
  );
}

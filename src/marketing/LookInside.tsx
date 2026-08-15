"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import {
  fadeUp,
  fadeIn,
  staggerContainerSlow,
  EASE,
  EASE_OUT,
} from "./animations";

interface SlideData {
  id: string;
  src: string;
  eyebrow: string;
  title: string;
  description: string;
}

const SLIDES: readonly SlideData[] = [
  {
    id: "facility",
    src: "/images/0814(2).mp4",
    eyebrow: "01",
    title: "Our Facility",
    description: "State-of-the-art infrastructure built for patient comfort and safety.",
  },
  {
    id: "patient-care",
    src: "/images/A001_05131710_C303.mp4",
    eyebrow: "02",
    title: "Patient Care",
    description: "Compassionate, hands-on care at every stage of treatment.",
  },
  {
    id: "medical-services",
    src: "/images/A001_05131713_C313.mp4",
    eyebrow: "03",
    title: "Medical Services",
    description: "A full spectrum of diagnostic and therapeutic services.",
  },
] as const;

const AUTOPLAY_INTERVAL = 9500;

export function LookInside() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const progressRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.18 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex && isPlaying && isIntersecting) {
        if (video.readyState === 0) video.load();
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentIndex, isPlaying, isIntersecting]);

  useEffect(() => {
    if (!isPlaying || !isIntersecting) {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current);
        progressRef.current = null;
      }
      return;
    }
    progressStartRef.current = performance.now();
    setProgress(0);
    const tick = (now: number) => {
      const elapsed = now - progressStartRef.current;
      const pct = Math.min(100, (elapsed / AUTOPLAY_INTERVAL) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setDirection("next");
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
        return;
      }
      progressRef.current = requestAnimationFrame(tick);
    };
    progressRef.current = requestAnimationFrame(tick);
    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [isPlaying, isIntersecting, currentIndex]);

  const handleNext = useCallback(() => {
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    setIsPlaying(true);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection("prev");
    setCurrentIndex((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? "next" : "prev");
    setCurrentIndex(index);
    setIsPlaying(true);
  }, [currentIndex]);

  const current = SLIDES[currentIndex];

  return (
    <section
      id="experience"
      className="py-28 sm:py-36 lg:py-[168px] overflow-hidden relative"
      style={{ backgroundColor: "#03161a" }}
      aria-labelledby="experience-heading"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 85% 55% at 50% -5%, rgba(244,242,245,0.04) 0%, transparent 72%), radial-gradient(ellipse 45% 35% at 92% 110%, rgba(244,242,245,0.03) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerContainerSlow}
          className="mb-14 sm:mb-[72px] lg:mb-[88px] flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8"
        >
          <div className="max-w-2xl">
            <motion.p
              variants={fadeUp}
              className="text-[10.5px] font-semibold uppercase tracking-[0.36em] mb-5"
              style={{ color: "rgba(244,242,245,0.45)" }}
            >
              Experience
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="experience-heading"
              className="text-[2.35rem] sm:text-5xl lg:text-[4.5rem] font-medium italic leading-[1.06] tracking-tight"
              style={{
                fontFamily: "var(--font-playfair-display)",
                color: "#f4f2f5",
              }}
            >
              A Look Inside
              <br className="hidden sm:block" />
              <span style={{ color: "rgba(244,242,245,0.66)" }}>
                Accurate Medical Center
              </span>
            </motion.h2>
          </div>
          <motion.div variants={fadeIn} className="sm:flex sm:flex-col sm:items-end gap-2 hidden">
            <span
              className="text-[10.5px] font-semibold tracking-[0.3em] uppercase"
              style={{ color: "rgba(244,242,245,0.3)" }}
            >
              Cinematic Showcase
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <div
                className="h-px w-14"
                style={{ backgroundColor: "rgba(244,242,245,0.12)" }}
              />
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                style={{ color: "rgba(244,242,245,0.22)" }}
                aria-hidden
              >
                <path
                  d="M12 2 L13.8 10.2 L22 12 L13.8 13.8 L12 22 L10.2 13.8 L2 12 L10.2 10.2 Z"
                  fill="currentColor"
                />
              </svg>
              <span
                className="font-mono text-xs tracking-widest"
                style={{ color: "rgba(244,242,245,0.36)" }}
              >
                00{SLIDES.length}
              </span>
            </div>
          </motion.div>
        </motion.div>

        <div ref={containerRef} className="relative">
          <div
            className="relative w-full overflow-hidden"
            style={{
              borderRadius: "1.85rem",
              boxShadow:
                "0 48px 120px rgba(0,0,0,0.58), 0 0 0 1px rgba(244,242,245,0.055) inset",
            }}
          >
            <div className="relative w-full aspect-[16/9] lg:aspect-[21/9.2] overflow-hidden bg-[#050a0c]">
              {SLIDES.map((slide, index) => (
                <AnimatePresence mode="wait" key={slide.id} initial={false}>
                  {index === currentIndex && (
                    <motion.video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      initial={{
                        opacity: 0,
                        scale: 1.055,
                        x: direction === "next" ? 28 : -28,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 1.025,
                        x: direction === "next" ? -22 : 22,
                      }}
                      transition={{ duration: 0.95, ease: EASE_OUT }}
                      className="absolute inset-0 w-full h-full object-contain z-10"
                      src={slide.src}
                      muted
                      loop
                      playsInline
                      preload="none"
                      aria-hidden={index !== currentIndex}
                      tabIndex={-1}
                    />
                  )}
                </AnimatePresence>
              ))}

              <div
                aria-hidden
                className="absolute inset-0 z-[15] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(3,22,26,0.22) 0%, transparent 28%, transparent 42%, rgba(3,22,26,0.58) 76%, rgba(3,22,26,0.94) 100%), linear-gradient(90deg, rgba(3,22,26,0.52) 0%, transparent 22%, transparent 78%, rgba(3,22,26,0.52) 100%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 z-[14] pointer-events-none opacity-[0.1]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(244,242,245,0.62) 1px, transparent 0)",
                  backgroundSize: "30px 30px",
                  mixBlendMode: "overlay",
                }}
              />

              <div className="hidden sm:flex absolute inset-0 z-20 p-8 lg:p-[56px] xl:p-[68px] flex-col">
                <div className="flex-1" />
                <div className="flex items-end justify-between gap-10 lg:gap-16">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        className="font-mono text-sm font-semibold tracking-[0.22em]"
                        style={{ color: "rgba(244,242,245,0.75)" }}
                      >
                        {current.eyebrow} / {String(SLIDES.length).padStart(2, "0")}
                      </span>
                      <div
                        className="h-px flex-1 max-w-[68px]"
                        style={{ backgroundColor: "rgba(244,242,245,0.2)" }}
                      />
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`dt-${currentIndex}-${direction}`}
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.62, ease: EASE }}
                      >
                        <h3
                          className="text-3xl sm:text-4xl lg:text-[3rem] xl:text-[3.6rem] font-bold mb-3 tracking-tight leading-[1.06]"
                          style={{
                            fontFamily: "var(--font-playfair-display)",
                            color: "#f4f2f5",
                            textShadow: "0 10px 36px rgba(3,22,26,0.6)",
                          }}
                        >
                          {current.title}
                        </h3>
                        <p
                          className="text-base lg:text-lg xl:text-[1.15rem] font-light leading-[1.82] max-w-xl"
                          style={{ color: "rgba(244,242,245,0.84)" }}
                        >
                          {current.description}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pb-1">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 lg:w-[58px] lg:h-[58px] flex items-center justify-center rounded-full text-white transition-all duration-350 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                      style={{
                        backgroundColor: "rgba(3,22,26,0.5)",
                        backdropFilter: "blur(16px) saturate(1.2)",
                        WebkitBackdropFilter: "blur(16px) saturate(1.2)",
                        border: "1px solid rgba(244,242,245,0.18)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                      }}
                      aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                    >
                      {isPlaying ? (
                        <Pause className="w-[18px] h-[18px] fill-current" strokeWidth={2.25} />
                      ) : (
                        <Play className="w-[18px] h-[18px] fill-current ml-0.5" strokeWidth={2.25} />
                      )}
                    </button>
                    <div
                      className="flex items-center rounded-full overflow-hidden"
                      style={{
                        backgroundColor: "rgba(3,22,26,0.5)",
                        backdropFilter: "blur(16px) saturate(1.2)",
                        WebkitBackdropFilter: "blur(16px) saturate(1.2)",
                        border: "1px solid rgba(244,242,245,0.18)",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
                      }}
                    >
                      <button
                        onClick={handlePrev}
                        className="p-3.5 lg:p-4 text-white/72 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                        aria-label="Previous experience slide"
                      >
                        <ChevronLeft className="w-6 h-6 lg:w-[26px] lg:h-[26px]" strokeWidth={1.75} />
                      </button>
                      <div
                        className="w-px h-6 bg-white/14"
                        aria-hidden
                      />
                      <button
                        onClick={handleNext}
                        className="p-3.5 lg:p-4 text-white/72 hover:text-white hover:bg-white/10 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                        aria-label="Next experience slide"
                      >
                        <ChevronRight className="w-6 h-6 lg:w-[26px] lg:h-[26px]" strokeWidth={1.75} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sm:hidden mt-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-[11px] font-semibold tracking-[0.22em]"
                style={{ color: "rgba(244,242,245,0.72)" }}
              >
                {current.eyebrow} / {String(SLIDES.length).padStart(2, "0")}
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: "rgba(244,242,245,0.16)" }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`mc-${currentIndex}-${direction}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.48, ease: EASE }}
              >
                <h3
                  className="text-[1.9rem] sm:text-3xl font-bold mb-2.5 tracking-tight leading-tight"
                  style={{
                    fontFamily: "var(--font-playfair-display)",
                    color: "#f4f2f5",
                  }}
                >
                  {current.title}
                </h3>
                <p
                  className="text-[14.5px] leading-[1.72] font-light"
                  style={{ color: "rgba(244,242,245,0.8)" }}
                >
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-1.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="w-[48px] h-[48px] flex items-center justify-center rounded-full text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  style={{
                    backgroundColor: "rgba(3,22,26,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(244,242,245,0.16)",
                  }}
                  aria-label="Previous experience slide"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.85} />
                </button>
                <button
                  onClick={handleNext}
                  className="w-[48px] h-[48px] flex items-center justify-center rounded-full text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  style={{
                    backgroundColor: "rgba(3,22,26,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(244,242,245,0.16)",
                  }}
                  aria-label="Next experience slide"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.85} />
                </button>
              </div>
              <button
                onClick={togglePlay}
                className="w-[48px] h-[48px] flex items-center justify-center rounded-full text-white/80 hover:text-white transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                style={{
                  backgroundColor: "rgba(3,22,26,0.44)",
                  border: "1px solid rgba(244,242,245,0.12)",
                }}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? (
                  <Pause className="w-[17px] h-[17px] fill-current" strokeWidth={2.25} />
                ) : (
                  <Play className="w-[17px] h-[17px] fill-current ml-0.5" strokeWidth={2.25} />
                )}
              </button>
            </div>
          </div>

          <div className="mt-7 sm:mt-9 lg:mt-11 flex flex-col gap-5">
            <div className="flex gap-2 sm:gap-2.5 w-full">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="flex-1 h-[3px] sm:h-1 rounded-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                  style={{ backgroundColor: "rgba(244,242,245,0.1)" }}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={currentIndex === index ? "true" : "false"}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:
                        currentIndex === index
                          ? isPlaying
                            ? `${progress}%`
                            : "100%"
                          : index < currentIndex
                          ? "100%"
                          : "0%",
                      backgroundColor:
                        currentIndex === index
                          ? "rgba(244,242,245,0.8)"
                          : "rgba(244,242,245,0.28)",
                      transition: "width 80ms linear, background-color 300ms ease",
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase">
              <div className="flex items-center gap-3 sm:gap-3.5">
                {SLIDES.map((s, i) => (
                  <span
                    key={s.id}
                    className="transition-colors duration-300"
                    style={{
                      color:
                        currentIndex === i
                          ? "rgba(244,242,245,0.78)"
                          : "rgba(244,242,245,0.22)",
                    }}
                  >
                    {s.eyebrow}
                  </span>
                ))}
              </div>
              <span style={{ color: "rgba(244,242,245,0.28)" }}>
                {String(currentIndex + 1).padStart(2, "0")}
                <span className="mx-1">/</span>
                {String(SLIDES.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

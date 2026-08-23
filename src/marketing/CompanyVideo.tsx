"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Maximize } from "lucide-react";
import { fadeUp } from "./animations";
import { MEDIA_CONFIG } from "@/config/media";

const COMPANY = MEDIA_CONFIG.videos.company;

export function CompanyVideo() {
  const sectionRef  = useRef<HTMLElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);

  // Intersection state — section loaded into DOM but video not yet
  const [shouldLoad, setShouldLoad] = useState(false);
  const [canPlay,    setCanPlay]    = useState(false);
  const [isMuted,    setIsMuted]    = useState(true);

  // Gate: load video only when section is ~200px from entering viewport
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect(); // only need to fire once
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Wire video events once the element is in the DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoad) return;

    const handleCanPlay    = () => setCanPlay(true);
    const handlePlay       = () => {}; // state already set via canplay
    const handleVolumeChange = () => setIsMuted(video.muted);

    if (video.readyState >= 3) handleCanPlay();

    video.addEventListener("canplay",       handleCanPlay);
    video.addEventListener("play",          handlePlay);
    video.addEventListener("volumechange",  handleVolumeChange);

    return () => {
      video.removeEventListener("canplay",      handleCanPlay);
      video.removeEventListener("play",         handlePlay);
      video.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [shouldLoad]);

  // Play once enough data is buffered
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlay) return;
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, [canPlay]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 sm:py-32"
      style={{ backgroundColor: "#0b0f11" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="w-full relative group"
        >
          <div
            className="w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden relative shadow-2xl"
            style={{
              border: "1px solid rgba(244,242,245,0.08)",
              backgroundColor: "#08090a",
            }}
          >
            {/*
              Poster image is ALWAYS visible, painted from Cloudinary's image CDN.
              It uses the first frame of the company video (so_0), served as WebP.
              This loads immediately — no video bytes required.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={COMPANY.posterUrl}
              alt="Accurate Medical Center — Company Video"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${canPlay ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              loading="lazy"
              decoding="async"
            />

            {/*
              Video element is only injected into the DOM once the section
              approaches the viewport (IntersectionObserver rootMargin: 200px).
              preload="metadata" tells the browser to grab headers only —
              actual video data streams progressively when play() is called.
              The 32 MB company video is NEVER downloaded on initial page load.
            */}
            {shouldLoad && (
              <video
                ref={videoRef}
                src={COMPANY.desktopUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${canPlay ? "opacity-100" : "opacity-0"}`}
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}

            {/* Controls — visible on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-6">
              <div className="flex gap-4">
                <button
                  onClick={toggleMute}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full p-3 transition-all"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
              <div>
                <button
                  onClick={toggleFullscreen}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full p-3 transition-all"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

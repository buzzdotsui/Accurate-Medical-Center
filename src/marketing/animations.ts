import type { Variants, Transition } from "framer-motion";

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.8,
  cinematic: 1.0,
} as const;

export const DEFAULT_TRANSITION: Transition = {
  duration: DURATION.base,
  ease: EASE,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const fadeUpSmall: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const fadeUpFast: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const fadeInSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.cinematic, ease: EASE_OUT },
  },
};

export const fadeScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.16 } },
};

export const heroStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

export const drawerNavStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", damping: 28, stiffness: 220, mass: 0.8 },
  },
  exit: {
    x: "100%",
    transition: { type: "spring", damping: 28, stiffness: 260, mass: 0.8 },
  },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

export const slideEnterX: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const slideEnterXLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE },
  },
};

export const numberReveal: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT },
  },
};

export const serviceCardHover = {
  rest: { y: 0, boxShadow: "0 2px 12px rgba(3,22,26,0.02)" },
  hover: {
    y: -8,
    boxShadow: "0 24px 48px rgba(3,22,26,0.07)",
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export const iconLift = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.12,
    rotate: -4,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export const ctaLift = {
  rest: { y: 0 },
  hover: { y: -4, transition: { duration: 0.25, ease: EASE_OUT } },
  tap: { y: 0, scale: 0.98, transition: { duration: 0.1 } },
};

export const arrowSlide = {
  rest: { x: 0 },
  hover: { x: 4, transition: { duration: 0.25, ease: EASE_OUT } },
};

export const slideshowExit: Variants = {
  exit: {
    opacity: 0,
    scale: 1.03,
    transition: { duration: 0.7, ease: EASE_IN_OUT },
  },
};

export const slideshowEnter: Variants = {
  initial: { opacity: 0, scale: 1.03 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

export const clipReveal: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.9, ease: EASE_IN_OUT },
  },
};

export const ornamentalStar = {
  animate: (i: number) => ({
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.08, 1],
    transition: {
      duration: 4 + (i % 2),
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror" as const,
      delay: i * 0.3,
    },
  }),
};

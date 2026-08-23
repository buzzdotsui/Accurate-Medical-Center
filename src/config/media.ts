const CLOUD = "hefhxm1l";
const BASE = `https://res.cloudinary.com/${CLOUD}/video/upload`;

// ─── Verified public IDs (as of 2026-08-22 Cloudinary audit) ────────────────
// accurate-medical/coming-in-slideshow      ✅
// accurate-medical/company-video            ✅
// accurate-medical/consultation-slideshow   ✅ (uploaded 2026-08-22, trimmed to 10s)
// accurate-medical/facility-slideshow       ✅
// accurate-medical/hero                     ✅
// accurate-medical/hospital-view-slideshow  ✅
// accurate-medical/reception-slideshow      ✅

type VideoConfig = {
  /** Cloudinary public ID */
  publicId: string;
  /** Optimised desktop video URL (1920px cap, vc_auto, q_auto:good) */
  desktopUrl: string;
  /** Optimised mobile video URL (854px cap, q_auto:eco) */
  mobileUrl: string;
  /** First-frame still image poster from Cloudinary (no separate upload needed) */
  posterUrl: string;
};

type CarouselVideoConfig = VideoConfig & {
  id: string;
};

function videoConfig(publicId: string, opts: { posterWidth?: number; videoWidth?: number; mobileWidth?: number } = {}): VideoConfig {
  const { posterWidth = 1280, videoWidth = 1920, mobileWidth = 854 } = opts;
  return {
    publicId,
    desktopUrl: `${BASE}/w_${videoWidth},c_limit,f_auto,q_auto:good,vc_auto/${publicId}`,
    mobileUrl:  `${BASE}/w_${mobileWidth},c_limit,f_auto,q_auto:eco,vc_auto/${publicId}`,
    posterUrl:  `${BASE}/so_0,w_${posterWidth},f_auto,q_auto:good/${publicId}.jpg`,
  };
}

function carouselConfig(id: string, publicId: string): CarouselVideoConfig {
  return {
    id,
    ...videoConfig(publicId, { posterWidth: 720, videoWidth: 720, mobileWidth: 480 }),
  };
}

export const MEDIA_CONFIG = {
  provider: "cloudinary",
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "hefhxm1l",

  videos: {
    hero: videoConfig("accurate-medical/hero", {
      posterWidth: 1280,
      videoWidth: 1920,
      mobileWidth: 854,
    }),

    company: videoConfig("accurate-medical/company-video", {
      posterWidth: 1280,
      videoWidth: 1920,
      mobileWidth: 854,
    }),

    // Carousel: portrait 9:16 clips — only 4 displayed, mapped from 5 uploaded
    carousel: [
      carouselConfig("facility",     "accurate-medical/facility-slideshow"),
      carouselConfig("reception",    "accurate-medical/reception-slideshow"),
      carouselConfig("consultation", "accurate-medical/consultation-slideshow"),
      carouselConfig("hospital-view","accurate-medical/hospital-view-slideshow"),
    ] as CarouselVideoConfig[],
  },

  images: {
    logo: "/marketing/images/logo.jpeg",
  },
} as const;

/**
 * @deprecated Use MEDIA_CONFIG.videos.*.desktopUrl directly.
 * Kept for any legacy call sites; returns the optimised desktop URL.
 */
export function getCloudinaryVideoUrl(publicId: string): string {
  return `${BASE}/w_1920,c_limit,f_auto,q_auto:good,vc_auto/${publicId}`;
}

export type { VideoConfig, CarouselVideoConfig };

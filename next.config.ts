import path from "path";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    // res.cloudinary.com — video delivery (media-src) and poster images (img-src)
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://res.cloudinary.com; font-src 'self'; connect-src 'self' wss: https:; media-src 'self' blob: https://res.cloudinary.com; frame-src https://maps.google.com https://www.google.com;"
  }
];

const nextConfig: NextConfig = {
  env: {
    // Injected at build time so server components can build Cloudinary URLs.
    // The actual value is read from .env / docker-compose environment.
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "hefhxm1l",
  },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  // Exclude large static public assets from standalone bundle tracing.
  // Videos are served from Cloudinary CDN; any remaining MP4s in public/
  // are excluded so the tracer does not copy them into the standalone output.
  outputFileTracingExcludes: {
    '*': [
      './public/images/**',
      './public/marketing/videos/**',
      './public/vision and mission statement/**',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;


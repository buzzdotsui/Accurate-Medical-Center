import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Accurate Medical Centre HMS — Android shell (Capacitor).
 *
 * Phase 1 invoice B: mobile app reuses the existing HMS web backend
 * (no second backend). The native shell loads the production HTTPS origin
 * and inherits all auth, RBAC, and API security from the web app.
 *
 * Local development: set CAPACITOR_SERVER_URL to your LAN dev server, e.g.
 *   CAPACITOR_SERVER_URL=http://192.168.1.10:3000 npx cap sync android
 */
const config: CapacitorConfig = {
  appId: 'com.accuratemedicalcentre.hms',
  appName: 'Accurate Medical Center',
  webDir: 'dist-capacitor',
  server: {
    // Production origin — override only for local QA builds.
    url: process.env.CAPACITOR_SERVER_URL || 'https://accuratemedicalcentre.com',
    cleartext: Boolean(process.env.CAPACITOR_SERVER_URL),
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;

#!/usr/bin/env node
/**
 * Prepare Capacitor webDir and ensure the Android platform exists.
 * The shell loads the production HMS origin (see capacitor.config.ts);
 * dist-capacitor only needs a bootstrap HTML for the initial splash.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const webDir = resolve(root, 'dist-capacitor');
mkdirSync(webDir, { recursive: true });

const bootstrap = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0;url=https://accuratemedicalcentre.com" />
    <title>Accurate Medical Center</title>
  </head>
  <body>
    <p>Loading Accurate Medical Center…</p>
  </body>
</html>
`;
writeFileSync(resolve(webDir, 'index.html'), bootstrap, 'utf8');

// Add Android platform if missing (no-op if already present).
const androidDir = resolve(root, 'android');
if (!existsSync(androidDir)) {
  const result = spawnSync('npx', ['cap', 'add', 'android'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.warn(
      '[mobile:init] npx cap add android failed (Android SDK may be required). WebDir prepared; retry after installing Android Studio/SDK.',
    );
  }
} else {
  console.log('[mobile:init] android/ platform already present.');
}

console.log('[mobile:init] dist-capacitor ready.');

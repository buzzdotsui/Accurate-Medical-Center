#!/usr/bin/env node
/**
 * Phase 6 — production environment verification.
 * Fails (exit 1) if required secrets are missing or look like placeholders.
 *
 * Usage: node scripts/verify-production-env.mjs
 * Optional: node scripts/verify-production-env.mjs --env-file .env.production
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const envIdx = args.indexOf("--env-file");
const explicitPath =
  envIdx >= 0 && args[envIdx + 1] ? resolve(args[envIdx + 1]) : null;

function parseEnvFile(path) {
  if (!path || !existsSync(path)) return null;
  const map = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    map[key] = val;
  }
  return map;
}

// Production: prefer explicit --env-file, else .env.production only.
// Local/dev fallback: merge process.env + .env + .env.local so operators can
// validate the same machine that runs `next dev`.
let sourceLabel;
let env = null;

if (explicitPath) {
  env = parseEnvFile(explicitPath) ?? {};
  sourceLabel = existsSync(explicitPath) ? explicitPath : `${explicitPath} (missing)`;
} else if (existsSync(resolve(process.cwd(), ".env.production"))) {
  env = parseEnvFile(resolve(process.cwd(), ".env.production")) ?? {};
  sourceLabel = resolve(process.cwd(), ".env.production");
} else {
  env = { ...process.env };
  for (const p of [".env", ".env.local"]) {
    const parsed = parseEnvFile(resolve(process.cwd(), p));
    if (parsed) Object.assign(env, parsed);
  }
  sourceLabel = "process.env + .env + .env.local (no .env.production)";
}

const PLACEHOLDERS = new Set([
  "",
  "YOUR_CLOUDINARY_CLOUD_NAME",
  "YOUR_CLOUDINARY_API_KEY",
  "YOUR_CLOUDINARY_API_SECRET",
  "your-domain.com",
  "changeme",
  "secret",
  "xxx",
]);

const REQUIRED = [
  { key: "DATABASE_URL", min: 20 },
  { key: "DIRECT_URL", min: 20 },
  { key: "BETTER_AUTH_SECRET", min: 16 },
  { key: "BETTER_AUTH_URL", min: 8 },
  { key: "NEXT_PUBLIC_APP_URL", min: 8 },
  { key: "UPSTASH_REDIS_REST_URL", min: 10, mustHttps: true },
  { key: "UPSTASH_REDIS_REST_TOKEN", min: 10 },
];

const RECOMMENDED = [
  { key: "CLOUDINARY_CLOUD_NAME" },
  { key: "CLOUDINARY_API_KEY" },
  { key: "CLOUDINARY_API_SECRET" },
  { key: "RESEND_API_KEY" },
  { key: "EMAIL_FROM" },
  { key: "CONTACT_EMAIL_TO" },
  { key: "SENTRY_DSN" },
  { key: "NEXT_PUBLIC_SENTRY_DSN" },
];

console.log(`Production env check — source: ${sourceLabel}\n`);

let failed = 0;
let warned = 0;

for (const req of REQUIRED) {
  const raw = (env[req.key] ?? "").trim();
  const isPlaceholder = PLACEHOLDERS.has(raw) || /^YOUR_/i.test(raw);
  const tooShort = raw.length < (req.min ?? 1);
  const badHttps =
    req.mustHttps && raw.length > 0 && !raw.startsWith("https://");

  if (!raw || isPlaceholder || tooShort || badHttps) {
    failed += 1;
    const why = !raw
      ? "missing"
      : isPlaceholder
        ? "placeholder value"
        : badHttps
          ? "must be https://"
          : `too short (< ${req.min})`;
    console.error(`  FAIL  ${req.key} — ${why}`);
  } else {
    console.log(`  ok    ${req.key}`);
  }
}

for (const rec of RECOMMENDED) {
  const raw = (env[rec.key] ?? "").trim();
  if (!raw || PLACEHOLDERS.has(raw)) {
    warned += 1;
    console.warn(`  warn  ${rec.key} — not set (optional but recommended)`);
  } else {
    console.log(`  ok    ${rec.key}`);
  }
}

// Secret rotation guardrails
const weakSecrets = ["Admin123!", "password", "admin123", "secret123"];
const leaked = ["DATABASE_URL", "BETTER_AUTH_SECRET", "UPSTASH_REDIS_REST_TOKEN"]
  .filter((k) => weakSecrets.includes((env[k] ?? "").trim()))
  .map((k) => k);

if (leaked.length) {
  failed += 1;
  console.error(`  FAIL  weak/known secrets in: ${leaked.join(", ")} — rotate immediately`);
}

console.log("");
if (failed > 0) {
  console.error(`FAILED: ${failed} required check(s), ${warned} warning(s).`);
  process.exit(1);
}
console.log(
  warned > 0
    ? `PASSED with ${warned} warning(s). Required production secrets look valid.`
    : "PASSED: all required production secrets look valid.",
);
process.exit(0);

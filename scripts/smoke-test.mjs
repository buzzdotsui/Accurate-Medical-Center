#!/usr/bin/env node
/**
 * Phase 7 — smoke test against a running instance.
 *
 * Checks critical public surfaces without needing a browser.
 * Authenticated deep flows remain manual/Playwright (external).
 *
 * Usage:
 *   node scripts/smoke-test.mjs
 *   BASE_URL=https://staging.example.com node scripts/smoke-test.mjs
 */

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const CHECKS = [
  { name: "Health", path: "/api/health", expect: [200, 503] },
  { name: "Login page", path: "/login", expect: [200] },
  { name: "Register page", path: "/register", expect: [200] },
  { name: "Home", path: "/", expect: [200] },
  { name: "Patients API unauthenticated", path: "/api/v1/patients?take=1", expect: [401] },
  { name: "Seed locked (unauthenticated)", path: "/api/seed", expect: [401, 403, 405, 404] },
  { name: "Proxy/auth surface", path: "/api/auth/get-session", expect: [200, 401] },
];

async function run() {
  const results = [];
  let failed = 0;

  console.log(`Smoke test → ${BASE_URL}\n`);

  for (const check of CHECKS) {
    const url = `${BASE_URL}${check.path}`;
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: { accept: "application/json, text/html;q=0.9" },
      });
      const ok = check.expect.includes(res.status);
      if (!ok) failed += 1;
      results.push({ name: check.name, status: res.status, ok, expected: check.expect });
      console.log(
        `  ${ok ? "PASS" : "FAIL"}  ${check.name} — HTTP ${res.status} (expected ${check.expect.join("|")})`,
      );
    } catch (err) {
      failed += 1;
      results.push({ name: check.name, status: 0, ok: false, error: String(err) });
      console.log(`  FAIL  ${check.name} — ${err}`);
    }
  }

  // Health body detail when available
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const health = await healthRes.json();
    console.log(
      `\n  health.database=${health?.checks?.database} latencyMs=${health?.checks?.latencyMs}`,
    );
    if (healthRes.status === 200 && health?.checks?.database !== "up") {
      failed += 1;
      console.log("  FAIL  health reported database not up");
    }
  } catch {
    /* already counted above if health failed */
  }

  console.log(
    failed === 0
      ? `\nSMOKE PASS — ${results.length} checks`
      : `\nSMOKE FAIL — ${failed} of ${results.length} checks failed`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

run();

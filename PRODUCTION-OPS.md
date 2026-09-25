# Production Operations Runbook (Phase 6 & 7)

Executable Phase 6/7 items live in this repo as scripts. Items that require
external accounts/operators are marked **External**.

## Commercial scope (invoice TTI/2026/HMS-P1-002)

| Item | Owner | Status |
|------|-------|--------|
| HMS design & development (web) | Dev | In-repo — code complete pending final regression |
| Domain `accuratemedicalcentre.com` | Client | **External** — purchase/renew + DNS |
| Hosting & production deployment | Client + Dev | Scripts ready; deploy is **External** |
| Mobile app (Capacitor Android) | Dev + Client | Config in-repo; `.aab` blocked on Android SDK + keystore (**External**) |
| Google Play publishing | Client | Blocked on Play Console + assets (**External**) |

**Not in Phase 1 (do not expand):** additional departments, advanced lab/radiology, inventory/pharmacy expansion, advanced finance/reporting/analytics, automation, SMS/email/WhatsApp, payment gateways, third-party integrations, advanced notifications, extra mobile features, extra roles/workflows, new dashboards.

Deferred specialty UI/APIs (psych, ambulance, theatre, maternal) are source-preserved and gated by `PHASE1_ENABLE_DEFERRED_MODULES` (default off).

## Phase 6 — Production infrastructure

| Item | Status | How |
|------|--------|-----|
| Backups | Script ready | `scripts/backup-db.sh` — cron `0 2 * * *`; optional S3 upload |
| Monitoring (liveness) | Implemented | `GET /api/health` (DB up → 200, down → 503); no auth; not rate-limited |
| Error tracking | Wired | `withSentryConfig` in `next.config.ts`; `src/instrumentation.ts` + `src/instrumentation-client.ts`; error boundaries call `Sentry.captureException`. Set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` (+ optional `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` for source maps) |
| Production env verification | Script ready | `npm run verify:env` (reads `.env.production`) |
| Secret rotation | Process | Rotate Better Auth secret, Upstash token, DB password, Cloudinary, Resend in vault — **never** commit. `Admin123!` must not exist anywhere in prod credentials |
| Domain | **External** | Point DNS at Vercel/origin; set `BETTER_AUTH_URL` + `NEXT_PUBLIC_APP_URL` |
| Production deployment | **External** | Vercel project → `npm run build` (`output: standalone` also supports Node host) |
| Disaster recovery | Script + process | Restore from latest `db_backup_*.sql.gz`; verify with `GET /api/health`; keep ≥7 days local + S3 |
| Database schema (no migrations dir) | Process | This repo has **no** `prisma/migrations/`. Initial production sync: `npx prisma db push` against prod `DATABASE_URL` (never `prisma migrate reset` on real data). Subsequent schema changes: introduce migrate workflow only with client sign-off |
| Android / Play packaging | Scaffold + checklist | `capacitor.config.ts`, `public/manifest.json`, `ANDROID-PLAY-RELEASE.md`; build blocked until Android SDK + keystore exist on build machine |

### Domain DNS (client)

1. Purchase/renew `accuratemedicalcentre.com`.
2. Point apex + `www` to hosting (Vercel recommended CNAME/A records).
3. Wait for propagation; enable HTTPS (Vercel auto or reverse-proxy certs).
4. Set production env: `BETTER_AUTH_URL=https://accuratemedicalcentre.com`, `NEXT_PUBLIC_APP_URL=https://accuratemedicalcentre.com`.
5. Re-run `npm run verify:env` then `BASE_URL=https://accuratemedicalcentre.com npm run smoke`.

### Backup cron (example)

```bash
# /etc/cron.d/accurate-backup
0 2 * * * postgres /opt/accurate/scripts/backup-db.sh >> /var/log/db_backup.log 2>&1
```

### Env verification

```bash
node scripts/verify-production-env.mjs --env-file .env.production
```

Required: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`NEXT_PUBLIC_APP_URL`, `UPSTASH_REDIS_REST_URL` (https), `UPSTASH_REDIS_REST_TOKEN`.

## Phase 7 — Go-live

| Item | Status | How |
|------|--------|-----|
| Smoke testing | Script ready | `npm run smoke` (or `BASE_URL=https://… node scripts/smoke-test.mjs`) |
| Final acceptance | Checklist | See below |
| Staff training | Checklist | See below |
| Production deployment | **External** | Deploy after `verify:env` + `smoke` pass |
| Monitoring | `GET /api/health` | Wire uptime probe (e.g. UptimeRobot/PagerDuty) to this URL |
| Post-launch support | Process | Sentry alerts + daily backup log review for first 14 days |

### Acceptance smoke checklist (manual / Playwright)

1. Login as RECEPTIONIST → register patient → book appointment  
2. DOCTOR: open queue → complete visit → prescription + lab order  
3. LAB: complete result → patient portal shows result  
4. PHARMACY: dispense → stock decrements  
5. BILLING: invoice → payment → finance stats update  
6. ADMIN: branch isolation (two-branch fixtures)  
7. Unauthenticated `/api/v1/*` → 401  
8. Seed route does not create SUPER_ADMIN without env gate  
9. Deferred psych APIs → 403 unless `PHASE1_ENABLE_DEFERRED_MODULES=true`  
10. Deferred role dashboards show honest Phase 1 notices (no fake stats)

### Staff training outline (30–45 min)

1. Login, profile menu, notifications  
2. Reception: register, book, check-in  
3. Clinical: triage → consult → orders  
4. Lab/pharmacy fulfill  
5. Billing collect  
6. Admin: staff, settings, audit log  
7. What to do on errors (retry, contact support) — do not share passwords in chat  

### Post-launch (first 14 days)

- Daily: backup log + health probe  
- Daily: Sentry unresolved errors  
- Weekly: review audit log for privilege anomalies  
- On incident: rollback deploy → restore DB if needed → re-run `smoke`

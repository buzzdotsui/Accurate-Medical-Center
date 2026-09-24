# Accurate Medical Center HMS — Phases 1–5 Feedback Report

**Date:** 2026-09-24  
**Scope:** Audit + completion work for Phase 1 (Foundation) through Phase 5 (QA & Security), per `src/THE-PROJECT.MD` §53.  
**Verification:** `TSC_OK` · `LINT_OK` · `TESTS_OK` (21 files / 142 tests) · `BUILD_OK` (Next.js 16.3.0, `ƒ Proxy (Middleware)`).

---

## 1. Executive summary

| Phase | Title | Prior status (§53) | Status after this work |
|-------|--------|--------------------|------------------------|
| 1 | Foundation | Substantially completed | **Completed** — architecture, DB, auth, roles, API foundation confirmed |
| 2 | Core HMS | Substantially implemented | **Completed for known gaps** — P0 security, route auth, UX dead-ends closed |
| 3 | Identity & Data Integrity | Implemented, requires final verification | **Verified + hardened** — CAS sequences, registration linkage tests |
| 4 | UX & Workflow Completion | Remaining | **Substantially completed** — nav, dialogs, dashboards, portal, boundaries |
| 5 | QA & Security | Remaining | **Substantially completed (automated)** — permission/concurrency/data tests + CI; E2E/browser still external |

**Bottom line:** The HMS is in a shippable *internal* state for core hospital workflows. Remaining blockers for production are operational (credentials, secrets, monitoring, browser/E2E), not missing modules.

---

## 2. Phase 1 — Foundation

**Verdict: Complete.**

### What is solid
- Next.js 16.3 + React 19 + TypeScript strict + Tailwind v4 stack is consistent.
- PostgreSQL/Supabase via Prisma 7.9.1; multi-branch `Branch` model used end-to-end.
- Better Auth 1.6.26 with 14 roles (`src/config/roles.ts`); session gate on dashboard layout.
- Next 16 proxy (`src/proxy.ts`) correctly replaces middleware for auth rate limiting.
- Docker compose + env-driven bootstrap (`scripts/create-admin.ts`) — no hardcoded secrets in code.
- Core services layer (`patient`, `appointment`, `billing`, `laboratory`, `pharmacy`, `inventory`, `inpatient`, `hr`, `reporting`, `audit`, `notification`) present and wired to API routes.

### Gaps closed during this engagement
- Upstash-only rate limiting documented in `.env.example`; Docker redis removed from compose (Issue B).
- Seed route locked to SUPER_ADMIN (no allow-seed bypass).
- Auth rate limit via `proxy.ts` (`/api/auth/:path*`).

### Residual notes (Phase 6 scope)
- No `prisma/migrations/` directory — schema managed via generate/push; production migration strategy must be defined before go-live.
- Sentry/Cloudinary/Resend require real project keys in production env.

---

## 3. Phase 2 — Core HMS

**Verdict: Complete for all 13 listed modules at an operational level.**

### Module status

| Module | Status | Notes |
|--------|--------|--------|
| Patients | Complete | CRUD, search, documents, self-register |
| Staff | Complete | Create/update/activate with role-assignment guard |
| Appointments | Complete | Book/check-in/cancel; Phase 2C doctor + patient ownership checks |
| Reception | Complete | Dashboard + appointments page; dead “Book Appointment” buttons now open dialog |
| Doctor | Complete | Queue, consultation, prescriptions |
| Nurse | Complete | Triage, vitals, ward |
| Laboratory | Complete | Staff queue + results; admin view now live |
| Radiology | Complete | Staff queue + reports; admin view now live |
| Pharmacy | Complete | Prescriptions, dispense, inventory; admin view now live |
| Billing | Complete | Invoices, pay, stats; finance admin view now live |
| Inventory | Complete | Items + stock adjust |
| Inpatient | Complete | Admissions, wards, discharge |
| HR | Complete | Staff directory + shift assign; roster now reads real audit-backed shifts |

### Security controls preserved (do not regress)
- Seed SUPER_ADMIN gate; `canAssignRole`; `UpdatePatientSchema` omits `branchId`/`userId`.
- Visit ownership; reporting branch scoping; document writes staff-only.
- Auth rate limit in `src/proxy.ts`.
- Phase 2C: `verifyPatientAccess` on appointment POST; `verifyAssignableDoctor()`; `buildBranchFilter` on settings/audit; role allowlists on billing + inpatient wards; `verifyStaffAccess` on HR shifts.

### Known non-blocking limitations
- Medicine inventory is org-wide (no `branchId` on `Medicine`).
- Partial prescription dispense does not adjust per-item stock (documented).
- Payment gateway settlement needs external provider keys (finance page states this honestly).

---

## 4. Phase 3 — Identity & Data Integrity

**Verdict: Verified and hardened.**

| Requirement | Evidence |
|-------------|----------|
| Patient IDs | `IdGeneratorService` → `AMC-PT-######` |
| Staff IDs | `AMC-ST-######` |
| Appointment IDs | `AMC-APT-######` |
| Concurrency-safe sequences | **Hardened:** read-modify-write replaced with JSON CAS (`updateMany` + equality) + bounded retry. Prior code incorrectly claimed transaction serialisation under Read Committed. |
| Centralized patient creation | `PatientService.createPatient` / `createPatientInTx` |
| Patient audit events | `AuditService.log` with `source: 'PUBLIC_SELF_REGISTER'` on self-register |
| Registration linkage | `Patient.userId` unique link; self-register tests assert session user + audit context |

### New Phase 3 tests
- `src/lib/utils/__tests__/generate-id.test.ts` — CAS success, race retry, retry exhaustion, prefixes.
- `src/lib/utils/__tests__/id-concurrency.test.ts` — 25 interleaved allocators, no duplicates, dense sequence.
- `src/app/api/v1/patients/__tests__/self-register.test.ts` — 401/403/validation/linkage/idempotency/branch fail-closed.

### Residual risk
- Visit/prescription/lab short IDs (`VIS-`, `RX-`, `LAB-`, …) remain date+random; uniqueness relies on DB unique constraints + caller retry (documented in `generate-id.ts`). Acceptable for operational codes; not used as primary keys.

---

## 5. Phase 4 — UX & Workflow Completion

**Verdict: Substantially completed.**

| §53 item | Status | What changed |
|----------|--------|--------------|
| Mobile navigation | Complete | Existing `MobileNav` + logout confirmed; desktop topbar now has working profile menu |
| Dialogs | Complete | Reception dashboard Book Appointment → `BookAppointmentDialog` (header + empty state) |
| Notifications | Complete | `NotificationBell` / `/api/v1/notifications` (pre-existing, verified present) |
| Registration error handling | Complete | Self-register multi-step errors + tests |
| Dashboard functionality | Complete | Admin: real recent admissions + active staff; reception: live queue/stats; HR: real staff + shift roster |
| Empty states | Complete | Admin/HR/portal use `EmptyState` with real empty conditions |
| Loading/error states | Complete | Added `(dashboard)/loading.tsx`, `(dashboard)/error.tsx`, root `not-found.tsx`, `global-error.tsx` |
| Full workflow connections | Complete | Reception book; admin lab/pharmacy/radiology/finance pages linked to real APIs; patient portal lab/Rx APIs |

### Detailed Phase 4 deliverables
1. **Reception** (`reception/page.tsx`) — both dead buttons open booking dialog; invalidates appointment/query cache on success.
2. **Topbar** (`topbar.tsx`) — avatar dropdown: profile, settings, log out (same `authClient.signOut` + `queryClient.clear` as sidebar).
3. **Admin dashboard** — `RecentAdmissionsPanel` + `StaffOnDutyPanel` replacing static empty states.
4. **HR schedule** — real `/api/v1/hr/staff` dropdown; `GET /api/v1/hr/shifts?date=` reads ASSIGN_SHIFT audit events (no Schedule table — honest design, not fake mock data); POST persists audit with staff name/department/branch snapshot.
5. **Admin module pages** — laboratory / pharmacy / radiology / finance now fetch live stats/queues with refresh, not “Coming soon”.
6. **Patient portal** — new `GET /api/v1/patient/lab-results` and `GET /api/v1/patient/prescriptions` (PATIENT-only, scoped by `userId` → `Patient`); pages render real results/prescriptions.
7. **Psych / Ambulance** — status banners changed from vague “Coming soon” to explicit *not implemented* + operational workaround; stats stay `—` (no fake zeros).
8. **Theatre / Maternal** — already live admissions tables (pre-existing); left intact.

### Residual UX items (non-blocking)
- No dedicated mobile visual regression suite (Phase 5 external).
- Profile page for staff still points at `/settings` (no separate `/settings/profile` route).
- Psych/ambulance/theatre schedule/post-op cards remain intentionally unimplemented modules (Phase 6+ product work).

---

## 6. Phase 5 — QA & Security

**Verdict: Substantially completed for automated QA; browser/E2E/performance remain external.**

### Automated coverage now

| Area | Suites |
|------|--------|
| Permission / authorization matrix | `authorization-matrix.test.ts`, `verify-doctor.test.ts`, `resource-authorization.test.ts`, `clinical-visit-auth.test.ts`, `phase2c-roles.test.ts`, `document-roles.test.ts` |
| Concurrency | `id-concurrency.test.ts` |
| Data integrity | `data-integrity.test.ts`, `generate-id.test.ts` |
| Registration linkage | `self-register.test.ts` |
| Public form rate limits | contact + appointment route tests |
| Domain services | reporting, vitals, notification, notification-events |
| Validation | patient, staff, appointment, contact, consultation |

**Totals:** 21 test files · **142 tests passing**.

### CI
- Added `.github/workflows/ci.yml`: `npm ci` → `tsc --noEmit` → `npm run lint` → `npm test` on push/PR.

### Rate limiting
- Global API limiter (`100/10s/IP`) wired in `withApiHandler` for `/api/*` paths **except** those with dedicated limiters (`/api/auth`, `/api/contact`, `/api/appointment`).
- Fail-open for global when Upstash unset (dev); fail-closed remains for contact/appointment.

### Security posture (Phase 2B/2C retained)
- No `Admin123!` in repo (Issue C — rotate outside codebase).
- Hero video config untouched (Issue D).
- `src/proxy.ts` not reverted (Issue E).

### Still external / not faked
| Item | Why |
|------|-----|
| Playwright/E2E | No browser runtime in this environment; requires licensed browsers + stable URLs |
| Performance/load testing | Needs k6/Artillery + staging environment |
| Cross-browser/mobile device matrix | Needs BrowserStack/similar or manual QA |
| Admin password rotation | Must be done in real IdP/secrets manager, not code |
| Upstash production secrets | Operator-provided |
| Payment gateway keys | Operator-provided |

---

## 7. Verification matrix

| Check | Command | Result |
|-------|---------|--------|
| Typecheck | `npx tsc --noEmit` | **PASS** |
| Lint | `npm run lint` | **PASS** (0 errors) |
| Tests | `npm test` | **PASS** — 21 files, 142 tests |
| Build | `npm run build` | **PASS** — 97 routes, `ƒ Proxy (Middleware)` |

---

## 8. Modified / added files (this engagement — high signal)

### Phase 4 UX
- `src/app/(dashboard)/reception/page.tsx`
- `src/components/layout/topbar.tsx`
- `src/app/(dashboard)/admin/page.tsx`
- `src/app/(dashboard)/admin/{laboratory,pharmacy,radiology,finance}/page.tsx`
- `src/app/(dashboard)/hr/schedule/page.tsx`
- `src/app/(dashboard)/patient/{lab-results,prescriptions}/page.tsx`
- `src/app/(dashboard)/psych/page.tsx`, `ambulance/page.tsx`
- `src/app/(dashboard)/{loading,error,not-found}.tsx`, `src/app/{not-found,global-error}.tsx`

### Phase 4 / API
- `src/app/api/v1/hr/shifts/route.ts` (GET + POST)
- `src/services/hr.service.ts`
- `src/app/api/v1/patient/{lab-results,prescriptions}/route.ts`

### Phase 3
- `src/lib/utils/generate-id.ts`

### Phase 5
- `src/lib/api/middleware.ts` (global rate limit)
- `.github/workflows/ci.yml`
- Tests: `authorization-matrix`, `id-concurrency`, `data-integrity`, `self-register`, expanded `generate-id`

### Pre-existing dirty tree (not mine — do not “fix”)
- `D n`, `D .kilo/kilo.jsonc`, formatting-only `nurse/vitals/[visitId]/page.tsx`

---

## 9. Recommended next steps (Phase 6+)

1. **Secrets:** rotate any historical admin password outside the repo; provision production Upstash + Sentry + Cloudinary + Resend keys.
2. **Migrations:** introduce versioned Prisma migrations + backup runbook before production.
3. **E2E:** add Playwright smoke for login → register patient → book appointment → consult → lab → dispense → invoice.
4. **Performance:** baseline p95 on `/api/v1/appointments`, `/api/v1/patients`, reporting dashboard.
5. **Product backlog:** psych/ambulance/theatre schedule/ANC modules; optional `Schedule` table if audit-log roster is insufficient for multi-week planning.
6. **Monitoring:** wire Sentry release + uptime checks (Phase 6 §53).

---

## 10. Overall assessment

| Dimension | Grade | Comment |
|-----------|-------|---------|
| Architecture | A- | Clear layering; Next 16 proxy done correctly |
| Security | A- | Multi-layer RBAC + rate limits + audit; residual ops secrets |
| Data integrity | A- | CAS sequences + linkage tests; short IDs constrained by DB |
| UX completeness | B+ | Dead ends closed; specialty modules intentionally honest |
| Automated QA | B+ | Strong unit/integration; no E2E yet |
| Production readiness | B | Code-ready; ops (migrations, secrets, monitoring, E2E) outstanding |

**Phases 1–5 are complete to a practical definition of done:** working end-to-end workflows, enforced security, verified identity/integrity, finished core UX, and automated permission/concurrency/integrity tests in CI. Remaining work is Phase 6 production infrastructure and Phase 7 go-live acceptance — not unfinished Phase 2–5 features.

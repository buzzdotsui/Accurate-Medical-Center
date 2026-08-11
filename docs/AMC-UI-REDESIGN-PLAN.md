# AMC-HMS UI/UX Redesign Plan
### Accurate Medical Center — "Healing Minds. Restoring Lives."

---

## 1. CURRENT UI AUDIT

### 1.1 What Exists

| Area | File(s) | Status |
|---|---|---|
| Auth layout | `(auth)/layout.tsx` | Exists — generic split-pane, uses `<Activity>` icon instead of AMC logo |
| Login page | `(auth)/login/page.tsx` | Exists — basic form, real auth connected, no branding depth |
| Register page | `(auth)/register/` | Exists (not audited) — assumed same pattern |
| Dashboard layout | `(dashboard)/layout.tsx` | **Hardcoded** `userRole = "DOCTOR"` — not reading real session |
| Sidebar | `components/layout/sidebar.tsx` | Exists — functional, no collapse, no groups, no mobile drawer |
| Topbar | `components/layout/topbar.tsx` | Exists — static, no real search, no real user info, placeholder bells |
| Reception dashboard | `reception/page.tsx` | Exists — hardcoded stats (42, 8, 14m), empty cards, no real data |
| Patient list | `reception/patients/page.tsx` | **Real API connected** — TanStack Query, search works, basic table |
| Patient registration | `reception/patients/new/` | Exists (not audited) |
| Appointments | `reception/appointments/` | Exists (not audited) |
| Doctor dashboard | `doctor/page.tsx` | Exists — hardcoded stats, fake "John Doe" next patient |
| Doctor queue | `doctor/queue/` | Exists (not audited) |
| Doctor consultation | `doctor/consultation/` | Exists (not audited) |
| Billing dashboard | `billing/page.tsx` | Exists — **USD ($)** instead of NGN (₦), fake data, "Mary Smith" hardcoded |
| Billing invoices | `billing/invoices/` | Exists (not audited) |
| Nurse, Pharmacy, Lab, Radiology, Inpatient, Inventory, HR, Analytics, Settings | Various | **All stubs** — pages likely exist but contain empty/placeholder content |
| UI components | `components/ui/` | Only 5 components: Button, Card, Input, Logo, Table — severely incomplete |
| Design tokens | `globals.css` | **Solid foundation** — lemon/black/grey tokens, semantic status colors defined |
| Nav config | `config/nav.ts` | **Complete** — all 13 roles have nav items |
| Font | `globals.css` | Inter + Plus Jakarta Sans declared |

### 1.2 Critical Problems Found

#### 🔴 Blockers
1. **Hardcoded role in layout** — `DashboardLayout` always renders `DOCTOR` sidebar regardless of who is logged in. Every user sees the same navigation.
2. **USD currency** — Billing shows `$` instead of `₦`. This is a Nigerian hospital.
3. **Fake patient data** — "John Doe", "Mary Smith" hardcoded in dashboards — unacceptable in a medical system.
4. **No session context** — User name shown as "User Name", avatar shows "U". The topbar has no real user info.

#### 🟡 Design Problems
5. **Generic SaaS feel** — The layout looks like a Next.js admin template. Nothing about it communicates "Nigerian private hospital."
6. **Auth branding is wrong** — The login page uses a generic `<Activity />` icon from Lucide, not the actual AMC logo.
7. **Sidebar is incomplete** — No collapse, no section grouping, no mobile drawer. On mobile, the sidebar is completely hidden (`hidden md:flex`) with no fallback navigation.
8. **No breadcrumbs** — The topbar only shows a single lowercase title extracted from the URL path.
9. **Topbar search is cosmetic** — No command palette, no real search.
10. **Only 5 UI components** — Missing: Badge, Avatar, Dialog, Drawer, Dropdown, Select, Tabs, Toast, Tooltip, Popover, DatePicker, Skeleton, EmptyState, StatusBadge, Timeline, QueueItem, StatCard, Pagination, Combobox, and many more.
11. **No loading/skeleton states** — The patient list has a spinner but no Skeleton — no consistent loading experience.
12. **No empty states** — The reception dashboard uses `<p>Appointments will stream here dynamically.</p>` instead of a proper empty state component.
13. **Tables not responsive** — The patient list table will overflow on mobile.
14. **No status badges** — No visual differentiation for appointment statuses, patient states, test results, etc.
15. **No patient header component** — The patient profile is a blank canvas.
16. **Dashboards are identical in structure** — Reception, Doctor, and Billing dashboards all use the exact same 3-4 stat cards + 2 empty cards layout.

#### 🟢 Preserve / Build Upon
- Token system in `globals.css` — solid, just needs expansion
- Nav config structure in `config/nav.ts` — comprehensive, well-organized
- `roles.ts` — clean RBAC constants
- Patient list API integration — TanStack Query pattern is correct
- Button and Card components — good foundation, need extension
- Font choices — Inter + Plus Jakarta Sans are appropriate

---

## 2. AMC DESIGN PRINCIPLES

### 2.1 Brand Philosophy
> AMC is not a tech startup. It is a trusted Nigerian private hospital.
> The UI must communicate: Trust, Precision, Compassion, Cleanliness, Professionalism.

### 2.2 Color Application Rules

```
LEMON (#03161A)  → Primary CTAs, active nav, highlights, selected states, brand moments
BLACK (#0A1414)  → Strong headings, critical information, sidebar base, primary text
GREY palette     → Surfaces, borders, secondary text, muted information
WHITE (#E9F2F3)  → Card backgrounds, form fields, clean content areas

Status colours (semantic only — never decorative):
  Success → #16a34a (green)   — completed, paid, normal result
  Warning → #d97706 (amber)   — pending, awaiting, borderline
  Danger  → #dc2626 (red)     — urgent, overdue, critical, abnormal
  Info    → #2563eb (blue)    — informational, in-progress, scheduled
```

### 2.3 Typography System

```
Font stack:
  Headings  → Plus Jakarta Sans (700, 600)
  Body      → Inter (400, 500)
  Mono      → JetBrains Mono (for IDs, codes, patient IDs)

Scale:
  Page title      → 24px / Plus Jakarta Sans 700
  Section title   → 18px / Plus Jakarta Sans 600
  Card title      → 15px / Inter 600
  Body            → 14px / Inter 400
  Secondary text  → 13px / Inter 400 / grey-500
  Metadata        → 12px / Inter 500 / grey-400
  Status/label    → 11px / Inter 600 / uppercase tracking-wide
  Patient ID      → 13px / JetBrains Mono 500 / lemon-700
```

### 2.4 Spacing System
- Base unit: 4px
- Cards: 24px padding (p-6)
- Card gap: 16px or 24px depending on density
- Page padding: 24px mobile, 32px tablet, 40px desktop
- Section spacing: 32px between major sections

### 2.5 Elevation / Depth
- Surface 0 (page): grey-50 background
- Surface 1 (card): white, 1px border grey-200, shadow-sm
- Surface 2 (dropdown/popover): white, border, shadow-md
- Surface 3 (modal): white, border, shadow-xl, backdrop-blur
- No glass — clean clinical surfaces only

---

## 3. DESIGN SYSTEM COMPONENTS

### 3.1 Priority Component Build List

**Phase A — Foundation (must exist before any page is touched):**
```
Button (extend existing — add loading state)
Input (extend — add icon, error, helper text)
Textarea
Select (native + custom)
Badge / StatusBadge (appointments, tests, payments)
Skeleton
EmptyState
ErrorState
LoadingSpinner
Toast (hook-based)
Avatar
```

**Phase B — Navigation & Shell:**
```
Sidebar (collapsible, grouped, mobile drawer)
Topbar (real session, search, notifications)
Breadcrumb
PageHeader
MobileNav / BottomNav
```

**Phase C — Content Components:**
```
StatCard (metric display with trend)
DataTable (TanStack Table wrapper with search/filter/pagination)
Timeline (patient journey, clinical history)
QueueItem (operational queue row)
StatusTimeline (appointment progress)
```

**Phase D — Forms & Inputs:**
```
FormField (label + input + error)
DatePicker
Combobox (patient search, doctor select)
MultiSelect
PhoneInput (Nigerian format)
RadioGroup
Checkbox
Switch
```

**Phase E — Overlays:**
```
Dialog / Modal
Drawer (mobile-first side panel)
Popover
Tooltip
DropdownMenu
ConfirmDialog
CommandPalette (CMD+K global search)
```

**Phase F — Medical-specific:**
```
PatientHeader (photo, ID, alerts, allergies, quick actions)
PatientSummary (compact overview)
MedicalTimeline (clinical journey)
VitalSigns (display grid)
PrescriptionCard
LabResultBadge (normal/abnormal/critical)
InvoiceLineItem
QueueCard
AppointmentStatusBadge
```

---

## 4. GLOBAL APPLICATION SHELL

### 4.1 Layout Structure (Desktop)
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)      │  MAIN AREA                      │
│  ┌─────────────────┐  │  ┌─────────────────────────┐   │
│  │  AMC LOGO       │  │  │  TOPBAR                 │   │
│  │  ─────────────  │  │  │  breadcrumb | search    │   │
│  │  Branch badge   │  │  │  notif | user profile   │   │
│  │                 │  │  └─────────────────────────┘   │
│  │  NAVIGATION     │  │  ┌─────────────────────────┐   │
│  │  (role-aware)   │  │  │  PAGE CONTENT           │   │
│  │  grouped        │  │  │                         │   │
│  │                 │  │  └─────────────────────────┘   │
│  │  ─────────────  │  │                                 │
│  │  USER PROFILE   │  │                                 │
│  └─────────────────┘  │                                 │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Sidebar Design
- **Top:** AMC logo (actual SVG/image) + hospital name + branch badge
- **Middle:** Grouped navigation (Main, Clinical, Admin — varies by role)
- **Active state:** Lemon left border (3px) + lemon/10 bg + lemon text
- **Inactive:** grey-600 text, transparent bg, grey-50 hover
- **Collapsed state:** 64px wide, icons only, tooltip on hover
- **Bottom:** Logged-in user mini profile, settings shortcut, logout

### 4.3 Topbar Design
- **Left:** Hamburger (mobile) | Breadcrumb (desktop: Dashboard > Reception > Patients)
- **Center:** Global search trigger (CMD+K) — opens CommandPalette
- **Right:** Date/time | Notifications bell with badge | User avatar + name + dropdown

### 4.4 Mobile Shell
- Sidebar becomes a slide-in **Drawer** (triggered by hamburger)
- Add **Bottom Navigation** for most-used actions per role (max 5 items)
- Topbar collapses to logo + hamburger + notification icon

---

## 5. AUTHENTICATION SCREENS

### Login page redesign:
- **Left pane:** Clean white. AMC logo (actual). Headline: "Welcome to Accurate Medical Center." Subline: "Sign in to your portal." Email + password fields. Primary CTA: "Sign In." Forgot password link. Patient portal link.
- **Right pane:** Dark background (grey-900). AMC tagline: "Healing Minds. Restoring Lives." A calm, medical illustration or photo. 3 trust signals (Security, Privacy, Excellence).
- No generic tech copy. No "military-grade encryption" marketing.

---

## 6. ROLE-SPECIFIC DASHBOARDS

### 6.1 Reception Dashboard
```
┌─────────────────────────────────────────────────────┐
│  Good morning, [Name]. Today is Monday, Aug 10.     │
│  ─────────────────────────────────────────────────  │
│  [Register Patient ▶]  [Book Appointment ▶]         │
└─────────────────────────────────────────────────────┘

StatRow:
┌──────────┬──────────┬──────────┬──────────┐
│ Today's  │ Checked  │ Waiting  │ Avg Wait │
│ Appts: 42│ In: 18   │ Queue: 8 │ Time: 12m│
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────┬───────────────────────┐
│  WAITING QUEUE      │  TODAY'S APPOINTMENTS │
│  (live, scannable)  │  (timeline view)      │
│  ─────────────────  │  ─────────────────    │
│  [1] John A. — 8m   │  09:00 Dr. Adeleke    │
│  [2] Fatima B. — 5m │  09:30 Dr. Okafor     │
│  [3] Chukwu E. — 2m │  10:00 Walk-in        │
└─────────────────────┴───────────────────────┘
```

### 6.2 Doctor Dashboard
```
Personalized greeting + date + department

Stat Row: Waiting (urgent red) | In Progress | Completed | Pending Results

┌─────────────────────┬───────────────────────┐
│  NEXT PATIENT       │  ACTION ITEMS         │
│  ─────────────────  │  ─────────────────    │
│  [Photo] Name       │  🔴 3 Abnormal labs   │
│  Age, Complaint     │  🟡 2 Follow-ups due  │
│  Wait: 18 mins      │  🔵 1 Radiology rpt   │
│  [Start Consult ▶]  │                       │
└─────────────────────┴───────────────────────┘

QUEUE (full table with patient cards)
```

### 6.3 Nurse Dashboard
```
Ward/Triage overview

Stat Row: Triage Queue | Admitted Patients | Pending Vitals | Urgent

┌────────────────────────────────────────────┐
│  TRIAGE QUEUE (priority-sorted)            │
│  🔴 [Priority] Chest pain — Room 3         │
│  🟡 [Moderate] Fever 38.5°C — Waiting      │
│  🟢 [Routine] Follow-up — Room 1           │
└────────────────────────────────────────────┘
```

### 6.4 Laboratory Dashboard
```
Stat Row: Pending Requests | Samples In | Results Ready | Urgent/STAT

┌────────────────────┬──────────────────────┐
│  URGENT (STAT)     │  PENDING REQUESTS    │
│  Red-highlighted   │  Sortable by time    │
│  [Process ▶]       │  [Collect Sample ▶]  │
└────────────────────┴──────────────────────┘
```

### 6.5 Pharmacy Dashboard
```
Stat Row: Prescriptions Waiting | Dispensed Today | Low Stock Items | Expiring Soon

┌────────────────────┬──────────────────────┐
│  DISPENSE QUEUE    │  STOCK ALERTS        │
│  Priority order    │  🔴 Amoxicillin: 3   │
│  [Dispense ▶]      │  🟡 Paracetamol: 12  │
└────────────────────┴──────────────────────┘
```

### 6.6 Finance / Billing Dashboard
```
Stat Row: Today's Revenue (₦) | Paid Invoices | Outstanding | Refunds

All amounts in ₦ (NGN)
No USD anywhere.

┌────────────────────┬──────────────────────┐
│  PAYMENT QUEUE     │  REVENUE SUMMARY     │
│  Next: [Name]      │  Bar chart (week)    │
│  INV-2026-099      │                      │
│  ₦15,500 due       │                      │
└────────────────────┴──────────────────────┘
```

### 6.7 Admin Dashboard
```
Hospital at a glance:

Stat Row: Patients Today | Appointments | Revenue (₦) | Bed Occupancy %

Full analytics overview with charts, departmental activity, staff on duty
```

---

## 7. PATIENT EXPERIENCE

### 7.1 Patient Profile / Workspace
```
┌──────────────────────────────────────────────────────────┐
│  PATIENT HEADER                                          │
│  [Photo] Adaobi Chukwuemeka            PAT-2026-001200  │
│          Female • 34 years • B+        Registered: Jan 2025 │
│          📞 08012345678                                  │
│  ┌──────────────┐  🚨 ALLERGIES: Penicillin             │
│  │ [Book Appt]  │  ⚠️  Hypertension (Known)             │
│  └──────────────┘                                        │
└──────────────────────────────────────────────────────────┘

TABS:
Overview | Appointments | Clinical Timeline | Visits | Diagnoses
Prescriptions | Laboratory | Radiology | Admissions | Surgery
Maternal Care | Mental Health | Billing | Documents | Follow-up
```

### 7.2 Patient Registration Form
Progressive multi-section form with step progress:
```
Step 1: Personal Information (name, DOB, gender, blood group, religion)
Step 2: Contact & Address (phone, email, LGA, state)
Step 3: Emergency Contact + Next of Kin
Step 4: Insurance / HMO
Step 5: Medical History (allergies, existing conditions, medications)
Step 6: Consent

Each step validates before proceeding.
```

---

## 8. APPOINTMENT SYSTEM

### 8.1 Appointment Status Visual Language
```
BOOKED       → Grey badge + clock icon
CONFIRMED    → Blue badge + checkmark
CHECKED-IN   → Lemon badge + door icon
WAITING      → Amber badge + hourglass
CONSULTING   → Blue badge (pulsing) + stethoscope
COMPLETED    → Green badge + check-circle
CANCELLED    → Red badge + x-circle
NO-SHOW      → Grey badge + slash
```

### 8.2 Appointment Views
- **Day view:** Timeline grid by hour, color-coded by doctor
- **Week view:** 5-column grid by day
- **Doctor view:** Per-doctor schedule column
- **List view:** Sortable table with status filters

---

## 9. QUEUE SYSTEM

Queue cards per role should show:
- Patient name + age + AMC ID
- Chief complaint / reason for visit
- Wait time (auto-updating)
- Priority indicator (color left border)
- Quick action button (Check In / Start / Process / Dispense)

---

## 10. CLINICAL WORKFLOW (Doctor EMR)

### Consultation workspace layout:
```
Left panel (1/3): Patient summary — vitals, history, allergies
Right panel (2/3): Consultation form — structured, tabbed

Tabs within consultation:
  Chief Complaint → History → Examination → Assessment →
  Diagnosis → Treatment Plan → Prescription → Lab Request →
  Radiology Request → Follow-up
```

---

## 11. LABORATORY

### Workflow status progression:
```
REQUESTED → COLLECTED → PROCESSING → RESULT ENTERED → VERIFIED → RELEASED

Visual: horizontal progress tracker per request.

Result display:
  Normal:   green value
  Low:      blue value with ↓
  High:     red value with ↑
  Critical: red bold + alert badge
```

---

## 12. BILLING / FINANCE

### Invoice display:
```
INV-2026-01245                          Status: UNPAID
Patient: Adaobi Chukwuemeka            Date: 10 Aug 2026
Doctor: Dr. Tunde Adeleke

┌─────────────────────────────────────────┐
│ Description          Qty  Unit   Total  │
│ Consultation Fee      1   ₦5,000 ₦5,000 │
│ FBC (Lab Test)        1   ₦3,500 ₦3,500 │
│ Chest X-Ray           1   ₦8,000 ₦8,000 │
├─────────────────────────────────────────┤
│                    SUBTOTAL:  ₦16,500  │
│                    DISCOUNT:  -₦500    │
│                    TOTAL DUE: ₦16,000  │
└─────────────────────────────────────────┘

Payment methods: Cash | POS/Card | Bank Transfer | HMO
```

---

## 13. RESPONSIVE STRATEGY

| Breakpoint | Layout |
|---|---|
| < 640px | Mobile: Drawer nav, bottom tab bar, stacked cards |
| 640–1024px | Tablet: Collapsed sidebar (icon-only), 2-col grids |
| > 1024px | Desktop: Full sidebar, multi-col dashboards |

Key rules:
- Tables become scrollable horizontally on mobile OR switch to card view
- Modals become full-screen drawers on mobile
- Queues stack vertically, one per row on mobile
- Patient header collapses on mobile (show summary row)

---

## 14. ACCESSIBILITY STRATEGY

- All interactive elements have `aria-label`
- All form fields have associated `<label>`
- Focus rings visible (lemon-colored, 2px)
- Semantic HTML: `<nav>`, `<main>`, `<header>`, `<aside>`
- Status badges have `role="status"` + screen-reader text
- Modals trap focus, return focus on close
- Color never used as the only indicator (always icon + text too)
- Min touch target: 44×44px

---

## 15. IMPLEMENTATION PHASES

### PHASE 1 — Design System Foundation *(2–3 days)*
- Expand `globals.css` with animation tokens, new semantic vars
- Build missing UI components: Badge, StatusBadge, Skeleton, EmptyState, ErrorState, Avatar, Toast
- Extend Button (loading state), Input (icon, error, helper)
- Add FormField, Textarea, Select, DatePicker

### PHASE 2 — Application Shell *(2 days)*
- Fix `DashboardLayout` to read real session
- Rebuild Sidebar: grouped nav, collapse, mobile drawer, real user profile
- Rebuild Topbar: breadcrumbs, user info, real notifications
- Add CommandPalette (CMD+K)
- Add MobileNav / BottomNav

### PHASE 3 — Authentication *(1 day)*
- Redesign login page with real AMC logo
- Add AMC branding to right pane (tagline, AMC identity)
- Redesign register page
- Add forgot-password page

### PHASE 4 — Dashboards *(3–4 days)*
- Reception dashboard (live queue, real stats)
- Doctor dashboard (real queue, action items)
- Nurse dashboard (triage queue, vitals)
- Lab dashboard (pending requests, urgent)
- Pharmacy dashboard (dispense queue, stock alerts)
- Finance dashboard (₦, real invoice queue)
- Admin dashboard (hospital overview, charts)

### PHASE 5 — Patient Management *(3–4 days)*
- Patient directory with real data, filters, pagination
- Patient header component
- Patient profile workspace (all tabs)
- Patient registration (multi-step form)
- Patient search (CMD+K integration)

### PHASE 6 — Appointments + Reception *(2–3 days)*
- Appointment scheduler (day/week/list views)
- Appointment status badges
- Check-in workflow
- Walk-in registration flow

### PHASE 7 — Queues *(2 days)*
- QueueItem component
- Reception queue
- Nurse/triage queue
- Doctor queue
- Lab/pharmacy queue

### PHASE 8 — Doctor / EMR *(3–4 days)*
- Consultation workspace
- Vitals display
- Prescription form
- Lab/radiology request form
- Follow-up scheduling

### PHASE 9 — Laboratory *(2 days)*
- Lab request list
- Sample collection workflow
- Result entry form
- Result display with normal/abnormal/critical visual

### PHASE 10 — Radiology *(1–2 days)*
- Scan request list
- Report entry workspace
- Report verification

### PHASE 11 — Pharmacy *(2 days)*
- Dispense queue
- Prescription review
- Stock management

### PHASE 12 — Billing / Finance *(2–3 days)*
- Invoice creation / view (₦ everywhere)
- Payment processing modal
- Receipt generation
- Revenue dashboard with charts

### PHASE 13 — Admissions / Inpatient *(2 days)*
- Bed management overview
- Admission form
- Ward view

### PHASE 14–17 — Specialist Modules *(2 days each)*
- Surgery
- Maternal Care
- Mental Health
- Inventory

### PHASE 18 — Administration / HR *(2 days)*
- Staff directory
- Department management
- Role assignment

### PHASE 19 — Analytics *(2 days)*
- Hospital overview charts (Recharts)
- Departmental metrics
- Patient volume trends
- Revenue analytics

### PHASE 20 — Patient Portal *(2 days)*
- Patient-facing dashboard
- Appointment booking
- Medical records view
- Bill payment

### PHASE 21 — Online Consultation *(2 days)*
- Consultation booking
- Virtual consultation room

### PHASE 22 — Responsive Pass *(2 days)*
- Full mobile audit of all pages
- Fix all overflow/layout issues

### PHASE 23 — Final Polish *(2 days)*
- Consistency audit across all pages
- Micro-animations review
- Accessibility audit
- TypeScript + lint clean

---

## 16. DEFINITION OF DONE

A module is **complete** when:

- [ ] Real data from the API — no hardcoded/fake data
- [ ] Loading skeleton state implemented
- [ ] Empty state implemented
- [ ] Error state implemented
- [ ] All amounts in ₦/NGN (never USD)
- [ ] Correct role shown in sidebar
- [ ] Correct user name/avatar in topbar
- [ ] Responsive on mobile, tablet, desktop
- [ ] No horizontal overflow on mobile
- [ ] All buttons have loading states
- [ ] All forms validate and show errors
- [ ] Accessible: labels, focus, aria-labels
- [ ] TypeScript: no `any` introduced
- [ ] Lint: no new errors
- [ ] Build passes

---

## 17. IMMEDIATE NEXT STEPS (What to build first)

1. **Fix `DashboardLayout`** — Read real session, pass correct role to Sidebar
2. **Build `StatusBadge`** — Used on every queue, appointment, result
3. **Build `StatCard`** — Used on every dashboard
4. **Build `EmptyState`** — Used on every list/table
5. **Build `Skeleton`** — Used on every loading state
6. **Rebuild `Sidebar`** — With grouped nav, mobile drawer, real user profile
7. **Rebuild `Topbar`** — With real session user, breadcrumbs
8. **Redesign login page** — Real AMC logo, Nigerian hospital branding
9. **Redesign Reception Dashboard** — Real data, queue panel, no fake stats
10. **Fix all currency** — Search and replace `$` → `₦` across billing pages


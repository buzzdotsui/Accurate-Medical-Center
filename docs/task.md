# AMC-HMS Implementation Tasks

## Block A — Foundation & Security

- `[ ]` **A1. Repository Baseline**
  - `[/]` Run `npm run lint`
  - `[/]` Run `npm run build`
  - `[/]` Run `npx prisma validate`
  - `[ ]` Record baseline results
- `[ ]` **A2. Fix Foundation Blockers**
  - `[ ]` Add `url = env("DATABASE_URL")` to `prisma/schema.prisma`
  - `[ ]` Add `@@index([deletedAt])` to `Patient` model in `prisma/schema.prisma`
- `[ ]` **A3. Security & Authorization Foundation**
  - `[ ]` Implement `withApiHandler`, `withAuth`, `withRole`, `withBranch` in `src/lib/api/middleware.ts`
  - `[ ]` Create `src/lib/auth/permissions.ts` with permission matrix
  - `[ ]` Wrap all existing API routes with appropriate HOFs

## Block B — UI Design System

- `[ ]` **B1. Expand Design Tokens**
  - `[ ]` Update `src/app/globals.css`
- `[ ]` **B2. Build Missing UI Components**
  - `[ ]` Build `dialog.tsx`
  - `[ ]` Build `dropdown-menu.tsx`
  - `[ ]` Build `tabs.tsx`
  - `[ ]` Build `tooltip.tsx`
  - `[ ]` Build `popover.tsx`
  - `[ ]` Build `toast-provider.tsx`
  - `[ ]` Build `checkbox.tsx`
  - `[ ]` Build `radio-group.tsx`
  - `[ ]` Build `switch.tsx`
  - `[ ]` Build `pagination.tsx`
  - `[ ]` Build `combobox.tsx`
  - `[ ]` Build `multi-select.tsx`
  - `[ ]` Build `phone-input.tsx`
  - `[ ]` Build `stat-card.tsx`
  - `[ ]` Build `queue-card.tsx`
  - `[ ]` Build `timeline.tsx`
  - `[ ]` Build `confirm-dialog.tsx`
  - `[ ]` Build `command-palette.tsx`
  - `[ ]` Build `breadcrumb.tsx`
  - `[ ]` Build `page-header.tsx`
  - `[ ]` Build `data-table.tsx`
  - `[ ]` Build `loading-state.tsx`
- `[ ]` **B3. Extend Existing Components**
  - `[ ]` Update `button.tsx` (isLoading, icon props)
  - `[ ]` Update `input.tsx` (icon, error, helperText props)
- `[ ]` **B4. Medical-Specific Components**
  - `[ ]` Build `patient-header.tsx`
  - `[ ]` Build `patient-summary.tsx`
  - `[ ]` Build `vital-signs-grid.tsx`
  - `[ ]` Build `prescription-card.tsx`
  - `[ ]` Build `lab-result-badge.tsx`
  - `[ ]` Build `appointment-status-badge.tsx`

## Block C — Application Shell & Auth

- `[ ]` **C1. Rebuild Sidebar**
  - `[ ]` Group sections, collapse toggle, active indicator, logout
- `[ ]` **C2. Rebuild Topbar**
  - `[ ]` Breadcrumbs, CMD+K trigger, notifications, user dropdown
- `[ ]` **C3. Mobile Navigation**
  - `[ ]` Ensure drawer works, add bottom navigation
- `[ ]` **C4. Auth Screen Redesign**
  - `[ ]` Update `layout.tsx` branding
  - `[ ]` Update `login/page.tsx`
  - `[ ]` Create `forgot-password/page.tsx`

## Block D — Core Hospital Modules

- `[ ]` **D1. Patient Management**
  - `[ ]` Update `patient.service.ts`
  - `[ ]` Update patient pages
  - `[ ]` Update patient APIs
- `[ ]` **D2. Appointments & Reception**
  - `[ ]` Update `appointment.service.ts`
  - `[ ]` Update reception pages
- `[ ]` **D3. Nursing / Triage**
  - `[ ]` Update `vitals.service.ts`
  - `[ ]` Update nurse pages
- `[ ]` **D4. Doctor / EMR**
  - `[ ]` Update `consultation.service.ts` & `clinical.service.ts`
  - `[ ]` Update doctor pages

## Block E — Clinical Downstream

- `[ ]` **E1. Laboratory**
  - `[ ]` Update `laboratory.service.ts`
  - `[ ]` Update lab pages
- `[ ]` **E2. Radiology**
  - `[ ]` Update `radiology.service.ts`
  - `[ ]` Update radiology pages
- `[ ]` **E3. Pharmacy**
  - `[ ]` Update `pharmacy.service.ts` & `prescription.service.ts`
  - `[ ]` Update pharmacy pages
- `[ ]` **E4. Inventory**
  - `[ ]` Update `inventory.service.ts`
  - `[ ]` Update inventory pages

## Block F — Hospital Operations

- `[ ]` **F1. Billing & Finance**
  - `[ ]` Update `billing.service.ts` & `payment.service.ts`
  - `[ ]` Update billing pages (NGN everywhere)
- `[ ]` **F2. Admissions & Bed Management**
  - `[ ]` Update `inpatient.service.ts`
  - `[ ]` Update inpatient pages
- `[ ]` **F3-F7. Additional Operations**
  - `[ ]` Implement remaining hospital operations

## Block G — Platform & Polish

- `[ ]` **G1-G7. Final Polish and Testing**
  - `[ ]` Global Search, Analytics, Settings, Portals, Testing, Production Hardening

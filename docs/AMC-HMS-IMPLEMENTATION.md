# AMC-HMS Implementation Roadmap

> **Accurate Medical Center --- Hospital Management System**
>
> This document is the implementation checklist for taking the current
> AMC-HMS repository from its present state to a production-ready,
> integrated digital hospital.
>
> **Rule:** Do not treat a route/page as complete merely because it
> exists. A module is complete only when its UI, API, database
> interaction, validation, authorization, loading/error/empty states,
> audit requirements, responsiveness, accessibility, tests, and build
> quality have been addressed.

------------------------------------------------------------------------

# 0. PROJECT NORTH STAR

Use this question for every implementation decision:

> Does this move Accurate Medical Center closer to becoming a modern,
> secure, patient-focused, fully integrated digital hospital?

The target is **not** a collection of departmental CRUD dashboards.

The target is one coherent system connecting:

-   Patients
-   Doctors
-   Nurses
-   Reception
-   Laboratory
-   Radiology
-   Pharmacy
-   Maternal Care
-   Mental Health
-   Surgery
-   Admissions
-   Finance
-   Administration

------------------------------------------------------------------------

# 1. CURRENT STATE

## Current stack

-   Next.js 16.3 / App Router
-   React 19
-   TypeScript
-   Tailwind CSS v4
-   Prisma 7
-   PostgreSQL
-   `@prisma/adapter-pg`
-   Better Auth
-   TanStack Query v5
-   React Hook Form
-   Zod v4
-   TanStack Table
-   Recharts
-   `@react-pdf/renderer`
-   Framer Motion
-   Resend
-   Cloudinary
-   Sentry
-   Upstash Redis

## Current architecture strengths

-   Domain-oriented service layer
-   Central API handler/HOF
-   Authentication and RBAC wrappers
-   HMR-safe Prisma singleton
-   Structured application errors
-   Human-readable IDs
-   Rate limiting with graceful local-development degradation
-   Centralized role configuration
-   Branch-aware architecture
-   Large Prisma domain model
-   Audit logging foundation

## Current module state

  Module       Current State       Target
  ------------ ------------------- ------------------
  Auth         Done / foundation   Production-ready
  Reception    In Progress         Complete
  Doctor       In Progress         Complete
  Nurse        Stub                Complete
  Pharmacy     Stub                Complete
  Laboratory   Stub                Complete
  Radiology    Stub                Complete
  Inpatient    Stub                Complete
  Billing      In Progress         Complete
  Inventory    Stub                Complete
  HR           Stub                Complete
  Analytics    Stub                Complete
  Settings     Stub                Complete
  API v1       Stub/In Progress    Complete

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE DEVELOPMENT RULES

## Do

-   Inspect existing code before changing it.
-   Reuse existing services and utilities.
-   Keep API routes thin.
-   Put business logic in services.
-   Validate all external input.
-   Authorize on the server.
-   Scope branch-sensitive operations correctly.
-   Audit important clinical, financial, administrative, and security
    actions.
-   Use real database workflows.
-   Add loading, empty, and error states.
-   Keep the UI responsive.
-   Test important workflows.
-   Keep TypeScript/build clean.
-   Preserve existing architecture unless there is a demonstrated reason
    to change it.

## Do not

-   Rewrite the entire application.
-   Duplicate business logic.
-   Trust frontend-only authorization.
-   Use mock data as production functionality.
-   Expose raw Prisma/database errors.
-   Expose sensitive medical information unnecessarily.
-   Physically delete important clinical/financial history unless
    explicitly required.
-   Mark a feature complete because its page renders.
-   Build disconnected departmental modules.

------------------------------------------------------------------------

# 3. PHASE 0 --- BASELINE AND REPOSITORY AUDIT

**Goal:** Establish a clean, reproducible baseline before adding major
features.

## 3.1 Run

``` bash
npm install
npm run lint
npm run typecheck
npm run build
npx prisma validate
npx prisma generate
```

Also run the project's existing test command if present.

## 3.2 Record baseline

Create a short baseline note containing:

-   Current branch/commit
-   Node version
-   Package manager/version
-   Database status
-   Prisma status
-   Lint result
-   TypeScript result
-   Test result
-   Build result
-   Known runtime errors

## 3.3 Audit repository

Inspect:

``` text
src/app
src/components
src/config
src/lib
src/services
prisma
tests
```

Confirm:

-   Which routes are real
-   Which routes are stubs
-   Which services are real
-   Which APIs are connected
-   Which pages use mock data
-   Which Prisma models are actually used
-   Which integrations are configured
-   Which modules are incomplete

**Exit criteria:**

-   Baseline recorded
-   Repository inventory complete
-   No major unknowns about what is already implemented

------------------------------------------------------------------------

# 4. PHASE 1 --- FIX FOUNDATION BLOCKERS

Do these before building major modules.

## 4.1 Fix `AppError` argument order

Verify the constructor signature in `errors.ts`.

Fix the rate-limit invocation so:

``` text
message
code
statusCode
```

are passed in the correct order.

Then add a test proving a rate-limit failure returns a clean, consistent
error.

------------------------------------------------------------------------

## 4.2 Resolve missing `Message` model

The Prisma schema references:

``` text
messagesSent Message[]
messagesRecv Message[]
```

but the repository analysis reports no `Message` model.

Choose one:

-   Implement the `Message` model and relations, or
-   Remove the references if messaging is intentionally out of scope.

The target specification includes messaging, so implementation is the
preferred direction.

------------------------------------------------------------------------

## 4.3 Verify Prisma 7 datasource configuration

Do not blindly change Prisma configuration.

Verify the actual Prisma 7 configuration used by the repository and
ensure:

-   `prisma generate` works
-   migrations work
-   local development works
-   production configuration is clear
-   runtime `PgPool` configuration remains correct

------------------------------------------------------------------------

## 4.4 Fix ID generation

Fix:

-   `generateStaffId()` so `departmentCode` is either used correctly or
    removed from the function signature.
-   The module-level `YEAR` constant.

Year calculation should happen when the ID is generated, not when the
module is loaded.

Test year rollover behavior.

------------------------------------------------------------------------

## 4.5 Fix mental-health relations

Ensure:

``` text
Patient
 ├── PsychologicalAssessment
 │      └── assessor/staff relation
 └── TherapySession
        └── therapist/staff relation
```

Use proper Prisma relations and foreign keys.

Then verify privacy/authorization behavior for mental-health records.

------------------------------------------------------------------------

## 4.6 Database indexes

Review hot query paths.

At minimum inspect:

### Patient

-   branch
-   patient ID
-   phone
-   email
-   deletedAt

### Appointment

-   branch + date
-   doctor + date
-   patient + date
-   status + date

### Lab

-   patient
-   status
-   requested date
-   branch

### Invoice

-   patient + status
-   branch + status
-   invoice date

### Other high-volume models

Add indexes only when supported by actual query patterns.

**Exit criteria:**

``` bash
npx prisma validate
npx prisma generate
npm run typecheck
npm run build
```

all pass.

------------------------------------------------------------------------

# 5. PHASE 2 --- SECURITY / AUTHORIZATION FOUNDATION

**Goal:** Make the existing authentication system safe enough to support
every module.

## 5.1 Authentication

Verify:

-   Login
-   Logout
-   Session creation
-   Session expiry
-   Password handling
-   Password reset
-   Account creation
-   Disabled/inactive accounts

## 5.2 RBAC

Verify every role in the specification:

``` text
Super Administrator
Hospital Administrator
Doctor
Nurse
Receptionist
Laboratory Scientist
Radiologist
Pharmacist
Finance Officer
Surgeon
Psychologist
Obstetrician / Maternal Care Provider
Patient
System Administrator
```

The actual repository may use additional specialized roles.

## 5.3 Server-side authorization

Every protected API should follow:

``` text
Request
  ↓
Authenticate
  ↓
Authorize
  ↓
Validate
  ↓
Service
  ↓
Database
  ↓
Audit where required
  ↓
Response
```

Never depend on hiding UI controls.

## 5.4 Resource-level authorization

Verify that:

-   Patients can only access their own records.
-   Staff only access records permitted by their role.
-   Sensitive modules have stricter permissions.
-   Branch restrictions are enforced server-side.
-   Direct URL/API manipulation cannot bypass permissions.

## 5.5 Audit logging

Audit at minimum:

-   Login/logout
-   Patient creation/update
-   Patient record access
-   Clinical record modification
-   Prescription creation/modification
-   Lab result modification
-   Radiology report modification
-   Invoice creation
-   Payment
-   Refund
-   Staff changes
-   Permission changes
-   Settings changes

Do not put unnecessary sensitive medical data into audit logs.

**Exit criteria:**

-   Unauthorized API requests fail.
-   Unauthorized record access fails.
-   Cross-branch access fails where inappropriate.
-   Privileged actions are auditable.
-   RBAC/security tests exist.

------------------------------------------------------------------------

# 6. PHASE 3 --- UI FOUNDATION

Before building dozens of pages, make the design system reusable.

## Required UI primitives

At minimum:

``` text
Button
Input
Textarea
Select
Combobox
Checkbox
Radio
Switch
Dialog/Modal
Drawer
Dropdown
Badge
Avatar
Tabs
Tooltip
Popover
Calendar/Date Picker
Pagination
Table
Card
Skeleton
Alert
Toast
Form Field
Empty State
Error State
Loading State
Confirm Dialog
```

## Design rules

Official palette:

``` text
Lemon
Black
Grey
White
```

Lemon is the strategic action/accent color.

Do not turn the entire interface lemon.

Use semantic colors separately for:

``` text
Success
Warning
Error
Information
```

## UX rules

Every major page needs:

-   Loading state
-   Empty state
-   Error state
-   Success feedback
-   Confirmation for destructive actions
-   Responsive behavior
-   Keyboard accessibility
-   Visible focus states
-   Proper labels

**Exit criteria:**

Common UI patterns no longer need to be reinvented inside individual
pages.

------------------------------------------------------------------------

# 7. PHASE 4 --- PATIENT MANAGEMENT

**First major business module.**

## Patient registration

Implement:

-   Patient ID generation
-   Demographics
-   Contact information
-   Address
-   Emergency contact
-   Next of kin
-   Insurance
-   Allergies
-   Existing conditions
-   Relevant medical history

## Patient list

Implement:

-   Search
-   Pagination
-   Filters
-   Sorting
-   Branch scoping
-   Status
-   Registration date

## Patient profile

Create a unified patient workspace:

``` text
Overview
Demographics
Appointments
Visits
Diagnoses
Prescriptions
Laboratory
Radiology
Admissions
Surgery
Pregnancy
Mental Health
Billing
Payments
Documents
Consent
Timeline
```

## Patient timeline

Chronological events should include relevant:

``` text
Appointment
Visit
Diagnosis
Prescription
Lab Request
Lab Result
Radiology
Admission
Surgery
Payment
Follow-up
```

## Patient management definition of done

-   UI
-   API
-   Service
-   Prisma
-   Validation
-   Authorization
-   Search
-   Pagination
-   Loading/empty/error states
-   Audit
-   Responsive UI
-   Tests
-   Build/typecheck clean

------------------------------------------------------------------------

# 8. PHASE 5 --- APPOINTMENTS / RECEPTION

Build the front-desk workflow end-to-end.

## Appointment lifecycle

``` text
BOOKED
  ↓
CHECKED_IN
  ↓
WAITING
  ↓
IN_CONSULTATION
  ↓
COMPLETED
```

Alternative:

``` text
CANCELLED
NO_SHOW
RESCHEDULED
```

## Reception workflow

``` text
Registration
  ↓
Appointment / Walk-in
  ↓
Check-in
  ↓
Waiting Queue
  ↓
Triage
  ↓
Vitals
  ↓
Doctor Queue
```

## Features

-   Book appointment
-   Reschedule
-   Cancel
-   Confirm
-   Walk-in registration
-   Check-in
-   Queue
-   Doctor schedules
-   Department schedules
-   Daily calendar
-   Weekly calendar
-   Monthly calendar
-   Follow-up appointment

**Exit criteria:**

A receptionist can take a patient from registration/check-in to the
doctor's queue without manually manipulating the database.

------------------------------------------------------------------------

# 9. PHASE 6 --- NURSING / TRIAGE

Implement:

-   Patient queue
-   Triage
-   Vitals
-   Nursing notes
-   Admission handoff
-   Patient status

Vitals:

``` text
Temperature
Blood pressure
Heart rate
Respiratory rate
Oxygen saturation
Weight
Height
BMI
```

Workflow:

``` text
Waiting
  ↓
Nurse
  ↓
Vitals/Triage
  ↓
Doctor Queue
```

**Exit criteria:**

A real appointment can pass through reception → nursing → doctor.

------------------------------------------------------------------------

# 10. PHASE 7 --- DOCTOR / EMR

This is the core clinical workflow.

## Consultation

Implement:

-   Chief complaint
-   Symptoms
-   Vitals
-   Examination
-   Clinical notes
-   Diagnosis
-   Diagnosis type
-   Treatment plan
-   Prescription
-   Lab requests
-   Radiology requests
-   Follow-up
-   Attachments

## Treatment plan

Support:

-   Medication
-   Procedure
-   Lifestyle instruction
-   Follow-up
-   Investigation
-   Referral

## Clinical integrity

Clinical records should be treated carefully.

Do not allow ordinary users to silently overwrite historical clinical
information.

Prefer:

``` text
Create
Amend
Audit
Version/history where required
```

over unrestricted destructive updates.

**Exit criteria:**

A doctor can complete a real consultation and generate downstream
orders.

------------------------------------------------------------------------

# 11. PHASE 8 --- LABORATORY

## Workflow

``` text
Doctor Request
  ↓
Lab Queue
  ↓
Sample Collection
  ↓
Processing
  ↓
Result Entry
  ↓
Verification
  ↓
Report
  ↓
Doctor Notification
  ↓
Patient Access where permitted
```

## Features

-   Categories
-   Tests
-   Reference ranges
-   Requests
-   Sample status
-   Results
-   Abnormal indicators
-   Verification
-   Attachments
-   Reports
-   Printable reports
-   Patient history

## Security

Only authorized staff can:

-   Modify results
-   Verify results
-   Access sensitive attachments

------------------------------------------------------------------------

# 12. PHASE 9 --- RADIOLOGY

Support:

-   X-Ray
-   Ultrasound
-   Future CT/MRI extensibility
-   Imaging requests
-   Scheduling
-   Image uploads
-   Findings
-   Reports
-   Verification
-   Doctor notification

Workflow:

``` text
Request
  ↓
Scheduling
  ↓
Imaging
  ↓
Image Upload
  ↓
Radiologist Review
  ↓
Report
  ↓
Verification
  ↓
Doctor/Patient Access
```

Sensitive image/document storage must not be unrestricted public
storage.

------------------------------------------------------------------------

# 13. PHASE 10 --- PHARMACY

## Prescription lifecycle

``` text
Prescription Created
  ↓
Pharmacy Queue
  ↓
Pharmacist Review
  ↓
Availability Check
  ↓
Dispensing
  ↓
Inventory Deduction
  ↓
Completed
```

## Features

-   Medicine catalogue
-   Categories
-   Prescription queue
-   Verification
-   Dispensing
-   Inventory
-   Expiry
-   Low stock
-   Suppliers
-   Purchases
-   Stock movement
-   Returns

## Critical rule

Dispensing must update inventory transactionally.

Avoid:

``` text
Create prescription
...
separate unrelated stock update
```

Prefer one controlled business operation where the required changes
succeed/fail together.

------------------------------------------------------------------------

# 14. PHASE 11 --- BILLING / FINANCE

## Core workflow

``` text
Billable Service
  ↓
Invoice
  ↓
Payment
  ↓
Receipt
  ↓
Balance Update
```

## Features

-   Services/pricing
-   Invoice
-   Invoice items
-   Payments
-   Refunds
-   Receipts
-   Discounts
-   Insurance
-   Outstanding balances
-   Payment history
-   Reports

Currency:

``` text
NGN / ₦
```

## Payment integrations

Prepare architecture for:

-   Paystack
-   Flutterwave

Never trust the browser to declare a payment successful.

Use:

``` text
Payment initiation
  ↓
Provider
  ↓
Webhook / verification
  ↓
Server verification
  ↓
Transaction record
  ↓
Invoice reconciliation
  ↓
Receipt
```

------------------------------------------------------------------------

# 15. PHASE 12 --- ADMISSIONS / BEDS

Implement:

``` text
Ward
Room
Bed
Admission
Transfer
Discharge
```

Workflow:

``` text
Admission Decision
  ↓
Ward
  ↓
Room
  ↓
Bed
  ↓
Treatment
  ↓
Transfer
  ↓
Discharge
  ↓
Final Billing
```

Important invariant:

> Never assign an occupied bed.

This should be enforced in the service/database workflow, not merely
disabled in the UI.

------------------------------------------------------------------------

# 16. PHASE 13 --- SURGERY / THEATRE

Implement:

-   Surgery scheduling
-   Theatre availability
-   Surgical team
-   Pre-op assessment
-   Pre-op checklist
-   Procedure details
-   Surgeon
-   Assistants
-   Anaesthesia
-   Consumables
-   Post-op notes
-   Recovery
-   Follow-up

Maintain a complete surgical record.

------------------------------------------------------------------------

# 17. PHASE 14 --- MATERNAL / CHILD CARE

Implement:

## Pregnancy

-   Pregnancy record
-   Gravida
-   Para
-   EDD
-   Pregnancy history
-   Risk factors
-   ANC visits

## ANC

-   Maternal vitals
-   Symptoms
-   Examination
-   Investigations
-   Assessment
-   Treatment
-   Follow-up

## Delivery

-   Delivery record
-   Date
-   Delivery type
-   Maternal outcome
-   Baby details

## Child

-   Birth information
-   Growth
-   Medical history
-   Related visits

------------------------------------------------------------------------

# 18. PHASE 15 --- MENTAL HEALTH

Implement:

-   Psychological assessments
-   Mental health history
-   Therapy sessions
-   Counselling notes
-   Progress notes
-   Treatment plans
-   Follow-up

Apply stricter privacy/access controls where appropriate.

Verify authorization with explicit tests.

------------------------------------------------------------------------

# 19. PHASE 16 --- INVENTORY / SUPPLIERS

Support:

-   Medicines
-   Medical supplies
-   Consumables
-   Stock levels
-   Suppliers
-   Purchases
-   Stock additions
-   Stock deductions
-   Transfers
-   Returns
-   Expiry
-   Low-stock alerts

Every stock movement must be traceable.

Use an immutable transaction history where practical:

``` text
IN
OUT
TRANSFER
RETURN
ADJUSTMENT
```

------------------------------------------------------------------------

# 20. PHASE 17 --- COMMUNICATION / NOTIFICATIONS

## In-app

Support:

-   Appointment reminders
-   Lab results
-   Prescription updates
-   Payment confirmations
-   Admission updates
-   Announcements

## Email

Use Resend for appropriate transactional events:

-   Registration
-   Appointment confirmation
-   Appointment reminder
-   Appointment cancellation
-   Lab result notification
-   Payment receipt
-   Password reset

Do not spam users.

------------------------------------------------------------------------

# 21. PHASE 18 --- DOCUMENTS / CONSENT

Documents may include:

-   Medical reports
-   Lab reports
-   Radiology reports
-   Consent forms
-   Identification
-   Referral letters
-   Prescriptions
-   Discharge summaries

Implement:

``` text
Upload
 ↓
Validate
 ↓
Store
 ↓
Authorize
 ↓
Retrieve securely
 ↓
Audit access where appropriate
```

Never expose sensitive medical files through unrestricted public URLs.

------------------------------------------------------------------------

# 22. PHASE 19 --- GLOBAL SEARCH

Implement `CMD/CTRL + K`.

Search authorized records:

``` text
Patients
Staff
Appointments
Visits
Invoices
Medicines
Documents
Lab Requests
Radiology
Admissions
```

Search must respect RBAC and branch restrictions.

------------------------------------------------------------------------

# 23. PHASE 20 --- ANALYTICS

## Administration

-   Total patients
-   New patients
-   Appointments
-   Revenue
-   Outstanding balances
-   Admissions
-   Bed occupancy
-   Department performance

## Clinical

-   Visits
-   Diagnoses
-   Follow-ups
-   Lab activity
-   Radiology activity

## Pharmacy

-   Dispensing
-   Inventory
-   Low stock
-   Expiring medicines

## Finance

-   Revenue
-   Payments
-   Refunds
-   Outstanding invoices
-   Daily/weekly/monthly performance

Charts must answer operational questions, not merely decorate the
dashboard.

------------------------------------------------------------------------

# 24. PHASE 21 --- SETTINGS / ADMINISTRATION

Implement:

-   Hospital information
-   Departments
-   Staff
-   Roles
-   Permissions
-   Branches
-   Working hours
-   Consultation fees
-   Services
-   System settings
-   Notifications
-   Audit logs
-   Branding

------------------------------------------------------------------------

# 25. PHASE 22 --- PATIENT PORTAL

Patient features:

``` text
Dashboard
Profile
Appointments
Book consultation
Online consultation
Medical timeline
Lab results
Radiology reports
Prescriptions
Billing
Payments
Documents
Notifications
Follow-ups
```

Critical authorization rule:

``` text
Patient A
   X
Patient B's records
```

Test this directly at the API level.

------------------------------------------------------------------------

# 26. PHASE 23 --- ONLINE CONSULTATION

Build after the core clinical workflow is reliable.

Support:

-   Appointment scheduling
-   Video
-   Audio
-   Chat
-   Consultation record
-   Digital prescriptions
-   Follow-up

The online consultation should create a real clinical encounter where
appropriate, not exist as a disconnected video link.

------------------------------------------------------------------------

# 27. PHASE 24 --- API STANDARDIZATION

All API routes should follow a consistent pattern:

``` text
Authenticate
   ↓
Authorize
   ↓
Validate
   ↓
Service
   ↓
Database
   ↓
Audit
   ↓
Response
```

Use:

``` text
/api/v1/...
```

Keep API routes thin.

Business logic belongs in services.

Use consistent success/error response shapes.

------------------------------------------------------------------------

# 28. PHASE 25 --- PERFORMANCE

Review:

-   Pagination
-   Database indexes
-   Prisma select/include usage
-   N+1 queries
-   Server Components
-   React Query caching
-   Lazy loading
-   Image optimization
-   Code splitting
-   Large tables
-   Dashboard queries

Avoid fetching entire tables.

------------------------------------------------------------------------

# 29. PHASE 26 --- TESTING

## Unit tests

Test:

-   ID generation
-   Validation
-   Permission logic
-   Business rules
-   Financial calculations
-   Queue transitions
-   Inventory calculations

## Integration tests

Test:

-   Services
-   APIs
-   Prisma operations
-   Authorization
-   Transactions

## E2E tests

At minimum:

``` text
Registration
Login
Patient creation
Appointment booking
Check-in
Triage
Consultation
Prescription
Laboratory workflow
Radiology workflow
Billing
Pharmacy
Admission
```

## Security tests

Explicitly test:

``` text
RBAC
Unauthorized access
IDOR
Privilege escalation
Cross-branch access
Input validation
Sensitive document access
```

------------------------------------------------------------------------

# 30. PHASE 27 --- PRODUCTION HARDENING

Before production:

## Infrastructure

-   Production PostgreSQL
-   Secure environment variables
-   Cloud storage
-   Email
-   Redis/rate limiting
-   Monitoring
-   Logging
-   Backups
-   Migrations
-   Disaster recovery

## Security

Verify:

-   HTTPS
-   Secure cookies
-   Session security
-   Rate limiting
-   File upload restrictions
-   Input validation
-   Error sanitization
-   XSS protection
-   SQL injection protection
-   IDOR protection
-   Privilege escalation protection
-   Secret management

## Observability

Verify:

-   Sentry
-   Server error logging
-   Important business event logging
-   Audit logs
-   Health checks
-   Database monitoring

------------------------------------------------------------------------

# 31. FINAL DEFINITION OF DONE

A module is **NOT DONE** because:

``` text
[ ] Page exists
[ ] Button exists
[ ] Table renders
```

A module is DONE only when:

``` text
[ ] UI exists
[ ] API exists where required
[ ] Service exists
[ ] Database interaction works
[ ] Validation exists
[ ] Authorization exists
[ ] Branch scoping works where applicable
[ ] Loading state exists
[ ] Empty state exists
[ ] Error state exists
[ ] Success feedback exists
[ ] Audit logging exists where appropriate
[ ] Responsive design works
[ ] Accessibility considered
[ ] Tests exist where appropriate
[ ] No TypeScript errors
[ ] No build errors
[ ] No obvious security vulnerability
[ ] No production mock data
[ ] Real workflow works end-to-end
```

------------------------------------------------------------------------

# 32. END-TO-END ACCEPTANCE TEST

The system should eventually allow this complete journey:

``` text
PATIENT
  ↓
Registration
  ↓
Appointment / Walk-in
  ↓
Check-in
  ↓
Waiting Queue
  ↓
Nurse / Triage
  ↓
Vitals
  ↓
Doctor
  ↓
Consultation
  ↓
Diagnosis
  ↓
Treatment Plan
  ├──────────────┐
  ↓              ↓
Prescription     Investigation
  ↓              ├── Laboratory
Pharmacy         └── Radiology
  ↓
Billing
  ↓
Payment
  ↓
Receipt
  ↓
Follow-up
  ↓
Visit Completion
```

Then verify that the patient's timeline contains the appropriate events
and that each department can only see what it is authorized to see.

------------------------------------------------------------------------

# 33. IMPLEMENTATION ORDER --- MASTER CHECKLIST

Work through this list in order.

## Foundation

-   [ ] Repository baseline
-   [ ] AppError fix
-   [ ] Message model
-   [ ] Prisma configuration verified
-   [ ] ID generation fixes
-   [ ] Mental-health relations
-   [ ] Database indexes
-   [ ] Typecheck clean
-   [ ] Prisma generate clean
-   [ ] Build clean

## Security

-   [ ] Authentication audit
-   [ ] RBAC audit
-   [ ] Resource authorization
-   [ ] Branch authorization
-   [ ] Audit logging
-   [ ] Security tests

## UI

-   [ ] Dialog
-   [ ] Badge
-   [ ] Select
-   [ ] Tabs
-   [ ] Skeleton
-   [ ] Pagination
-   [ ] Date picker
-   [ ] Dropdown
-   [ ] Empty state
-   [ ] Error state
-   [ ] Loading state
-   [ ] Confirm dialog
-   [ ] Accessibility pass

## Core hospital

-   [ ] Patient registration
-   [ ] Patient search
-   [ ] Patient profile
-   [ ] Patient timeline
-   [ ] Appointment booking
-   [ ] Scheduling
-   [ ] Check-in
-   [ ] Waiting queue
-   [ ] Triage
-   [ ] Vitals
-   [ ] Doctor queue
-   [ ] Consultation
-   [ ] EMR
-   [ ] Diagnosis
-   [ ] Treatment plan

## Clinical downstream

-   [ ] Prescriptions
-   [ ] Laboratory
-   [ ] Radiology
-   [ ] Pharmacy
-   [ ] Inventory

## Hospital operations

-   [ ] Billing
-   [ ] Payments
-   [ ] Receipts
-   [ ] Admissions
-   [ ] Beds
-   [ ] Surgery
-   [ ] Maternal care
-   [ ] Mental health

## Platform

-   [ ] Documents
-   [ ] Consent
-   [ ] Notifications
-   [ ] Email
-   [ ] Global search
-   [ ] Analytics
-   [ ] Settings
-   [ ] Staff portals
-   [ ] Patient portal

## Online healthcare

-   [ ] Online appointment
-   [ ] Video
-   [ ] Audio
-   [ ] Chat
-   [ ] Digital prescription
-   [ ] Follow-up

## Quality

-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] E2E tests
-   [ ] Security tests
-   [ ] Performance review
-   [ ] Accessibility review
-   [ ] Responsive review
-   [ ] Production configuration
-   [ ] Backup/restore test
-   [ ] Disaster recovery plan
-   [ ] Final security review
-   [ ] Final build
-   [ ] Final deployment

------------------------------------------------------------------------

# 34. RULE FOR MOVING BETWEEN PHASES

Do not jump ahead because a page is visually impressive.

Move forward when the current workflow is actually usable.

For example:

``` text
Patient Management
        ↓
must work
        ↓
Appointments
        ↓
must work
        ↓
Reception/Queue
        ↓
must work
        ↓
Nursing
        ↓
must work
        ↓
Doctor/EMR
```

This creates a real hospital workflow instead of disconnected screens.

------------------------------------------------------------------------

# 35. PRIORITY IF TIME IS LIMITED

If development time becomes constrained, prioritize:

## P0 --- Must work

``` text
Authentication
RBAC
Patients
Appointments
Reception
Queue
Triage
Vitals
Doctor consultation
EMR
Prescriptions
Billing
Audit logging
```

## P1 --- Core hospital operations

``` text
Laboratory
Radiology
Pharmacy
Inventory
Admissions
```

## P2 --- Extended clinical departments

``` text
Surgery
Maternal care
Mental health
```

## P3 --- Platform expansion

``` text
Patient portal
Analytics
Global search
Notifications
Documents
```

## P4 --- Future capabilities

``` text
Online consultation
Mobile apps
AI assistance
Advanced predictive analytics
Multi-branch expansion
```

------------------------------------------------------------------------

# 36. FINAL TARGET

The finished AMC-HMS should feel like **one product**.

A patient should not repeatedly provide the same information.

A receptionist should start the patient journey.

A nurse should continue it.

A doctor should continue it.

Lab/radiology/pharmacy should receive the appropriate downstream work.

Finance should understand the billable activity.

Administration should understand hospital operations.

The patient should eventually be able to continue interacting with the
hospital online.

The system should prioritize:

**PATIENT SAFETY**

**DATA SECURITY**

**CLINICAL ACCURACY**

**OPERATIONAL EFFICIENCY**

**PATIENT EXPERIENCE**

**ACCOUNTABILITY**

**SCALABILITY**

**RELIABILITY**

**MODERN DESIGN**

------------------------------------------------------------------------

# 37. CURRENT NEXT ACTION

Do **not** start another major module yet.

Start with:

``` text
1. Run repository baseline
2. Fix foundation blockers
3. Verify Prisma/schema
4. Verify authorization
5. Verify audit logging
6. Make the build/typecheck clean
7. Complete Patient Management
8. Complete Reception + Appointments
9. Complete Nursing/Triage
10. Complete Doctor/EMR
```

After those ten steps, AMC-HMS will have its first real end-to-end
clinical workflow.

Then continue department by department.

**Healing Minds, Restoring Lives.**

**Unmatched Care. A Class Apart.**

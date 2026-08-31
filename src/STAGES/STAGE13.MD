# 🏥 ACCURATE MEDICAL CENTER HMS

# STAGE 13 — OPERATIONAL WORKFLOW COMPLETION, GLOBAL SEARCH & MODULE INTEGRATION

## AI CODING AGENT

You are working inside the existing Accurate Medical Center Hospital Management System (HMS).

Use the existing codebase as the source of truth.

This project has already completed Stages 1–12.

Your job is to implement **STAGE 13 ONLY**.

This is NOT a rewrite.

This is NOT a redesign.

This is NOT permission to modify the database recklessly.

The objective is to take the existing HMS foundation and connect the remaining partially implemented modules into coherent, usable operational workflows.

---

# 1. CRITICAL RULES

Before touching any code:

## INSPECT FIRST

Inspect the current repository and determine the actual state after Stage 12.

Do not assume that an item is still incomplete simply because an older audit said so.

Verify:

* current files
* current services
* current API routes
* current Prisma schema
* current dashboard implementations
* current UI components
* current authentication
* current RBAC
* current branch isolation
* current Stage 12 changes

If Stage 12 already implemented something described below, DO NOT recreate it.

Build on the current implementation.

---

# 2. ABSOLUTE DATABASE SAFETY

During Stage 13:

## DO NOT RUN

```bash
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push
npx prisma migrate reset
```

Do not:

* DROP tables
* TRUNCATE tables
* wipe the database
* delete existing production records
* reset the database
* replace seed data
* recreate the database
* modify production data

The existing database contains real application state and must be preserved.

### Allowed

```bash
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run build
```

You may perform safe SELECT/read operations for verification.

---

# 3. DO NOT MODIFY THE EXISTING ID SYSTEM

The existing identity architecture is authoritative.

Patient:

```text
AMC-PT-XXXXXX
```

Staff:

```text
AMC-ST-XXXXXX
```

Appointment:

```text
AMC-APT-XXXXXX
```

Do not revert to:

```text
COUNT(*) + 1
```

Do not create another ID generator.

Do not modify the SystemSetting sequence mechanism unless a genuine defect is discovered.

---

# 4. DO NOT REPLACE EXISTING ARCHITECTURE

Preserve:

* Better Auth
* Prisma
* existing Prisma adapter
* existing RBAC
* existing API middleware
* existing branch isolation
* existing AuditService
* existing services
* existing validation architecture
* existing React Query/data-fetching approach
* existing UI component library

Do not introduce:

* another authentication system
* another ORM
* another database
* another state-management architecture
* duplicate services
* duplicate API layers

Reuse what already exists.

---

# 5. STAGE 13 OBJECTIVES

Stage 13 focuses on:

1. Global search
2. Clinical workflow integration verification
3. Patient record/document integration
4. Laboratory → patient record integration
5. Radiology → patient record integration
6. HR operational completion
7. Inventory operational completion
8. Inpatient workflow completion
9. Analytics/reporting completion
10. Notification architecture preparation
11. Error handling and UX consistency
12. Automated integration-test foundation
13. Production-readiness audit

---

# 6. GLOBAL SEARCH

## Current state

The topbar contains a search input but the Stage 11 audit identified that the search functionality was not wired to an API.

First inspect the current implementation.

If still incomplete, implement:

```text
GET /api/v1/search
```

or an appropriately scoped existing search endpoint if one already exists.

---

# SEARCH REQUIREMENTS

Search should support the HMS's major operational entities where the current schema/services permit:

* Patients
* Staff
* Appointments
* Invoices
* Clinical records where appropriate

Search should support human-readable identifiers:

```text
AMC-PT-000001
AMC-ST-000001
AMC-APT-000001
```

and useful human fields such as:

* patient name
* staff name
* email
* appointment information

---

# SEARCH SECURITY

This is extremely important.

Search must NEVER become an IDOR vulnerability.

A user must only receive records they are authorized to see.

Apply:

* authentication
* RBAC
* branch isolation
* existing access-control helpers

A PATIENT must never be able to search the entire hospital database.

A staff member must only see records permitted by their role and branch.

Do not expose:

* passwords
* password hashes
* authentication secrets
* private medical information unnecessarily

---

# SEARCH UI

Wire the existing topbar search input to the API.

Use:

* debounce
* loading state
* empty state
* error state
* result dropdown
* keyboard-friendly navigation where practical

Clicking a result should navigate to the appropriate existing record page.

Do not create pages that do not already fit the HMS architecture unless necessary.

---

# 7. CLINICAL WORKFLOW — FULL END-TO-END VERIFICATION

The HMS must operate as an actual hospital workflow.

Verify the following sequence against the real codebase:

```text
PATIENT
   ↓
Registration
   ↓
Patient ID
   ↓
Appointment
   ↓
Check-in
   ↓
Clinical Visit
   ↓
Nurse Queue
   ↓
Vitals
   ↓
Doctor Queue
   ↓
Consultation
   ↓
Diagnosis
   ↓
Prescription / Laboratory / Radiology
   ↓
Pharmacy / Laboratory / Radiology
   ↓
Billing
   ↓
Payment
   ↓
Patient Record / Timeline
```

Inspect every transition.

Do not merely verify that each page exists.

Verify that IDs and database records actually flow from one stage to the next.

---

# 8. NURSE WORKFLOW

Verify:

```text
Reception check-in
        ↓
Clinical Visit
        ↓
Nurse Queue
        ↓
Open patient
        ↓
Record vitals
        ↓
Save vitals
        ↓
Visit becomes ready for doctor
```

Check:

* correct patient
* correct visit
* correct branch
* correct nurse authorization
* vitals persisted
* audit event where appropriate
* doctor queue reflects the updated state

If any connection is broken, fix it.

Do not rewrite the entire clinical system.

---

# 9. DOCTOR WORKFLOW

Verify:

```text
Doctor Queue
      ↓
Patient
      ↓
Clinical Visit
      ↓
Consultation
      ↓
Diagnosis
      ↓
Treatment
      ↓
Prescription
      ↓
Lab request
      ↓
Radiology request
      ↓
Complete consultation
```

Ensure the doctor sees only authorized patients/visits.

Ensure doctor identity is resolved server-side.

Do not trust arbitrary doctor IDs from the browser.

---

# 10. PATIENT TIMELINE

Inspect the existing patient timeline.

It should present meaningful clinical history where available.

Verify whether it correctly combines:

* appointments
* visits
* vitals
* consultations
* diagnoses
* prescriptions
* laboratory results
* radiology results
* billing/payment information where appropriate

If the timeline currently only displays a subset, improve it using existing services/models.

Do not expose confidential information beyond the authenticated patient's authorization.

---

# 11. DOCUMENT / MEDIA INTEGRATION

The existing project contains:

* Cloudinary
* FileService
* upload/delete infrastructure

But the Stage 11 audit found that the infrastructure was not integrated into actual patient records.

First inspect whether Stage 12 already changed this.

If still incomplete, integrate document/media handling into the appropriate workflows.

Potential use cases:

### Patient documents

Allow authorized staff to attach relevant documents to a patient record.

### Laboratory

Allow authorized users to attach laboratory-related documents/results where the schema supports this.

### Radiology

Allow authorized users to attach radiology images/documents/reports where supported.

---

# SECURITY REQUIREMENTS FOR FILES

Medical files are sensitive.

Do not make medical files publicly accessible merely because Cloudinary is being used.

Verify:

* authorization before upload
* authorization before retrieval
* authorization before deletion
* patient/branch ownership
* secure URLs/access strategy
* no exposure of unrelated files

Do not expose Cloudinary credentials to the browser.

---

# 12. HR MODULE

Inspect:

```text
src/app/(dashboard)/hr
src/services/hr.service.ts
```

Determine exactly what exists.

Complete the operational HR functionality that is already supported by the existing schema/services.

Priorities:

* staff listing
* staff status
* departments
* shift assignment
* schedule visibility
* staff search/filter
* branch restrictions

Do not invent payroll functionality unless the current project already defines it.

The goal is operational HR, not a separate payroll product.

---

# 13. INVENTORY MODULE

Inspect the existing:

* inventory service
* inventory APIs
* inventory UI
* pharmacy integration

Make the inventory workflow coherent.

At minimum verify:

```text
Inventory
   ↓
Stock item
   ↓
Stock quantity
   ↓
Adjustment
   ↓
Pharmacy dispensing
   ↓
Stock reduction
```

Where supported by the existing schema:

* stock levels
* stock adjustments
* low-stock indication
* item search
* inventory history
* pharmacy consumption

Do not invent complex warehouse functionality unless required by the current schema.

---

# 14. PHARMACY INTEGRATION

Verify:

```text
Doctor prescription
       ↓
Pharmacy
       ↓
Dispensing
       ↓
Inventory reduction
       ↓
Prescription status
```

Ensure dispensing cannot silently succeed without appropriate inventory behavior if the existing architecture expects stock tracking.

Preserve existing authorization.

Preserve audit logging.

---

# 15. LABORATORY INTEGRATION

Verify:

```text
Doctor consultation
      ↓
Lab request
      ↓
Laboratory queue
      ↓
Processing
      ↓
Result
      ↓
Patient record
```

Ensure the status lifecycle is coherent.

Where the schema supports it, verify:

* pending
* processing
* completed
* cancelled

Do not invent enum values without checking the schema.

Lab results must belong to the correct patient/visit/request.

---

# 16. RADIOLOGY INTEGRATION

Verify:

```text
Doctor
 ↓
Radiology request
 ↓
Radiology queue
 ↓
Study/report
 ↓
Patient record
```

Ensure:

* correct patient
* correct requesting doctor
* correct branch
* status tracking
* report persistence
* patient visibility according to authorization

Integrate file/media functionality if supported.

---

# 17. INPATIENT / WARD WORKFLOW

Inspect the existing inpatient service and UI.

Complete the operational admission flow supported by the existing database.

Target workflow:

```text
Patient
 ↓
Admission
 ↓
Ward
 ↓
Bed
 ↓
Inpatient care
 ↓
Discharge
```

Verify:

* admission creation
* ward assignment
* bed assignment if schema supports it
* active admission
* discharge
* patient record linkage
* branch isolation

Do not invent unsupported bed-management features.

Use the current schema as the source of truth.

---

# 18. BILLING & PAYMENT VERIFICATION

The existing audit says billing and payments are functional.

Do NOT rewrite them.

Verify that the clinical workflow correctly reaches billing.

Verify:

```text
Service / Consultation
       ↓
Invoice
       ↓
Invoice items
       ↓
Payment
       ↓
Invoice status
```

Check:

* invoice totals
* payment state
* patient ownership
* branch
* audit logging

Do not introduce a payment gateway in Stage 13 unless one already exists.

Payment gateway work remains a separate future production task if required.

---

# 19. ANALYTICS & REPORTING

Inspect:

```text
src/services/reporting.service.ts
src/app/(dashboard)/analytics
```

Use existing reporting APIs.

Replace placeholder charts/cards where practical with real metrics already supported by the service/database.

Possible metrics:

* patient registrations
* appointments
* consultations
* laboratory activity
* pharmacy activity
* revenue
* admissions

Respect RBAC.

Financial reporting must never be visible to unauthorized roles.

Do not fabricate statistics.

---

# 20. NOTIFICATIONS — ARCHITECTURE

The Stage 3.5 audit explicitly stated that the notification bell was disabled because no real in-app notification system existed.

Do NOT fake notifications.

First inspect whether the current schema already contains a notification model after Stage 12.

If there is still no notification model:

DO NOT invent an implementation that violates the existing database-safety constraints.

Instead:

1. Document the exact requirements for the future notification system.
2. Identify the events that should generate notifications.
3. Identify which roles/users should receive them.
4. Identify the required schema changes.
5. Identify required API endpoints.
6. Identify whether real-time delivery is required.
7. Keep the current UI honest.

Potential future events:

* appointment created
* appointment changed
* appointment cancelled
* lab result completed
* radiology report completed
* prescription ready
* invoice generated
* payment received
* inpatient admission
* discharge

The bell must never display fake unread counts.

If the notification system is already implemented by Stage 12, verify it instead of documenting it as future work.

---

# 21. ERROR HANDLING

Inspect API error handling across the newly integrated workflows.

User-facing errors should be:

* clear
* actionable
* non-technical

Do not display:

```text
TypeError...
PrismaClientKnownRequestError...
stack traces...
database connection strings...
```

to users.

Server logs may contain appropriate technical information.

Maintain correct HTTP status codes:

* 400 validation
* 401 unauthenticated
* 403 unauthorized
* 404 missing resource
* 409 conflict
* 500 unexpected server failure

Do not convert authorization failures into generic 500 errors.

---

# 22. LOADING / EMPTY / ERROR STATES

For every API-backed page touched during Stage 13:

### Loading

Show skeleton or loading indicator.

### Empty

Show an honest empty state.

### Error

Show an understandable error with retry where appropriate.

### Success

Display actual database data.

Never use fake data to make a page appear functional.

---

# 23. AUDIT LOGGING

Preserve the existing AuditService.

Do not create a second logging mechanism.

For newly integrated mutation workflows, verify that existing important events are audited.

Examples:

* document uploaded
* document deleted
* inventory adjustment
* admission
* discharge
* lab result
* radiology report
* prescription dispensing

Only add new audit actions if the existing architecture requires them and the action type can be safely supported.

Do not break existing audit typing.

---

# 24. AUTOMATED TEST FOUNDATION

Inspect whether the repository already has:

* Vitest
* Jest
* Playwright
* Cypress
* other test tooling

Do not introduce multiple testing frameworks.

If an existing framework exists, add focused tests for the highest-risk operational workflows.

Priority:

### Patient

```text
registration → patient profile
```

### Staff

```text
staff creation → staff profile
```

### Appointment

```text
appointment creation → ID → conflict protection
```

### Clinical

```text
visit → vitals → consultation
```

### Security

```text
cross-branch access → rejected
unauthorized role → rejected
```

### ID generation

Verify sequential IDs remain unique.

Do not perform destructive tests against production.

Use mocks/test database/isolated environment according to the existing project architecture.

---

# 25. SECURITY AUDIT

Perform a focused security review of everything touched in Stage 13.

Verify:

* authentication
* RBAC
* branch isolation
* IDOR
* server-side ownership checks
* patient self-scope
* doctor self-scope
* file authorization
* no password exposure
* no secret exposure
* no client-controlled privilege escalation

Search for suspicious patterns such as:

```text
userId from request body
patientId from request body used as authorization
doctorId from request body used as authorization
branchId from request body overriding session branch
role from request body
password returned in API response
```

Do not automatically change legitimate use cases; inspect context first.

---

# 26. PERFORMANCE

Do not make unnecessary N+1 database queries.

For dashboard/search/list endpoints:

* paginate large datasets
* use existing Prisma relations efficiently
* select only necessary fields
* avoid loading passwords
* avoid loading large medical documents unnecessarily

Search should be debounced on the client.

Do not over-engineer caching unless the project already uses a caching strategy.

---

# 27. MOBILE RESPONSIVENESS

Verify the workflows touched in Stage 13 on mobile layouts.

Pay particular attention to:

* search
* patient records
* clinical queue
* tables
* dialogs
* file upload
* billing
* pharmacy
* inpatient

The existing Stage 3.5 mobile navigation overlay fix must remain intact.

Do not reintroduce the old Tailwind animation bug.

---

# 28. DOCKER / LOCAL DEVELOPMENT

Inspect the current Docker setup.

If this remains:

```yaml
version: '3.8'
```

and it is still generating the obsolete Compose warning, remove the obsolete `version` field only if doing so is safe and unrelated to application behavior.

Do not redesign Docker.

Remember:

```bash
docker compose up
```

may use an existing built image.

After source changes, use:

```bash
docker compose up --build
```

when Docker verification is necessary.

---

# 29. ENVIRONMENT / SECRETS

Never hardcode:

* database passwords
* Better Auth secrets
* Cloudinary secrets
* Redis tokens
* API keys
* production credentials

Do not print secrets in the final report.

If you encounter credentials in source code, do not reproduce them in the report.

---

# 30. PRODUCTION-READINESS REVIEW

At the end of Stage 13, perform a structured production-readiness audit.

Review:

### Application

* build
* TypeScript
* Prisma
* API routes
* dashboards
* workflows
* error handling

### Security

* authentication
* RBAC
* branch isolation
* IDOR
* secrets
* file access

### Database

* schema consistency
* indexes where obvious
* relationships
* data preservation

### Infrastructure

* environment variables
* Docker
* Redis
* Cloudinary
* deployment configuration

### Observability

Determine whether the project has:

* error monitoring
* health checks
* logging
* uptime monitoring

Do not pretend these exist if they do not.

Document remaining production infrastructure work.

---

# 31. ANDROID / PLAY STORE

The Android application is part of the overall HMS delivery scope but is NOT to be implemented as a side effect of Stage 13.

Do not create an Android application during this stage unless the current repository already contains one and Stage 13 specifically requires verification.

The future mobile application should consume the same secure HMS APIs.

The eventual production scope includes:

```text
Android HMS application
       ↓
Existing HMS API
       ↓
Better Auth / secure session
       ↓
Same database
```

Play Store release remains a separate production track involving:

* Android app development
* API integration
* mobile authentication
* permissions
* secure storage
* app signing
* release build
* Play Console setup
* store listing
* privacy policy
* production testing
* Play Store submission

Do not claim Play Store completion during Stage 13.

---

# 32. NO PAYMENT GATEWAY IN STAGE 13

Do not add Paystack, Flutterwave, Stripe, or another payment gateway unless it already exists in the current repository and merely requires verification.

Payment gateway integration is a separate production task.

---

# 33. NO MAJOR SCHEMA CHANGES

Stage 13 should prioritize using the existing schema.

If you discover that a required feature genuinely cannot be completed without a schema change:

STOP before modifying the schema.

Document:

```text
FEATURE
WHY CURRENT SCHEMA IS INSUFFICIENT
PROPOSED SCHEMA CHANGE
DATA MIGRATION RISK
PRODUCTION IMPACT
```

Do not silently modify Prisma schema.

Do not run migration commands.

---

# 34. BUILD VERIFICATION

At the end run:

```bash
npx prisma validate
```

Then:

```bash
npx prisma generate
```

Then:

```bash
npx tsc --noEmit
```

Then:

```bash
npm run build
```

All must pass.

If something fails:

1. identify the real cause
2. fix it
3. rerun the failed command
4. continue until clean

Do not stop at "the code looks correct."

---

# 35. FINAL MANUAL TEST MATRIX

Test as many of these as the current environment allows:

| Workflow                    | Expected |
| --------------------------- | -------- |
| Login                       | PASS     |
| Logout                      | PASS     |
| Public patient registration | PASS     |
| Patient profile             | PASS     |
| Admin patient creation      | PASS     |
| Staff creation              | PASS     |
| Appointment creation        | PASS     |
| Appointment conflict        | PASS     |
| Check-in                    | PASS     |
| Nurse queue                 | PASS     |
| Vitals                      | PASS     |
| Doctor queue                | PASS     |
| Consultation                | PASS     |
| Prescription                | PASS     |
| Laboratory request          | PASS     |
| Laboratory result           | PASS     |
| Radiology request           | PASS     |
| Radiology report            | PASS     |
| Pharmacy dispensing         | PASS     |
| Inventory adjustment        | PASS     |
| Billing                     | PASS     |
| Payment                     | PASS     |
| Inpatient admission         | PASS     |
| Inpatient discharge         | PASS     |
| Patient timeline            | PASS     |
| Global search               | PASS     |
| RBAC                        | PASS     |
| Branch isolation            | PASS     |
| IDOR protection             | PASS     |
| Mobile navigation           | PASS     |

Mark anything not testable as:

```text
NOT VERIFIED
```

Do not mark it PASS without evidence.

---

# 36. FINAL REPORT FORMAT

When Stage 13 is finished, provide a report with exactly these sections:

## 1. Executive Summary

Explain what Stage 13 accomplished.

## 2. Files Changed

List every modified/new file.

## 3. Features Completed

List features that became fully operational.

## 4. Features Already Working

Separate existing functionality from new Stage 13 work.

## 5. APIs Added

List new endpoints.

## 6. APIs Modified

List modified endpoints.

## 7. Services Reused

List existing services reused instead of duplicated.

## 8. Security Verification

Report:

* authentication
* RBAC
* branch isolation
* IDOR
* file security
* secret handling

## 9. Database Safety

Explicitly state:

```text
Schema modified: NO
Prisma migration: NO
Prisma db push: NO
Database reset: NO
Destructive operation: NO
Existing records preserved: YES
```

## 10. Build Results

Report exact results:

```text
prisma validate: PASS/FAIL
prisma generate: PASS/FAIL
tsc --noEmit: PASS/FAIL
npm run build: PASS/FAIL
```

## 11. Manual Verification

Use PASS / FAIL / NOT VERIFIED.

## 12. Remaining HMS Work

Be completely honest.

List every significant feature still required before production.

## 13. Production Blockers

Separate actual blockers from optional enhancements.

## 14. Recommended Stage 14

Based ONLY on the actual state discovered after Stage 13, recommend the next stage.

Do not invent work that has already been completed.

---

# 37. DEFINITION OF DONE

Stage 13 is complete only when:

* Global search is functional or its exact blocker is documented.
* Clinical workflows have been verified end-to-end.
* Patient records correctly connect to clinical activity.
* Laboratory workflow is verified.
* Radiology workflow is verified.
* Pharmacy/inventory relationship is verified.
* Inpatient workflow is verified.
* HR functionality is assessed and completed where supported.
* Analytics uses real data where supported.
* Document/media integration is completed where safely supported.
* Notification status is honestly represented.
* Security has been rechecked.
* Existing RBAC remains intact.
* Branch isolation remains intact.
* Existing IDs remain intact.
* Existing audit system remains intact.
* Mobile behavior remains intact.
* No destructive database operation has occurred.
* Prisma schema has not been silently changed.
* TypeScript passes.
* Prisma validation passes.
* Production build passes.
* Manual verification has been performed.
* Remaining production work is clearly documented.

---

# MOST IMPORTANT INSTRUCTION

DO NOT DECLARE THE HMS "PRODUCTION READY" SIMPLY BECAUSE:

```text
npm run build
```

passes.

A clean build only proves that the application compiles.

Production readiness requires:

```text
UI
 ↓
API
 ↓
AUTHORIZATION
 ↓
SERVICE
 ↓
DATABASE
 ↓
REAL WORKFLOW
```

to work correctly.

The purpose of Stage 13 is to turn the existing technically sound foundation into a more completely integrated operational HMS.

Inspect first.
Implement second.
Verify third.
Report honestly.



DO NOT deploy.
DO NOT run destructive database commands.
DO NOT reset the database.
DO NOT use prisma migrate reset.
DO NOT use DROP TABLE, TRUNCATE, or any destructive operation.

The objective of Stage 4 is to turn the existing Accurate Medical Center HMS from a collection of implemented pages/APIs into a coherent, usable hospital operational system.

IMPORTANT:
Before changing anything, inspect the existing codebase, Prisma schema, services, API routes, authentication/RBAC, audit system, and current UI.

Do NOT assume functionality exists merely because a page or button exists.

Do NOT create duplicate services or duplicate business logic where an authoritative service already exists.

Reuse the existing architecture:
- Prisma
- Better Auth
- PatientService
- StaffService
- AppointmentService
- IdGeneratorService
- AuditService
- existing RBAC/withRole mechanisms
- existing branch isolation
- existing Zod validation
- existing API structure
- existing Shadcn UI components

==================================================
PART 1 — CURRENT STATE AUDIT
==================================================

Before implementation, inspect and report:

1. Patient management
2. Staff management
3. Appointment management
4. Reception workflows
5. Doctor workflows
6. Nurse workflows
7. Laboratory
8. Pharmacy
9. Radiology
10. Inpatient/wards
11. Billing/finance
12. Inventory
13. HR/scheduling
14. Analytics/reporting
15. Settings
16. Audit logging
17. Notifications
18. Authentication
19. Authorization/RBAC
20. Branch/multi-tenancy
21. Public patient registration
22. Patient identity generation
23. Staff identity generation
24. Appointment identity generation

For each module classify functionality as:

- WORKING
- PARTIALLY WORKING
- UI ONLY
- API ONLY
- BROKEN
- NOT IMPLEMENTED

Do not guess.

==================================================
PART 2 — PATIENT JOURNEY
==================================================

The HMS must support a complete patient lifecycle.

Expected flow:

PUBLIC PATIENT:

/register
↓
Better Auth account
↓
Patient profile
↓
Server-generated Patient ID
AMC-PT-XXXXXX
↓
Audit event
↓
Patient dashboard

ADMIN/RECEPTION:

Register/find patient
↓
Patient profile
↓
Patient ID
↓
Audit event
↓
Appointment/visit

Verify that all patient creation paths eventually use ONE authoritative PatientService.

Creation paths include:

1. Public /register
2. Admin registration
3. Reception registration
4. Any public appointment flow that creates a patient
5. Any other patient creation endpoint discovered during audit

There must be no duplicated patient creation implementation.

Verify:
- unique Patient ID
- permanent Patient ID
- server-side generation
- branch assignment
- audit log
- timestamps
- patient count
- patient search
- patient profile
- patient history

==================================================
PART 3 — STAFF MANAGEMENT
==================================================

Admin/Super Admin must be able to manage hospital staff.

Verify and implement where missing:

- Create staff
- Staff ID generation
- Role assignment
- Department assignment
- Specialization
- Staff profile
- Staff search
- Staff status
- Staff listing
- Staff details
- Audit history
- Branch assignment
- Doctor/nurse/admin/etc. role handling

Staff IDs must use the existing authoritative identity mechanism:

AMC-ST-XXXXXX

Do not allow the browser to supply the authoritative Staff ID.

Staff creation must preserve Better Auth integration.

Do not create duplicate authentication accounts.

==================================================
PART 4 — APPOINTMENT MANAGEMENT
==================================================

The appointment system must support the actual hospital workflow.

Verify:

- Appointment ID
- Patient selection
- Doctor selection
- Department
- Date
- Time
- Appointment type
- Reason
- Status
- Branch
- Audit event

Appointment ID:

AMC-APT-XXXXXX

Verify that appointment creation paths all use the authoritative AppointmentService.

Paths include:

1. Admin
2. Reception
3. Public appointment request
4. Walk-in
5. Any other appointment API discovered

Implement missing functionality required for:

- booking
- rescheduling
- cancellation
- confirmation
- check-in
- queue management
- appointment status

Do not duplicate appointment business logic across pages.

==================================================
PART 5 — RECEPTION WORKFLOW
==================================================

The reception desk should be operational.

Expected workflow:

Search patient
↓
If existing → open patient
↓
If new → register patient
↓
Patient receives Patient ID
↓
Book appointment / create visit
↓
Check patient in
↓
Patient enters queue
↓
Doctor/Nurse sees patient

Implement missing pieces required to make this workflow coherent.

Reception staff must not need access to Super Admin functionality.

Respect RBAC.

==================================================
PART 6 — DOCTOR WORKFLOW
==================================================

The doctor should have a complete clinical workflow.

Expected:

Doctor login
↓
Today's queue
↓
Select patient
↓
Open encounter/visit
↓
Review patient history
↓
Vitals
↓
Consultation
↓
Diagnosis
↓
Clinical notes
↓
Prescription if required
↓
Laboratory request if required
↓
Radiology request if required
↓
Complete consultation

Inspect the existing:

- visit APIs
- consultation APIs
- vitals APIs
- prescription APIs
- laboratory APIs
- radiology APIs

Connect existing pieces where necessary.

Do not invent duplicate clinical models if the Prisma schema already supports the required data.

==================================================
PART 7 — NURSE WORKFLOW
==================================================

Expected:

Nurse login
↓
Queue / assigned patients
↓
Open patient
↓
Record vitals
↓
Review relevant information
↓
Update nursing workflow/status
↓
Pass patient to doctor/next stage

Verify the existing nurse pages and APIs.

Fix broken UI/API connections.

==================================================
PART 8 — LABORATORY
==================================================

Laboratory workflow should support:

Doctor/authorized staff request
↓
Lab request
↓
Patient
↓
Test
↓
Status
↓
Sample/process workflow
↓
Result
↓
Authorized result entry
↓
Doctor/patient access where appropriate

Inspect existing Laboratory models, services and APIs.

Implement only what is required by the existing architecture.

Ensure audit logging for important actions.

==================================================
PART 9 — RADIOLOGY
==================================================

Expected:

Request
↓
Patient
↓
Study/request
↓
Radiology workflow
↓
Report
↓
Completion
↓
Doctor access

Inspect existing radiology APIs/models/pages.

Connect missing pieces.

==================================================
PART 10 — PHARMACY
==================================================

Expected:

Prescription
↓
Pharmacy receives prescription
↓
Verify medication availability
↓
Dispense
↓
Update inventory
↓
Record dispensing event
↓
Billing integration where supported

Verify:

- prescriptions
- pharmacy inventory
- dispensing
- stock reduction
- audit
- patient medication history

Do not implement unsafe medication logic beyond what the existing HMS requirements support.

==================================================
PART 11 — INVENTORY
==================================================

Inventory must support hospital stock management.

Verify:

- items
- categories
- stock
- stock adjustments
- receiving
- dispensing
- low-stock awareness
- stock history
- branch
- audit trail

Stock-changing operations must be server-side.

Avoid client-side authoritative stock calculations.

==================================================
PART 12 — INPATIENT / WARDS
==================================================

Verify inpatient workflow:

Admission
↓
Patient
↓
Ward
↓
Bed/room if supported
↓
Admission status
↓
Clinical care
↓
Discharge

Inspect existing:

- inpatient admissions
- wards
- patient relationships
- clinical workflows

Implement missing connections without changing the schema unless absolutely necessary.

If schema changes are required, STOP and report them before modifying the schema.

==================================================
PART 13 — BILLING / FINANCE
==================================================

Inspect the existing billing implementation.

Verify:

- invoices
- invoice IDs
- patient relationship
- services
- charges
- payments
- payment status
- receipts
- audit
- reporting

Ensure financial calculations are server-authoritative.

Do not allow the browser to determine final payable amounts.

If the system already has receipt ID generation, preserve it.

==================================================
PART 14 — HR / STAFF SCHEDULING
==================================================

Verify:

- staff
- departments
- shifts
- schedules
- attendance-related functionality if already represented
- branch
- role

Ensure staff scheduling does not expose administrative functions to unauthorized roles.

==================================================
PART 15 — ADMIN DASHBOARD
==================================================

The Admin Dashboard must stop being primarily a collection of empty states.

It should provide meaningful operational information.

At minimum investigate whether the dashboard can display:

- Total patients
- New patients
- Total staff
- Doctors
- Nurses
- Today's appointments
- Pending appointments
- Completed appointments
- Active admissions
- Pending lab requests
- Pending radiology requests
- Pending prescriptions
- Revenue/financial summary where authorized
- Low inventory alerts
- Recent audit activity

IMPORTANT:

Do not fabricate numbers.

All dashboard statistics must come from real database queries.

Respect branch isolation and role permissions.

==================================================
PART 16 — PATIENT IDENTITY / COUNTERS
==================================================

Verify the Stage 3 identity system.

Patient:

AMC-PT-000001

Staff:

AMC-ST-000001

Appointment:

AMC-APT-000001

Verify:

- server-side generation
- uniqueness
- concurrency safety
- SystemSetting counters
- transaction handling
- no COUNT()+1 generation remains
- no browser-generated authoritative IDs
- legacy data compatibility

DO NOT reset counters.

DO NOT overwrite existing IDs.

DO NOT recreate existing records.

==================================================
PART 17 — AUDIT / ACTIVITY LOGGING
==================================================

The HMS must have a trustworthy audit trail.

Use the existing AuditLog/AuditService.

Do NOT create another audit system.

Important actions should be auditable, including:

- patient registration
- patient updates
- staff creation
- staff changes
- appointment creation
- appointment changes
- clinical actions
- lab requests/results
- radiology requests/reports
- prescriptions
- dispensing
- invoices
- payments
- inventory changes
- admissions/discharges
- settings changes
- authentication/security-sensitive events where supported

Audit records should contain the existing supported context:

- user
- role
- action
- resource
- resourceId
- details
- branch
- IP/user-agent where supported
- timestamp

==================================================
PART 18 — NOTIFICATIONS
==================================================

Stage 3.5 established that the notification bell is currently decorative/unimplemented.

Do NOT simply pretend notifications work.

First inspect what is required by the existing HMS.

Determine whether a real notification system should be implemented now.

If implemented, it should support appropriate hospital events such as:

- appointment reminders/status changes
- new appointment requests
- lab result availability
- radiology report availability
- prescription/dispensing status
- administrative alerts
- inventory alerts
- system/security alerts

Use server-side notification creation.

Do not create fake unread counts.

If the architecture requires a Prisma Notification model/schema change, STOP and report the required schema change before making it.

==================================================
PART 19 — SEARCH / STORAGE / RECORD COUNTS
==================================================

The HMS must be able to answer basic administrative questions.

Verify that administrators can determine:

- how many patients exist
- how many registered this month
- how many registered today
- how many staff exist
- staff by role
- appointments by status
- appointments today
- admissions
- laboratory workload
- radiology workload
- pharmacy workload
- revenue where authorized
- inventory status

Use database queries.

Do not count records from browser-rendered lists.

For large datasets use proper pagination.

Implement search/filter/pagination where missing.

==================================================
PART 20 — SECURITY
==================================================

Perform a security review of the operational workflows.

Verify:

- authentication
- RBAC
- SUPER_ADMIN
- ADMIN
- DOCTOR
- NURSE
- RECEPTION
- PATIENT
- other roles present in schema

Verify branch isolation.

Verify users cannot manipulate another branch's records.

Verify server-side authorization.

Verify patient data is not exposed through unauthorized endpoints.

Verify IDs cannot be supplied to override server-generated identities.

Verify sensitive fields are not unnecessarily returned to browsers.

Verify API validation.

Verify audit logging.

==================================================
PART 21 — MOBILE RESPONSIVENESS
==================================================

Stage 3.5 fixed the Sheet/Dialog overlay issue.

Now inspect the entire HMS on mobile layouts.

Verify:

- hamburger navigation
- drawer open/close
- no stale overlays
- forms fit screen
- tables are usable
- dialogs fit mobile screens
- buttons are reachable
- no horizontal overflow
- dashboard cards adapt
- patient/staff/appointment workflows remain usable

Do not reintroduce tailwindcss-animate assumptions that caused the Stage 3.5 issue.

==================================================
PART 22 — ERROR / LOADING / EMPTY STATES
==================================================

Every major workflow should have:

- loading state
- success feedback
- validation errors
- API errors
- empty state
- retry where appropriate

Do not display generic:

"An unexpected error occurred"

when the application can safely provide a useful error message.

Never expose secrets or internal stack traces.

==================================================
PART 23 — DATA INTEGRITY
==================================================

Review all creation/update operations for:

- transactions
- foreign keys
- unique constraints
- duplicate prevention
- race conditions
- branch isolation
- orphan records

Do not use COUNT()+1 for authoritative IDs.

Do not create duplicate users.

Do not create duplicate patient profiles.

Do not create duplicate appointments accidentally on retries.

Where appropriate, make operations idempotent.

==================================================
PART 24 — DOCKER / LOCAL DEVELOPMENT
==================================================

Verify the local Docker development environment.

The current environment uses:

- PostgreSQL
- Redis
- Next.js web container

Verify that:

docker compose up -d

starts correctly.

Verify:

docker compose ps

shows healthy DB/Redis and running web.

The obsolete docker-compose.yml "version" warning may be cleaned up if safe.

Do not make unrelated infrastructure changes.

==================================================
PART 25 — PRODUCTION READINESS REVIEW
==================================================

After the operational implementation, inspect:

- environment variables
- production URLs
- Better Auth configuration
- database configuration
- Redis
- Cloudinary
- error handling
- security
- logging
- build
- static/dynamic routes
- API endpoints
- secrets exposure
- health endpoint
- database connectivity
- production data safety

Remember that production credentials were previously exposed during development.

Do NOT print secrets in reports.

Do NOT commit .env.local.

Do NOT put credentials into source code.

==================================================
IMPLEMENTATION RULES
==================================================

1. Inspect first.
2. Report findings.
3. Implement in logical groups.
4. Reuse existing services.
5. Do not duplicate business logic.
6. Do not invent database models unnecessarily.
7. Do not change Prisma schema unless required.
8. If schema change is required, STOP and report it before proceeding.
9. Do not run destructive database commands.
10. Do not deploy.
11. Do not reset production/local databases.
12. Do not delete existing data.
13. Do not overwrite existing patient/staff/appointment IDs.
14. Preserve existing authentication.
15. Preserve RBAC.
16. Preserve branch isolation.
17. Preserve audit infrastructure.

==================================================
VERIFICATION
==================================================

After implementation run:

npx prisma validate

npx prisma generate

npm run build

If appropriate, also perform safe non-destructive checks of:

- API routes
- authentication
- patient registration
- staff creation
- appointment creation
- dashboard statistics
- audit logging

Do NOT run:

prisma migrate reset
prisma db push

unless explicitly authorized later.

Do NOT deploy.

==================================================
FINAL REPORT
==================================================

At the end provide:

1. What was inspected
2. What was already working
3. What was broken
4. What was implemented
5. Files changed
6. APIs changed
7. Services changed
8. Database/schema impact
9. Security changes
10. Patient workflow status
11. Staff workflow status
12. Appointment workflow status
13. Reception workflow status
14. Doctor workflow status
15. Nurse workflow status
16. Laboratory status
17. Radiology status
18. Pharmacy status
19. Inventory status
20. Inpatient status
21. Billing status
22. HR status
23. Dashboard status
24. Audit status
25. Notification status
26. Mobile status
27. Production-readiness status
28. Remaining work

Clearly classify every area:

✅ COMPLETE
🟡 PARTIAL
🔴 NOT IMPLEMENTED
🔴 BROKEN

Finally report the exact result of:

npx prisma validate
npx prisma generate
npm run build

STOP after the report.

DO NOT DEPLOY.

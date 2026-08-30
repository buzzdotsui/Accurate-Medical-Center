# STAGE 4.0 — SERVER-SIDE 500 ERROR INVESTIGATION & CREATION FLOW REPAIR

## Objective

The frontend buttons are now functioning and opening/submitting their forms correctly.

However, actual creation requests are returning HTTP 500 errors.

Current browser errors:

```text
POST http://localhost:3000/api/v1/patients 500 (Internal Server Error)

POST http://localhost:3000/api/v1/hr/staff 500 (Internal Server Error)
```

This means the UI event handlers are working. The remaining problem is somewhere in the server-side request pipeline.

DO NOT guess at the cause.

Perform a complete forensic investigation and fix the actual root causes.

---

# 1. FIRST: INSPECT THE RUNNING ENVIRONMENT

The application is currently running through Docker Compose.

Expected containers:

```text
accuratemedicalcenter-web-1
accuratemedicalcenter-db-1
accuratemedicalcenter-redis-1
```

Before modifying application code, inspect:

```bash
docker compose ps
docker compose logs web --tail=300
```

If necessary:

```bash
docker logs accuratemedicalcenter-web-1 --tail=300
```

Determine the exact server-side exception generated when:

1. Admin attempts to register a patient.
2. Admin attempts to add a staff member.

Do NOT rely on the browser's generic 500 message.

The actual server exception is the source of truth.

---

# 2. TRACE PATIENT CREATION END-TO-END

Investigate:

```text
/admin/patients
        ↓
Register Patient dialog
        ↓
POST /api/v1/patients
        ↓
authentication/session
        ↓
RBAC
        ↓
branch resolution
        ↓
validation
        ↓
PatientService.createPatient()
        ↓
IdGeneratorService.generatePatientId()
        ↓
SystemSetting sequence
        ↓
Patient INSERT
        ↓
AuditService.log()
        ↓
HTTP response
```

Inspect all relevant files, including but not limited to:

```text
src/app/api/v1/patients/route.ts
src/services/patient.service.ts
src/lib/utils/generate-id.ts
src/lib/security/*
src/lib/auth/*
src/lib/validations/patient.ts
src/services/audit.service.ts
prisma/schema.prisma
```

Determine EXACTLY where the 500 originates.

---

# 3. TRACE STAFF CREATION END-TO-END

Investigate:

```text
/admin/staff
        ↓
Add Staff Member dialog
        ↓
POST /api/v1/hr/staff
        ↓
authentication/session
        ↓
RBAC
        ↓
branch resolution
        ↓
validation
        ↓
StaffService.createStaff()
        ↓
IdGeneratorService.generateStaffId()
        ↓
SystemSetting sequence
        ↓
Better Auth user creation
        ↓
Staff INSERT
        ↓
AuditService.log()
        ↓
HTTP response
```

Inspect:

```text
src/app/api/v1/hr/staff/route.ts
src/services/staff.service.ts
src/lib/utils/generate-id.ts
src/lib/auth/*
src/lib/validations/staff.ts
src/services/audit.service.ts
prisma/schema.prisma
```

Determine EXACTLY where the 500 originates.

---

# 4. VERY IMPORTANT — CHECK THE ID GENERATOR

Stage 3 introduced:

```text
IdGeneratorService
```

using:

```sql
SELECT ... FOR UPDATE
```

against:

```text
SystemSetting
```

with sequence keys such as:

```text
seq_patient
seq_staff
seq_appointment
```

Verify that the implementation works with the ACTUAL Prisma 7 client and the ACTUAL PostgreSQL schema.

Specifically verify:

* Does the SystemSetting row exist?
* If it does not exist, does the generator safely create it?
* Is the JSON value shape correct?
* Is `current` read correctly?
* Is the increment atomic?
* Is the transaction client used correctly?
* Does Prisma 7 accept the raw query being used?
* Is the table name actually `SystemSetting` / `system_settings` in PostgreSQL?
* Does the generated ID remain unique?
* Does the transaction commit correctly?

Do not assume the sequence row already exists.

If the application expects the sequence row to exist but nothing creates it, fix that safely.

Do NOT reset or delete existing data.

---

# 5. CHECK DATABASE STATE

Safely inspect the current database.

Do NOT run:

```text
prisma migrate reset
prisma db push
DROP TABLE
TRUNCATE
DELETE
```

Do not perform destructive operations.

Use read-only inspection where possible.

Determine:

* Existing Patient records
* Existing Staff records
* Existing SystemSetting records
* Existing AuditLog records
* Existing User records
* Existing Branch records
* Existing Department records

Pay particular attention to:

```text
SystemSetting
```

and whether these keys exist:

```text
seq_patient
seq_staff
seq_appointment
```

If they are missing, determine whether the application should initialize them automatically in a transaction rather than requiring a destructive/database-reset operation.

---

# 6. CHECK FOR PRISMA 7 INCOMPATIBILITIES

The project uses:

```text
Prisma 7.9.1
```

Verify that all recently modified Prisma operations are compatible with the current Prisma version.

Pay particular attention to:

```text
$transaction
$queryRaw
Prisma.PatientUncheckedCreateInput
SystemSetting
AuditLog
User
Staff
Branch
```

Do not blindly rewrite working Prisma infrastructure.

Only change code where the investigation proves it is responsible for the 500.

---

# 7. CHECK AUTHENTICATION AND RBAC

Verify the current session while running on:

```text
http://localhost:3000
```

Make sure the browser is not accidentally communicating with:

```text
https://accurate-medical.vercel.app
```

The local application must use local authentication/session cookies.

Verify:

```text
session.user.id
session.user.role
session.user.branchId
```

for admin/staff operations.

The server must determine authoritative identity and branch information.

The browser must NOT be trusted to supply:

```text
patientId
staffId
appointmentId
userRole
branch ownership
```

---

# 8. CHECK BRANCH RESOLUTION

Patient and staff creation must have a valid branch.

Verify the current branch-resolution logic.

For admin creation:

```text
branchId
```

should be derived from the authenticated user's authorized context unless the user's role explicitly permits selecting another branch.

Do not allow:

```text
undefined
null
invalid branch ID
unauthorized branch ID
```

to reach Prisma.

If the database currently contains the seeded HQ branch:

```text
Accurate Medical Center - HQ
code: HQ
```

verify that the creation workflows correctly resolve it.

---

# 9. CHECK VALIDATION

The project uses Zod 4.

The previous Stage 3.5 investigation already discovered that:

```typescript
z.string().cuid()
```

is invalid in this project's Zod 4 setup.

Do another audit of the creation schemas for obsolete Zod APIs.

Check:

```text
patient.ts
staff.ts
appointment.ts
clinical.ts
vitals.ts
consultation.ts
```

Do not reintroduce `.cuid()`.

Validation failures should produce appropriate 400 responses, NOT generic 500 errors.

---

# 10. CHECK ERROR HANDLING

The APIs currently appear to be converting server exceptions into generic:

```text
500 Internal Server Error
```

Make sure expected application errors are correctly classified.

For example:

```text
400 → validation failure
401 → unauthenticated
403 → unauthorized
404 → resource not found
409 → duplicate/conflict
500 → genuine unexpected server failure
```

The API response should provide a useful development-safe message.

Do NOT expose:

* database passwords
* secrets
* tokens
* stack traces
* internal credentials

to the browser.

For local development, server logs should contain the full diagnostic information.

---

# 11. PATIENT CREATION REQUIREMENTS

After fixing the issue, admin patient creation must result in:

```text
Patient
├── permanent primary key
├── permanent Patient ID
├── branch
├── profile data
└── audit event
```

Patient ID format:

```text
AMC-PT-000001
```

or the next available sequence.

The browser must never generate the authoritative Patient ID.

The server must generate it.

The creation path must use:

```text
PatientService.createPatient()
```

as the authoritative patient creation service.

Do NOT duplicate patient creation logic inside the API route.

---

# 12. STAFF CREATION REQUIREMENTS

After fixing the issue, admin staff creation must result in:

```text
Better Auth User
+
Staff Profile
+
Permanent Staff ID
+
Branch association
+
Department association where applicable
+
Audit event
```

Staff ID format:

```text
AMC-ST-000001
```

or the next available sequence.

The server must generate the Staff ID.

Do NOT accept a browser-generated authoritative Staff ID.

---

# 13. APPOINTMENT CREATION

Do not unnecessarily modify appointment functionality during this investigation.

However, verify that the Stage 3 identity changes did not introduce a similar failure into:

```text
createAppointment
requestPublicAppointment
createWalkIn
```

Appointment IDs must remain:

```text
AMC-APT-000001
```

or the next available sequence.

Only modify appointment code if an actual defect is discovered.

---

# 14. AUDIT LOGGING

Every successful patient creation must produce an audit event.

Every successful staff creation must produce an audit event.

Use the existing:

```text
AuditService
AuditLog
```

infrastructure.

Do NOT create another audit system.

Verify that the audit event is associated with:

```text
action
resource
resourceId
userId
userRole
branchId
createdAt
```

where supported by the existing schema.

---

# 15. TRANSACTION SAFETY

Patient creation must remain atomic.

Staff creation must remain atomic.

If a transaction fails:

```text
Patient/User/Staff record
+
ID sequence
+
audit event
```

must not be left in an inconsistent state.

Do not consume an ID if the surrounding transaction ultimately rolls back.

Do not implement a naive:

```text
count() + 1
```

solution.

Do not use random IDs for the authoritative human-readable IDs.

---

# 16. TEST THE ACTUAL APPLICATION

After fixing the root cause:

Restart/rebuild the local application as required.

Then manually test:

### Test A — Patient

Open:

```text
http://localhost:3000/admin/patients
```

Click:

```text
Register Patient
```

Create a test patient.

Confirm:

```text
HTTP 200/201
Patient appears in list
AMC-PT-XXXXXX exists
No duplicate ID
Audit log exists
```

### Test B — Staff

Open:

```text
http://localhost:3000/admin/staff
```

Click:

```text
Add Staff Member
```

Create a test staff member.

Confirm:

```text
HTTP 200/201
Staff appears in list
AMC-ST-XXXXXX exists
User exists
Staff profile exists
Audit log exists
```

### Test C — Public registration

Open:

```text
http://localhost:3000/register
```

Register a test patient.

Confirm:

```text
Better Auth User
+
Patient profile
+
AMC-PT-XXXXXX
+
Audit event
```

Confirm no orphan account is produced.

---

# 17. CHECK THE DASHBOARD BUTTON

The main dashboard currently has an "Add Staff Member" action.

Verify whether this button:

1. Opens the staff creation dialog.
2. Uses the same authoritative staff creation API.
3. Has correct permissions.
4. Does not use duplicated creation logic.
5. Displays useful success/error feedback.

If the dashboard button is not supposed to create staff directly, replace it with the correct administrative action/navigation rather than leaving a dead button.

Do not simply hide the problem.

---

# 18. DO NOT IMPLEMENT NOTIFICATIONS YET

Stage 3.5 established that the notification bell is currently intentionally disabled because there is no complete notification infrastructure.

Do NOT invent or partially implement notifications in Stage 4.0.

Leave it as:

```text
Coming soon
```

until the dedicated notification stage.

---

# 19. DO NOT DEPLOY

This stage is LOCAL ONLY.

Do NOT:

```text
deploy to Vercel
deploy to production
modify Supabase production data
run migrations against production
push database schema changes
```

Do not run destructive database commands.

---

# 20. REQUIRED FINAL REPORT

At the end, report:

## Root Cause

Exactly what caused:

```text
POST /api/v1/patients → 500
POST /api/v1/hr/staff → 500
```

Do not say "fixed" without identifying the actual exception.

## Files Changed

List every modified file and why.

## Database

State whether the database schema changed.

State whether any database records were created during testing.

State whether any destructive command was executed.

## Patient Flow

Confirm:

```text
/register
→ Better Auth
→ PatientService
→ Patient ID
→ Patient
→ AuditLog
```

## Staff Flow

Confirm:

```text
Admin
→ API
→ StaffService
→ Staff ID
→ Better Auth User
→ Staff
→ AuditLog
```

## Verification

Run:

```bash
npx prisma validate
npx prisma generate
npm run build
```

All must pass.

Also report the HTTP result of actual patient and staff creation tests.

---

# STOP CONDITION

Do NOT proceed to the broader Stage 4 HMS operational features until:

```text
POST /api/v1/patients
```

and

```text
POST /api/v1/hr/staff
```

successfully create records locally.

The objective of Stage 4.0 is to make the existing creation infrastructure reliable before building additional HMS workflows on top of it.

STOP after reporting the results.

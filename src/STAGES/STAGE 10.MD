Perform a comprehensive pre-production test of the Accurate Medical Center HMS.

DO NOT deploy.

Test:

AUTHENTICATION
- login
- logout
- role authorization

PATIENT
- public registration
- Patient ID generation
- audit logging
- admin search
- admin management

STAFF
- staff creation
- Staff ID
- Better Auth account
- Staff profile
- role assignment
- department
- authorization

APPOINTMENTS
- appointment creation
- Appointment ID
- patient selection
- doctor selection
- scheduling conflicts
- cancellation
- audit logging

ADMIN DASHBOARD
- patient counts
- staff counts
- appointment counts
- recent activity
- audit logs

SECURITY
- unauthorized API access
- IDOR
- sensitive data exposure
- password exposure
- role escalation

DATABASE
- Prisma validation
- relational integrity

Run:

npx prisma validate
npx prisma generate
npm run build

Report every failure.

Do not deploy.
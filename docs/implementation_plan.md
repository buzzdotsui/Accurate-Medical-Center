# Phase 1: Fix Foundation Blockers

Based on the `AMC-HMS-IMPLEMENTATION.md` roadmap and the repository audit, we need to resolve several foundational blockers before moving on to building out full features. This plan addresses Phase 1.

## User Review Required

> [!IMPORTANT]
> These changes touch the core database schema and utility functions used globally. Please review the proposed changes, especially the new `Message` model and the new database indexes, to ensure they align with your vision before I execute them.

## Proposed Changes

### Database & Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/USER/Accurate%20Medical%20Center/prisma/schema.prisma)
1. **Fix Datasource Config:** Add `url = env("DATABASE_URL")` to the `datasource` block so that `prisma generate` and `prisma migrate` work natively.
2. **Add `Message` Model:** The `User` model references `messagesSent` and `messagesRecv`, but the `Message` model does not exist. I will create a standard `Message` model for internal hospital communication (sender, receiver, subject, body, read status, timestamps).
3. **Fix Mental Health Relations:**
   - Update `PsychologicalAssessment` to properly relate `assessorId` to the `Staff` model.
   - Update `TherapySession` to properly relate `patientId` to the `Patient` model, and `therapistId` to the `Staff` model.
   - Add the inverse relations (`psychAssessments`, `therapySessions`) to the `Staff` and `Patient` models.
4. **Add Composite Indexes:** Add indexes on high-volume query paths to prevent future table scans:
   - `Patient`: `@@index([branchId])`, `@@index([patientId])`, `@@index([phone, email])`
   - `Appointment`: `@@index([branchId, date])`, `@@index([doctorId, date])`, `@@index([patientId, date])`
   - `LabRequest`: `@@index([patientId])`, `@@index([status])`, `@@index([branchId, createdAt])`
   - `Invoice`: `@@index([patientId, status])`, `@@index([branchId, status])`

### Utilities & Core Setup

#### [MODIFY] [generate-id.ts](file:///c:/Users/USER/Accurate%20Medical%20Center/src/lib/utils/generate-id.ts)
1. **Fix `YEAR` scope:** Move the `const YEAR = new Date().getFullYear()` declaration from the module level to inside each ID generator function so that it evaluates correctly if the server crosses into a new year.
2. **Fix `generateStaffId`:** Update this function to correctly utilize the `departmentCode` argument when generating the ID (e.g., `DOC-CARDIO-2026-0005` instead of dropping it).

#### [MODIFY] [rate-limit.ts](file:///c:/Users/USER/Accurate%20Medical%20Center/src/lib/security/rate-limit.ts)
1. **Fix `AppError` Argument Order:** Change the thrown error to match the `AppError` signature: `constructor(message, code, statusCode)`. The current implementation passes the code first, which garbles the error response.

## Verification Plan

### Automated Checks
- Run `npx prisma validate` and `npx prisma format` to ensure the schema syntax is correct.
- Run `npx prisma generate` to ensure the Prisma Client builds successfully with the new models and relations.
- Run `npm run typecheck` to ensure the ID generator and rate limiter changes don't cause TypeScript errors.
- Run `npm run lint`.

### Manual Verification
- After generation, I will inspect the rate limiter manually or by reviewing the codebase to ensure it throws the correct error structure.

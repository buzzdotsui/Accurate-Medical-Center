# Accurate Medical Center - Architecture Guide

## Overview
Accurate Medical Center HMS is built on a monolithic Next.js 15 (App Router) architecture with a strong emphasis on Domain-Driven Design (DDD). It operates with a PostgreSQL database, Prisma ORM, and Redis for caching/rate-limiting.

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Next.js 15 Route Handlers (`/app/api`)
- **Database**: PostgreSQL 15 via Prisma 7 (`@prisma/adapter-pg`)
- **Caching**: Redis (Upstash)
- **Auth**: Better Auth

## Core Principles
1. **Domain Services**: All business logic lives in `src/services/`. API Routes (`src/app/api/...`) are extremely thin and only responsible for HTTP request/response parsing.
2. **Strict Validation**: Zod schemas (`src/lib/validations/`) protect every mutation boundary.
3. **Auditing**: Every critical mutation is logged via the asynchronous `AuditService`.
4. **Resilience**: The `withAuth` and `withRole` middlewares wrap API routes to trap Prisma exceptions (e.g., P2002 Unique Constraint) and return normalized JSON error responses.

## Sub-Systems
- **Mobile**: `apps/mobile/` contains the React Native (Expo) scaffolding for Patient/Doctor companion apps.
- **AI**: `src/services/ai.service.ts` provides strict wrappers around LLMs with mandatory clinical disclaimers.

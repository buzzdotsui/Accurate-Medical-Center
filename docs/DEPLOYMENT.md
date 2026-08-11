# Deployment Guide

This repository is fully containerized and ready for production deployment across AWS, DigitalOcean, or Vercel.

## Prerequisites
- Docker & Docker Compose
- PostgreSQL 15 Database (e.g., AWS RDS, Supabase, Neon)
- Redis Cache (e.g., Upstash)

## Environment Variables
Copy `.env.example` to `.env` and fill in all variables:
- `DATABASE_URL`
- `REDIS_URL`
- `BETTER_AUTH_SECRET`
- `RESEND_API_KEY`
- `CLOUDINARY_URL`

## Deploying via Docker Compose (VPS / Self-Hosted)

1. Clone the repository to your production server.
2. Ensure `.env` is fully populated.
3. Run the stack:
   ```bash
   docker-compose up -d --build
   ```
4. Run Prisma Migrations:
   ```bash
   docker-compose exec web npx prisma migrate deploy
   docker-compose exec web npx prisma db seed
   ```

## Deploying to Vercel
1. Connect the GitHub repository to Vercel.
2. Add all Environment Variables in the Vercel dashboard.
3. Build command: `npm run build`
4. Install command: `npm ci`
5. Vercel will automatically provision Serverless Functions for the API routes.

## Security Considerations
- The `next.config.ts` forces strict Content-Security-Policies (CSP).
- Ensure the production Load Balancer or Nginx Reverse Proxy terminates SSL securely.
- Upstash Redis automatically handles Rate Limiting (`src/lib/security/rate-limit.ts`) to prevent brute-force attacks on the Auth API.

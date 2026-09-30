# Corner Cafe

Landing page and operations app for Corner Cafe, a café in Sheger City, Ethiopia.

This project includes a customer-facing website with menu browsing, reservations, contact requests, and an owner dashboard for managing profile, menu, reservations, and inquiries.

## Features

- Public café landing page and information pages
- Menu browsing and empty-state support for unpublished menu data
- Reservation request flow
- Contact and inquiry submission
- Owner management dashboard for profile, menu, reservations, and inquiries
- Type-safe API layer generated from OpenAPI specs
- PostgreSQL-backed persistence with Drizzle ORM

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Clerk authentication for owner access
- Express API server
- PostgreSQL + Drizzle ORM
- Zod validation
- pnpm workspaces

## Repository Structure

- `artifacts/corner-cafe/` — customer-facing React application
- `artifacts/api-server/` — Express backend API
- `lib/api-spec/` — OpenAPI source and generated client/schema code
- `lib/db/` — database schema and related logic
- `scripts/` — workspace scripts
- `replit.md` — project notes and operational details

## Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL database

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set required environment variables for the API server:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/cornercafe"
   ```

3. Start the backend API:

   ```bash
   pnpm --filter @workspace/api-server run dev
   ```

4. Start the frontend app:

   ```bash
   pnpm --filter @workspace/corner-cafe run dev
   ```

## Useful Commands

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
```

## Notes

- The API server runs on port `5000`.
- The frontend Vite app runs on its default local development port.
- Public-facing details should be verified before publishing operational data such as hours or pricing.

## License

This project is currently private and intended for the Corner Cafe application workflow.

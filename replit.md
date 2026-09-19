# Corner Cafe

Corner Cafe is a public café website for the verified Sheger city listing, with a live menu, reservation requests, contact requests, story, hours, and directions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/corner-cafe` — customer-facing React + Vite website
- `artifacts/api-server/src/routes/corner-cafe.ts` — cafe, menu, reservation, and inquiry endpoints
- `lib/api-spec/openapi.yaml` — source of truth for the generated API client and Zod schemas
- `lib/db/src/schema/corner-cafe.ts` — PostgreSQL schema for profile, menu, reservations, and inquiries
- `artifacts/corner-cafe/src/index.css` — visual theme and motion tokens

## Architecture decisions

- Public café facts that were not verified from the provided map listing remain null or explicitly marked as needing confirmation instead of being invented.
- Reservations and inquiries are request-based and persist to PostgreSQL; the site does not claim a request is a confirmed booking.
- The public site uses generated OpenAPI hooks for every backend interaction.

## Product

- Visitors can learn about Corner Cafe, browse the current menu, request a table, send a message, and open map directions.
- The menu intentionally supports an empty state until the café's verified menu is entered.

## User preferences

No additional preferences recorded.

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`.
- Update the profile/menu records with verified café details before publishing customer-facing operating hours or pricing.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

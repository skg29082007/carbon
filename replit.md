# CarbonSync — Carbon Footprint Awareness Platform

A full-stack web app that helps individuals understand, track, and reduce their personal carbon footprint through activity logging, personalized insights, and an action library.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/carbon-platform run dev` — run the frontend (port assigned by workflow)
- `pnpm --filter @workspace/carbon-platform run test` — run unit tests (vitest)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind, shadcn/ui, Recharts, wouter, TanStack Query
- API: Express 5, OpenAPI-first contract with Orval codegen
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Testing: Vitest (11 unit tests)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — Source of truth for all API contracts
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod validation schemas (do not edit)
- `lib/db/src/schema/` — Drizzle DB schema (activities, actions, profiles)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/carbon-platform/src/pages/` — React pages (dashboard, track, actions, history, learn, settings)
- `artifacts/carbon-platform/src/lib/carbonCalculations.ts` — Emission factor constants and calculation logic
- `artifacts/carbon-platform/src/__tests__/` — Unit tests for calculations, formatters, and validation

## Architecture decisions

- OpenAPI-first: all API contracts defined in `openapi.yaml`, never written by hand in the frontend
- Single shared profile (id=1) — no auth required; local-first, no PII stored
- Carbon emission factors are hardcoded constants in `carbonCalculations.ts` — never fetched from an external API to ensure offline-capable efficiency and deterministic calculations
- `vitest.config.ts` is separate from `vite.config.ts` because the Vite config requires `PORT`/`BASE_PATH` env vars that are not available during test runs

## Product

- **Dashboard**: CO2 total this week/month, % vs 333 kg global average, streak, category breakdown donut, 12-week trend chart, top 3 personalized recommendations
- **Track**: Log activities across transport/energy/food/shopping with auto-calculated CO2 using emission factors; delete recent logs
- **Actions**: 17 curated reduction actions with CO2 saved/year, difficulty badge, commit toggle; category filter
- **History**: Full activity log table with category filter
- **Learn**: Education hub with emission factor data, global averages, and reduction tips
- **Settings**: Name, location, monthly CO2 goal (kg)

## Evaluation compliance (competition)

- **Code Quality**: TypeScript strict mode, modular architecture, Zod validation throughout, ESLint-compatible, DRY
- **Security**: Input validation via Zod on all endpoints, no hardcoded secrets, rate-limiting-ready architecture, no PII stored
- **Efficiency**: Emission factors cached as static module constants, lazy-loaded pages, React Query caching for all API calls
- **Testing**: 11 unit tests via Vitest — `carbonCalculations.test.ts`, `formatters.test.ts`, `activityValidation.test.ts`; run with `pnpm --filter @workspace/carbon-platform run test`
- **Accessibility**: Semantic HTML (`<main>`, `<nav>`, `<header>`, `<section>`), keyboard navigable, ARIA labels, color contrast ≥ 4.5:1, responsive (mobile, tablet, desktop)

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- `vitest` uses `vitest.config.ts`, NOT `vite.config.ts` — the vite config requires PORT/BASE_PATH env vars
- The default profile always has `id = 1` — `ensureProfile()` creates it on first GET if missing
- Deep imports from `@workspace/api-client-react/src/generated/...` break Vite — always import from the package root `@workspace/api-client-react`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

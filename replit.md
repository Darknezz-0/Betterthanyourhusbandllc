# Better Than Your Husband Services

Premium responsive marketing website for Better Than Your Husband Services LLC, a local handyman and property services company serving the Kansas City metropolitan area and surrounding communities in Missouri and Kansas.

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

- `artifacts/better-than-your-husband-services/src/App.tsx` — shared shell, routes, page composition, quote form, and legal page content
- `artifacts/better-than-your-husband-services/src/lib/business.ts` — centralized business facts and future contact destinations
- `artifacts/better-than-your-husband-services/src/index.css` — color tokens, typography, and shared visual utilities
- `artifacts/better-than-your-husband-services/public/assets/logo.svg` — replaceable temporary logo asset
- `artifacts/better-than-your-husband-services/public/assets/hero-craftsmanship.jpg` — self-contained hero image asset

## Architecture decisions

- The public site is presentation-first and uses Wouter routes with a shared header, footer, metadata helper, and reusable CTA/field primitives.
- Business information is kept in one module so phone, ownership, service area, payment language, and future email/Facebook values can be updated without hunting through page markup.
- The quote form intentionally does not claim to submit a request while the business has not provided a receiving email or inbox. It validates the draft, supports multiple photo selection, and gives a clear phone handoff.
- The logo is a swappable asset with a text fallback so a final brand mark can replace the placeholder without changing header or footer layout.

## Product

- Multi-page premium marketing site for home repairs, outdoor projects, cleanups, pressure washing, exterior maintenance, installations, flooring/finish work, realtor/property services, and custom projects.
- Responsive navigation and mobile menu, phone-first contact flow, quote-request form, service-area messaging, and legal-information page layouts.
- No checkout, deposit collection, or unsupported credentials are presented.

## User preferences

- Luxury, high-end visual identity using near-black, deep charcoal, metallic gold, warm ivory, and clean white.
- Do not invent licenses, certifications, awards, reviews, testimonials, customer counts, years of experience, or contact destinations.

## Gotchas

- The artifact build expects `PORT` and `BASE_PATH` from its managed workflow; standalone verification should provide both values.
- The final email address and Facebook URL are intentionally blank in `src/lib/business.ts` until the business supplies them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**klola-portal** — myKlola Client Portal by PT. Klola Indonesia. A Next.js App Router portal with a multi-section marketing landing page, plus contact & demo request forms submitted through a Turnstile-protected API.

## Tech Stack

- **Framework**: Next.js 15+ (App Router, RSC, standalone output)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, PostCSS
- **UI**: shadcn/ui (new-york style, lucide icons), Radix UI primitives, BeUI motion components
- **ORM**: Drizzle Kit + Drizzle ORM v1rc with PostgreSQL (`postgres` driver)
- **Forms**: React Hook Form + Zod resolvers
- **CAPTCHA**: Cloudflare Turnstile (client `@marsidev/react-turnstile`, server `services/cloudflareVerify.ts`)
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Deploy**: Docker multi-stage (Bun deps → Node 22 builder → Node 22 runner), standalone output

## Commands

```bash
# Development
bun dev               # Start dev server at localhost:3000

# Production build
bun run build         # Next.js build → .next/standalone

# Type check only
npx tsc --noEmit

# Database — schema push / migration generation
npx drizzle-kit push
npx drizzle-kit generate
```

## Architecture

### Layer Pattern

```
app/api/v1/{module}/route.ts    # Route handler (thin: parse → verify → service → respond)
        ↓
services/{module}.ts            # Business logic / DB operations
        ↓
drizzle/schemas/{module}.ts     # Drizzle schema definition
```

Each module has three files in three layers — route, service, schema — plus a form component.

### Directory Structure

```
app/
├── api/v1/                     # API routes
│   ├── contact/route.ts        # POST — verify Turnstile → insert contact
│   └── request-demo/route.ts   # POST — verify Turnstile → insert demo request
├── page.tsx                    # Landing page (composes all landing sections)
├── layout.tsx                  # Root layout (3 fonts: Instrument Sans/Serif, JetBrains Mono)
└── not-found.tsx               # Custom 404

components/landing/             # Landing page section components
├── navigation.tsx              # Fixed top nav (scrolled state w/ blur card, mobile overlay menu)
├── hero-section.tsx             # Hero: headline + video, hero-bg.jpg, primary overlay + CTA
├── services-section.tsx        # "Mengapa Anda membutuhkan Klola?" — 4 service cards
├── product-sections.tsx        # 3 produk (Klola Cloud, Payroll, Kinerja) w/ Next/Image
├── team-section.tsx             # Team CTA band
├── clients-section.tsx         # Logo marquee + "Klien Lainnya" CTA
├── cta-section.tsx              # Bottom CTA
├── footer-section.tsx          # Footer w/ social links & link columns
└── animated-{sphere,wave,tetrahedron}.tsx

services/                       # Business logic layer
├── cloudflareVerify.ts         # verifyTurnstileToken(token, remoteIp) → TurnstileResult
├── contact.ts                 # createContact(input) → DB insert
└── request-demo.ts            # createDemoRequest(input) → DB insert

drizzle/
├── schema.ts                   # Re-exports: contacts, demo_requests
├── db.ts                       # Drizzle singleton (globalThis guard against pool leak on dev hot-reload)
└── schemas/
    ├── contacts.ts             # id kl-contact-{5} [a-z0-9], status enum, timestamptz
    └── demo_requests.ts        # id kl-demo-{5} [a-z0-9], preferred_date, timestamptz
```

### Key Patterns

- **API handler**: parse body → extract IP → `verifyTurnstileToken()` → `createContact()`/`createDemoRequest()` → `successResponse()`/`failedResponse()`
- **API responses** always `{ success, code, powered_by, message, data? }` via `lib/response.ts`
- **ID format**: `kl-contact-{5x[a-z0-9]}` / `kl-demo-{5x[a-z0-9]}` — generated via `$defaultFn`
- **Accidental** `.bak` files not part of the build; delete when done.
- **DB singleton**: `drizzle/db.ts` uses `globalThis` guard — never reintroduce per-request clients.
- **snake_case** in DB, **camelCase** in JS/TS — mapping is done in the service layer
- `next/config.mjs`: `images.unoptimized: true` — `Next/Image` still needs explicit `width`/`height` (or `fill` + a sized container) or it warns.

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side secret |
| `NEXT_PUBLIC_POWERED_BY` | Brand name in API responses (default: "PT Klola Indonesia") |

### Config Files

- `next.config.mjs` — `output: "standalone"`, `images.unoptimized`, `typescript.ignoreBuildErrors`
- `drizzle.config.ts` — `dialect: "postgresql"`, schema at `./drizzle/schema.ts`
- `components.json` — shadcn/ui (new-york, lucide, BeUI registry)
- `tsconfig.json` — `@/*` alias → project root

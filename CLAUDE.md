# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**klola-portal** — myKlola Client Portal by PT. Klola Indonesia. A marketing/contact portal built with Next.js App Router.

## Tech Stack

- **Framework**: Next.js 15+ (App Router, RSC, standalone output)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, PostCSS
- **UI**: shadcn/ui (new-york style, lucide icons), Radix UI primitives
- **ORM**: Drizzle Kit with PostgreSQL
- **Form validation**: React Hook Form + Zod resolvers
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Build runtime**: Node.js 22 (standalone output)
- **External components**: BeUI registry (`https://beui.dev/r/{name}.json`)

## Commands

```bash
# Development
bun dev               # Start dev server on :3000

# Production build
bun run build         # Next.js build → .next/standalone

# Type check only
npx tsc --noEmit

# Database migrations
npx drizzle-kit push  # Push schema to DB
npx drizzle-kit migrate  # Run migrations
```

## Architecture

### Directory Structure

```
app/                    # Next.js App Router
├── layout.tsx          # Root layout (fonts: Instrument Sans/Serif, JetBrains Mono, theme provider, metadata)
├── page.tsx            # Home — renders Navigation, HeroSection, FeaturesSection, FooterSection
├── contact/page.tsx    # Contact page with form and API route
├── demo/page.tsx       # Demo page
└── not-found.tsx       # Custom 404

components/
├── ui/                 # shadcn/ui components (30+ primitives: button, card, dialog, command, etc.)
└── landing/            # Page section components
    ├── navigation.tsx
    ├── hero-section.tsx
    ├── features-section.tsx
    ├── footer-section.tsx
    └── animated-sphere/tetrahedron/wave.tsx

drizzle/                # ORM layer
├── schema.ts           # Drizzle schema definitions
└── db.ts              # DB client instance

hooks/                  # Custom hooks
├── use-mobile.ts
└── use-toast.ts

lib/
├── utils.ts            # Shared utilities (cn() className merge, etc.)
└── ease.ts             # Animation easing functions
```

### Key Config Files

- `next.config.mjs` — `output: "standalone"`, `images.unoptimized: true`, `typescript.ignoreBuildErrors: true`
- `tsconfig.json` — `@/*` path alias maps to root; target ES6; isolatedModules
- `components.json` — shadcn/ui config (new-york style, lucide icons, BeUI registry)
- `drizzle.config.ts` — PostgreSQL dialect, schema at `./drizzle/schema.ts`
- `Dockerfile` — Multi-stage: Bun deps → Node builder → Node runner (standalone)

### Path Aliases

`@/` maps to project root. Example: `@/components/landing/hero-section` → `components/landing/hero-section.tsx`.

### Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required for Drizzle operations)
- See `.env` for full list.

## Notes

- This is a public-facing portal (not an authenticated SaaS). Pages serve demo, contact, and landing content.
- No test framework configured yet.
- Image optimization disabled (`unoptimized: true`) for standalone deployment compatibility.
- The `api/contact/route.ts` and `api/demo/route.ts` are deleted from git but may still exist on disk — verify before adding back.

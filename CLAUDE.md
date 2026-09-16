# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**klola-portal** — myKlola Client Portal by PT. Klola Indonesia. A Next.js App Router portal with a multi-section marketing landing page, authentication system, and protected client dashboard. Contact & demo request forms submitted through a Turnstile-protected API.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC, standalone output)
- **Proxy (Middleware)**: Next.js Proxy (`proxy.ts`) protects `/client` and `/admin` — JWT expiry detection, cookie cleanup, login redirect
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, PostCSS
- **UI**: shadcn/ui (new-york style, lucide icons), Radix UI primitives, BeUI motion components
- **ORM**: Drizzle Kit + Drizzle ORM v1rc with PostgreSQL (`postgres` driver)
- **Forms**: React Hook Form + Zod resolvers
- **Auth**: Custom JWT (`jose` library, HS256, 24h expiry), AES-256-CBC + HMAC-SHA3-512 encryption (`crypto-js` + `js-sha3`)
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

### Auth System

```
proxy.ts                              # Edge-runtime guard: verifies _T JWT expiry, clears cookies on invalid, redirects /authentication→/client when logged in
  └→ /client/*, /admin/*            # Protected — missing/expired _T → redirect /authentication
  └→ /authentication                # If _T valid → redirect /client; else pass through

app/api/v1/login/route.ts            # POST — Turnstile → loginUser → set cookies _T (httpOnly JWT), _C (httpOnly company_id), _U (encrypted user payload)
app/api/v1/register/route.ts         # POST — Turnstile → registerUser (password_hash SHA-256 + securedEncrypt stored in DB)
app/api/v1/logout/route.ts           # POST — clears all auth cookies (_T, _C, _U)

services/auth/login.ts               # loginUser: SELECT email → check role≠ONBOARD → SHA-256 password_hash match → signJwt(all fields)
services/auth/register.ts            # registerUser: password_hash = SHA-256(input) + securedEncrypt(input) → INSERT

lib/jwt.ts                           # signJwt(), verifyJwt(), verifyJwtDetailed() — returns {ok,payload}|{ok:false,reason}
lib/encrypter-server.ts              # securedEncrypt/Decrypt using node:crypto (AES-256-CBC + HMAC-SHA3-512)
lib/encrypter-client.ts              # Same API using crypto-js (for client-side decrypt of _U cookie)
```

### Cookie Contract

| Cookie | HttpOnly | Encrypted | Purpose |
|--------|----------|-----------|---------|
| `_T` | ✅ | No (JWT) | Server auth — verified by proxy.ts, signed with jose |
| `_C` | ✅ | No | Company ID for server-side lookups |
| `_U` | ❌ | ✅ `securedEncrypt` | Client-side user name/email/role display, decrypted via `getUserFromCookie()` |

### Layer Pattern

```
app/api/v1/{module}/route.ts    # Route handler (thin: parse → verify → service → respond)
        ↓
services/{module}.ts            # Business logic / DB operations
        ↓
drizzle/schemas/{module}.ts     # Drizzle schema definition
```

### Directory Structure

```
proxy.ts                        # Next.js Proxy (middleware) — auth guard for /client, /admin, /authentication
app/
├── api/v1/                     # API routes
│   ├── login/route.ts          # POST — Turnstile → loginUser
│   ├── register/route.ts       # POST — Turnstile → registerUser
│   ├── logout/route.ts         # POST — clear all cookies
│   ├── contact/route.ts        # POST — Turnstile → createContact
│   └── request-demo/route.ts   # POST — Turnstile → insert demo request
├── (secure)/client/            # Protected client dashboard (requires _T cookie)
│   ├── layout.tsx              # Wraps with Sidebar
│   └── page.tsx                # Dashboard view
├── authentication/             # Login + Register page
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout (3 fonts)
└── not-found.tsx               # Custom 404

services/auth/                  # Auth business logic
├── login.ts                    # loginUser() — email lookup, password_hash verify, JWT sign
└── register.ts                 # registerUser() — password_hash + securedEncrypt

lib/                            # Utilities
├── jwt.ts                      # JWT sign/verify/detailed verify
├── utils.ts                    # cn(), getUserFromCookie(), isAuthenticated(), jwtDecode(), getCookie()
├── encrypter-server.ts         # AES-256-CBC + HMAC-SHA3-512 (node:crypto)
├── encrypter-client.ts         # Same API (crypto-js)
├── response.ts                 # successResponse() / failedResponse()
└── ease.ts                     # Animation easing presets

drizzle/
├── schema.ts                   # Re-exports all schemas
├── db.ts                       # Drizzle singleton (globalThis guard)
└── schemas/
    ├── users.ts                # id kl-user-{13}, email(unique), password_hash, role enum, company_id, timestamps
    ├── contacts.ts             # id kl-contact-{5}, status enum, timestamptz
    └── demo_requests.ts        # id kl-demo-{5}, preferred_date, timestamptz

components/
├── sidebar.tsx                 # Animated sidebar + header user dropdown with logout
├── header-comp.tsx             # "Hi, {name}" dashboard header
├── landing/                    # Landing page section components
├── motion/                     # BeUI motion components (animated-sidebar, input, tabs, etc.)
└── ui/                         # shadcn/ui components

modules/                        # Feature modules
├── auth/login/                 # Login/Register form (comp-form.tsx + layout + logo-mark)
├── contacts/                   # Contact form
└── request-demo/               # Demo request form
```

### Key Patterns

- **API handler**: parse body → extract IP → `verifyTurnstileToken()` → service → `successResponse()`/`failedResponse()`
- **API responses** always `{ success, code, powered_by, message, data? }` via `lib/response.ts`
- **ID format**: `kl-user-{13x[a-z0-9]}` / `kl-contact-{5x[a-z0-9]}` — generated via `$defaultFn`
- **Password storage**: Dual — `password_hash` (SHA-256 hex, for login verification) + `password` (AES-256-CBC encrypted, for any future decryption need)
- **Login**: `securedDecrypt` stored password → compute SHA-256 → compare with `password_hash` column
- **DB singleton**: `drizzle/db.ts` uses `globalThis` guard — never reintroduce per-request clients
- **snake_case** in DB, **camelCase** in JS/TS — mapping in service layer
- `next.config.mjs`: `typescript.ignoreBuildErrors: true`, `images.unoptimized: true`

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side secret |
| `NEXT_PUBLIC_CRY_PUBKEY` | AES-256 public key (client, exposed) |
| `CRY_PUBKEY` | AES-256 public key (server) |
| `CRY_SECRETKEY` | AES-256 + HMAC secret key (server) |
| `JWT_SECRET` | JWT signing secret (32+ byte hex) |
| `NEXT_PUBLIC_POWERED_BY` | Brand name in API responses |

### Config Files

- `next.config.mjs` — `output: "standalone"`, `images.unoptimized`, `typescript.ignoreBuildErrors`
- `drizzle.config.ts` — `dialect: "postgresql"`, schema at `./drizzle/schema.ts`
- `components.json` — shadcn/ui (new-york, lucide, BeUI registry)
- `tsconfig.json` — `@/*` alias → project root

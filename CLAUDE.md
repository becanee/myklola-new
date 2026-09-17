# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**klola-portal** — myKlola Client Portal by PT. Klola Indonesia. A Next.js App Router portal with marketing landing page, authentication system, protected client dashboard, tickets management (list, filter, create with rich text editor), and SSO integration. Contact & demo request forms submitted through a Turnstile-protected API.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC, standalone output)
- **Proxy (Middleware)**: Next.js Proxy (`proxy.ts`) — guards `/`, `/client/*`, `/admin/*` with JWT; redirects `/authentication` → `/client` when logged in; redirects `/` → `/forbidden` when unauthenticated
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, PostCSS
- **UI**: shadcn/ui (new-york style, lucide icons), Radix UI primitives, BeUI motion components
- **Rich text editor**: TipTap (`@tiptap/react`, StarterKit, Underline)
- **ORM**: Drizzle Kit + Drizzle ORM v1rc with PostgreSQL (`postgres` driver)
- **Auth**: Custom JWT (`jose`, HS256, 24h expiry), AES-256-CBC + HMAC-SHA3-512 encryption (`crypto-js` + `js-sha3`)
- **CAPTCHA**: Cloudflare Turnstile (client `@marsidev/react-turnstile`, server `services/cloudflareVerify.ts`)
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Deploy**: Docker multi-stage (Bun deps → Node 22 builder → Node 22 runner), standalone output

## Commands

```bash
# Development
bun dev               # Start dev server at localhost:3000

# Production build
bun run build         # Next.js build

# Type check only
npx tsc --noEmit

# Database — schema push / migration generation
npx drizzle-kit push
npx drizzle-kit generate
```

## Architecture

### Proxy (Middleware) Guard

```
proxy.ts matcher: '/', '/authentication', '/client/*', '/admin/*', '/forbidden'

/                           → if !_T cookie → redirect /forbidden
/authentication             → if _T valid   → redirect /client; else pass through
/client/*, /admin/*         → if !_T        → redirect /forbidden
/forbidden                  → always pass through
```

### Auth Endpoints

```
POST /api/v1/login      → Turnstile → loginUser → set _T, _C, _U cookies
POST /api/v1/register   → Turnstile → registerUser → INSERT (password_hash + securedEncrypt)
POST /api/v1/logout     → clear all auth cookies
GET  /api/v1/sso        → proxy to external API → upsert client_members → redirect /client
```

### Cookie Contract

| Cookie | HttpOnly | Encrypted | Purpose |
|--------|----------|-----------|---------|
| `_T` | Yes | No (JWT) | Server auth — verified by proxy.ts |
| `_C` | Yes | No | Company ID for server-side lookups |
| `_U` | No | `securedEncrypt` | Client-side user data via `getUserFromCookie()` |

### Directory Structure

```
proxy.ts                        # Next.js Proxy middleware

app/
├── api/v1/
│   ├── login/route.ts          # POST — Turnstile → loginUser
│   ├── register/route.ts       # POST — Turnstile → registerUser
│   ├── logout/route.ts         # POST — clear all cookies
│   ├── sso/route.ts            # GET  — proxy external API → upsert → redirect /client
│   ├── contact/route.ts        # POST — Turnstile → createContact
│   └── request-demo/route.ts   # POST — Turnstile → insert demo request
├── (secure)/client/            # Protected dashboard (SidebarClient wrapper)
│   ├── layout.tsx              # SidebarClient wrapper
│   ├── page.tsx                # Dashboard (stats + latest tickets table)
│   ├── tickets/page.tsx        # All tickets (stats + search/filter + table + create btn)
│   └── tickets/create/page.tsx # Create ticket form
├── authentication/             # Login + Register page (pill tabs)
├── page.tsx                    # Landing page (proxy-protected)
├── layout.tsx                  # Root layout (3 fonts)
├── not-found.tsx               # Custom 404 (terminal style)

services/auth/
├── login.ts                    # loginUser() — email lookup, password_hash verify, JWT sign
├── register.ts                 # registerUser() — password_hash + securedEncrypt
└── sso.ts                      # fetchTokenFromExternalAPI() + findOrCreateMember()

lib/
├── jwt.ts                      # signJwt(), verifyJwt(), verifyJwtDetailed()
├── utils.ts                    # cn(), getUserFromCookie(), isAuthenticated(), jwtDecode()
├── encrypter-server.ts         # AES-256-CBC + HMAC-SHA3-512 (node:crypto)
├── encrypter-client.ts         # Same API (crypto-js) for client-side decrypt
└── response.ts                 # successResponse() / failedResponse()

drizzle/schemas/
├── users.ts                    # Auth users (kl-user-{13} id, password_hash, role enum)
├── client_members.ts           # Rich profile data from external API (50+ columns)
├── contacts.ts                 # Contact form submissions
└── demo_requests.ts            # Demo request submissions

components/
├── sidebar.tsx                 # Animated sidebar + header user dropdown + logout
├── header-comp.tsx             # Dashboard header (greeting or breadcrumb title)
├── footer.tsx                  # Fixed bottom footer (copyright + version)
├── motion/                     # BeUI components (table, input, tabs, select-morph, loader, etc.)
└── ui/                         # shadcn/ui components (90+)

modules/
├── auth/login/                 # Login + Register tabbed form
├── client/dashboard/           # Dashboard module (stats + latest tickets table)
├── client/tickets/             # Tickets module (stats, filter bar, table)
├── client/create-tickets/      # Create ticket (TipTap editor + file upload + priority radio)
├── contacts/                   # Contact form module
└── request-demo/               # Demo request form module
```

### Create Ticket Form

```
modules/client/create-tickets/
├── index.tsx              # Main form: HeaderComp + card + Submit
├── editor.tsx             # TipTap rich text (Bold, Italic, Underline, lists)
├── priority-radio.tsx     # 4 radio cards (Low → Urgent) with spring indicator
└── upload.tsx             # Drag-and-drop (PNG/JPG/WEBP/SVG, max 5, 25MB)
```

### Key Patterns

- **API handler**: parse body → extract IP → `verifyTurnstileToken()` → service → `successResponse()`/`failedResponse()`
- **API responses**: `{ success, code, powered_by, message, data? }` via `lib/response.ts`
- **ID format**: `kl-user-{13x[a-z0-9]}` — generated via `$defaultFn`
- **Password storage**: SHA-256 hex (`password_hash` for login) + AES-256-CBC (`password` for future use)
- **Login verification**: hash input → compare with `password_hash`
- **SSO flow**: GET `?scope=&wstoken=` → external API → upsert `client_members` → JWT → cookies → 302 `/client`
- **DB singleton**: `drizzle/db.ts` — `globalThis` guard to prevent pool leak on hot-reload
- **snake_case** in DB, **camelCase** in JS/TS — mapping in service layer
- **`next.config.mjs`**: `typescript.ignoreBuildErrors: true`, `images.unoptimized: true`

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side secret |
| `NEXT_PUBLIC_CRY_PUBKEY` | AES-256 public key (client) |
| `CRY_PUBKEY` | AES-256 public key (server) |
| `CRY_SECRETKEY` | AES-256 + HMAC secret key (server) |
| `JWT_SECRET` | JWT signing secret (32+ byte hex) |
| `NEXT_PUBLIC_POWERED_BY` | Brand name in API responses |

### Config Files

- `next.config.mjs` — `output: "standalone"`, `images.unoptimized`, `typescript.ignoreBuildErrors`
- `drizzle.config.ts` — `dialect: "postgresql"`, schema at `./drizzle/schema.ts`
- `components.json` — shadcn/ui (new-york, lucide, BeUI registry)
- `tsconfig.json` — `@/*` alias → project root

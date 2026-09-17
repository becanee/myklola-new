# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**klola-portal** — myKlola Client Portal by PT. Klola Indonesia. A Next.js App Router helpdesk portal with SSO-based authentication, protected dashboard, tickets management (list, filter, create with rich text editor + file uploads), and R2-backed attachment storage. Targeted at client company employees submitting support tickets.

## Tech Stack

- **Framework**: Next.js 16 (App Router, RSC, standalone output)
- **Proxy (Middleware)**: Next.js Proxy (`proxy.ts`) — guards `/` and `/admin/*` with JWT; redirects to `/forbidden` when unauthenticated
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, PostCSS
- **UI**: shadcn/ui (new-york style, lucide icons), Radix UI primitives, BeUI motion components (`animated-sidebar`, `animated-toast-stack`, `table`, `select-morph`, `loader`, `input`, `button/base`)
- **Rich text editor**: TipTap (`@tiptap/react`, StarterKit, Underline)
- **ORM**: Drizzle Kit + Drizzle ORM v1rc with PostgreSQL (`postgres` driver)
- **Auth**: Custom JWT (`jose`, HS256) — verified from `_T` cookie; AES-256-CBC + HMAC-SHA3-512 encryption (`crypto-js` + `js-sha3`) for `_U` cookie
- **File storage**: Cloudflare R2 (`@computesdk/r2`)
- **Forms**: `react-hook-form` + `zod` validation
- **Charts**: `recharts`
- **CAPTCHA**: Cloudflare Turnstile (client `@marsidev/react-turnstile`, server `services/cloudflareVerify.ts`)
- **Package manager**: Bun (lockfile: `bun.lock`)
- **Deploy**: Docker multi-stage (Bun deps → Node 22 builder → Node 22 runner), standalone output

## Commands

```bash
bun dev               # Start dev server at localhost:3000
bun run build         # Next.js production build
bun run lint          # ESLint
npx tsc --noEmit      # Type check only

# Database
npx drizzle-kit generate  # Generate migration from schema changes
npx drizzle-kit push      # Push schema directly to database
```

## Architecture

### Proxy (Middleware) Guard

```
proxy.ts matcher: '/', '/admin/:path*', '/forbidden'

/               → if !_T cookie → redirect /forbidden
/forbidden      → if _T valid   → redirect back to /; else pass through
/admin/*        → if !_T        → redirect /forbidden?redirect=<path>
/forbidden      → always pass through
```

JWT is verified via `verifyJwtDetailed()` — distinguishes expired tokens from invalid ones. On verification failure, auth cookies (`_T`, `_C`) are cleared via `Max-Age=0`.

### Auth & API Endpoints

```
POST /api/v1/logout   → clear _T, _C cookies
GET  /api/v1/sso      → proxy external API → upsert clients → JWT → cookies → 302 redirect
GET  /api/v1/tickets  → JWT check → query tickets filtered by company_id & created_by → sorted desc
POST /api/v1/tickets  → JWT check → multipart form → validate → upload attachments to R2 → INSERT ticket
```

### Cookie Contract

| Cookie | HttpOnly | Encrypted | Purpose |
|--------|----------|-----------|---------|
| `_T` | Yes | No (JWT) | Server auth — verified by `proxy.ts` and API routes |
| `_C` | Yes | No | Company ID for server-side lookups / ticket filtering |
| `_U` | No | `securedEncrypt` | Client-side user data via `getUserFromCookie()` |

### Directory Structure

```
proxy.ts                        # Next.js Proxy middleware

app/
├── api/v1/
│   ├── logout/route.ts         # POST — clear auth cookies
│   ├── sso/route.ts            # GET — proxy external API → upsert → redirect
│   └── tickets/route.ts        # GET (list) + POST (create) with multipart/R2
├── (secure)/
│   ├── layout.tsx              # SidebarClient wrapper (AnimatedSidebar)
│   ├── page.tsx                # Dashboard (stats + latest tickets table)
│   ├── tickets/page.tsx        # All tickets (filter bar + table)
│   └── tickets/create/page.tsx # Create ticket form
├── forbidden/page.tsx          # Access denied page (redirects authed users to /)
├── layout.tsx                  # Root layout (3 fonts: Instrument Sans/Serif, JetBrains Mono)
└── not-found.tsx               # Custom 404

services/
├── tickets/
│   ├── validation.ts           # validatePayload() — subject, category, priority checks
│   └── helpers.ts              # generateTicketId(), getClientIp()
├── storage.ts                  # uploadAttachments() — Cloudflare R2 with @computesdk/r2
├── auth/
│   ├── login.ts                # loginUser() — email lookup, password_hash verify, JWT sign
│   ├── register.ts             # registerUser() — password_hash + securedEncrypt
│   └── sso.ts                  # fetchTokenFromExternalAPI() + findOrCreateMember()

lib/
├── jwt.ts                      # signJwt(), verifyJwt(), verifyJwtDetailed()
├── utils.ts                    # cn(), getUserFromCookie(), isAuthenticated(), jwtDecode()
├── encrypter-server.ts         # AES-256-CBC + HMAC-SHA3-512 (node:crypto)
├── encrypter-client.ts         # Same API (crypto-js) for client-side decrypt
└── response.ts                 # successResponse() / failedResponse()

drizzle/
├── db.ts                       # DB singleton — globalThis guard to prevent pool leak on hot-reload
├── schema.ts                   # Re-exports: clients, tickets
├── drizzle.config.ts           # Config for drizzle-kit (out: ./drizzle/migrations)
├── schemas/
│   ├── clients.ts              # Rich profile data from external API (50+ columns)
│   └── tickets.ts              # Tickets schema (KLTKT-{6digits} id, enums, jsonb attachments)

components/
├── sidebar-client.tsx          # AnimatedSidebar + header with user dropdown + logout
├── header-comp.tsx             # Dashboard header (greeting or breadcrumb + title)
├── footer.tsx                  # Fixed bottom footer (copyright + version)
├── ticket-detail-sheet.tsx     # Slide-over detail panel with timeline + priority badge
├── motion/                     # BeUI components (table, input, tabs, select-morph, loader, animated-sidebar, button/base)
└── ui/                         # shadcn/ui components (90+)

modules/
├── dashboard/
│   ├── index.tsx               # Dashboard page: 4 stat cards + latest tickets table
│   └── table/
│       ├── index.tsx           # LatestTicketsTable component
│       └── column/index.tsx    # Ticket type, StatusBadge, ticketColumns definition
├── tickets/
│   ├── index.tsx               # Tickets page with stat cards + FilterBar + table
│   ├── filter-bar.tsx          # Search input + status/category dropdown filters
│   └── table/
│       ├── index.tsx           # AllTicketsTable component
│       └── column/index.tsx    # Same Ticket type + StatusBadge + columns (shared pattern with dashboard)
└── create-tickets/
    ├── index.tsx               # Main form: subject input, category select, TipTap editor, file upload, priority radio
    ├── editor.tsx              # TipTap rich text (Bold, Italic, Underline, bullet/ordered lists)
    ├── priority-radio.tsx      # 4 radio cards (Low → Urgent) with spring indicator
    └── upload.tsx              # Drag-and-drop file upload (PNG/JPG/WEBP/SVG, max 5, 10MB total)
```

### Tickets Schema

```sql
table: tickets

id:           VARCHAR(16) PK — "KLTKT-" + 6 random digits (e.g. KLTKT-123098)
company_id:   VARCHAR(20)      — from _C cookie
subject:      VARCHAR(255)
category:     ENUM('General','Account','Incident','Bussiness','Payroll','Helpdesk')
priority:     ENUM('Low','Medium','High','Urgent')
status:       ENUM('Open','Pending','Action Required','Investigate','Resolved','Closed')
assign_to:    ENUM('Helpdesk','Tim Payroll','Tim IT','Tim Marketing','Tim Bussiness')
description:  TEXT
attachments:  JSONB[]          — [{url, key, name, size}] from R2 upload
closed_avg:   INTEGER          — days to close (default 0)
created_by:   TEXT
created_at:   TIMESTAMPTZ
updated_by:   TEXT
updated_at:   TIMESTAMPTZ
```

### Create Ticket Flow

1. Client form collects subject, category (MorphSelect), description (TipTap), priority (radio), attachments (drag-and-drop)
2. Submit sends `multipart/form-data` to `POST /api/v1/tickets`
3. Server validates JWT, decrypts `_U` cookie for user ID, parses FormData, runs `validatePayload()`
4. File attachments uploaded to Cloudflare R2 via `services/storage.ts` at path `{companyId}/tickets/{timestamp}-{filename}`
5. Ticket row inserted into DB with R2 attachment metadata

### Ticket Detail Sheet

Side sheet (`components/ticket-detail-sheet.tsx`) showing:
- Priority badge (color-coded: Low→slate, Medium→amber, High→orange, Urgent→rose)
- Ticket ID (monospace)
- Subject, category, status, assignee, created date
- Progress timeline (Submitted → Pending → Action Required → Investigate → Resolved/Closed) with dot-and-line indicator

### Key Patterns

- **API handler**: parse body/cookies → JWT verify → service → `successResponse()`/`failedResponse()`
- **API responses**: `{ success, code, powered_by, message, data? }` via `lib/response.ts`
- **ID format**: `KLTKT-{6 digits}` — random, generated via `$defaultFn` in schema
- **SSO flow**: GET `?scope=&wstoken=` → external API → upsert `clients` → JWT → cookies → 302 redirect
- **File storage**: Cloudflare R2 via `@computesdk/r2` — bucket path = `{companyId}/tickets/{timestamp}-{name}`
- **DB singleton**: `drizzle/db.ts` — `globalThis` guard to prevent pool leak on hot-reload
- **snake_case** in DB, **camelCase** in JS/TS — mapping in service layer
- **`next.config.mjs`**: `typescript.ignoreBuildErrors: true`, `images.unoptimized: true`, `output: "standalone"`
- **Client-side user**: `_U` cookie decrypted via `getUserFromCookie()` which calls `securedDecrypt` (works both client and server)

### Shared Table Column Pattern

Both dashboard and tickets modules use an identical `Ticket` type and `ticketColumns` definition in their respective `column/index.tsx` files. The `StatusBadge` component renders colored pills for each status. Columns: ticket_id (mono), subject, category, status (badge), priority, created_at (right-aligned, tabular-nums).

### Environment Variables (`.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile server-side secret |
| `CRY_PUBKEY` | AES-256 public key (server) |
| `CRY_SECRETKEY` | AES-256 + HMAC secret key (server) |
| `NEXT_PUBLIC_CRY_PUBKEY` | AES-256 public key (client) |
| `NEXT_PUBLIC_CRY_SECRETKEY` | AES-256 + HMAC secret key (client) |
| `CRY_SECRETKEY` | AES-256 + HMAC secret key (server) |
| `JWT_SECRET` | JWT signing secret (32+ byte hex) |
| `NEXT_PUBLIC_POWERED_BY` | Brand name in API responses |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_BUCKET` | Cloudflare R2 bucket name |
| `APP_URL` | Public origin URL for VPS redirects (e.g. https://app.myklola.cloud) |

### Config Files

- `next.config.mjs` — `output: "standalone"`, `images.unoptimized`, `typescript.ignoreBuildErrors`
- `drizzle.config.ts` — `dialect: "postgresql"`, schema at `./drizzle/schema.ts`, `out: "./drizzle/migrations"`
- `components.json` — shadcn/ui (new-york, lucide, BeUI registry)
- `tsconfig.json` — `@/*` alias → project root

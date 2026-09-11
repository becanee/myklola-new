import { pgEnum, pgTable, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN', 'CLIENT', 'ONBOARD']);

// Pattern: kl-user-[a-z][0-9]{12}  e.g. kl-user-a01234567890
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomUserId(): string {
  return `kl-user-${Array.from({ length: 13 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')}`;
}

export const users = pgTable(
  'users',
  {
    id: varchar({ length: 32 }).$defaultFn(() => randomUserId()).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 50 }).notNull().unique(),
    whatsapp: text().notNull(),
    password: text().notNull(),
    password_hash: varchar({ length: 64 }), // SHA-256 hex for login verification
    company_id: varchar({ length: 24 }),
    company_name: varchar({ length: 255 }),
    role: userRoleEnum().notNull().default('CLIENT'),
    agree: boolean().notNull().default(false),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('users_email_idx').on(t.email),
    index('users_role_idx').on(t.role),
    index('users_company_idx').on(t.company_id),
  ]
);

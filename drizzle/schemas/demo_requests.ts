import { pgTable, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';

export const demoRequests = pgTable(
  'demo_requests',
  {
    id: varchar({ length: 24 }).$defaultFn(() =>
      `kl-demo-${String.fromCharCode(97 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    ).primaryKey().notNull(),
    full_name: varchar({ length: 255 }).notNull(),
    company_name: varchar({ length: 255 }),
    email: varchar({ length: 50 }).notNull(),
    phone: varchar({ length: 50 }),
    purpose: text().notNull(),
    questions: text(),
    preferred_date: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    duration: varchar({ length: 50 }).notNull(),
    start_time: varchar({ length: 10 }).notNull(),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('demo_requests_email_idx').on(t.email),
    index('demo_requests_created_idx').on(t.created_at),
    index('demo_requests_preferred_date_idx').on(t.preferred_date),
  ]
);
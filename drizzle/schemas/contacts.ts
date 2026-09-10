import { pgEnum, pgTable, varchar, text, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const contactStatusEnum = pgEnum('contact_status', ['PENDING', 'PROGRESS', 'DONE']);

export const contacts = pgTable(
  'contacts',
  {
    id: varchar({ length: 24 }).$defaultFn(() =>
      `kl-contact-${String.fromCharCode(97 + Math.floor(Math.random() * 26))}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`
    ).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 50 }).notNull(),
    subject: varchar({ length: 255 }).notNull(),
    category: varchar({ length: 20 }).notNull(),
    message: text().notNull(),
    agree: boolean().notNull(),
    status: contactStatusEnum().notNull().default('PENDING'),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('contacts_status_idx').on(t.status),
    index('contacts_created_idx').on(t.created_at),
    index('contacts_status_created_idx').on(t.status, t.created_at),
  ]
);

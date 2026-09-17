import { pgEnum, pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// Pattern: KLU-[0-9]{6}  e.g. KLU-098123
const DIGITS = '0123456789';

function randomUserId(): string {
  return `KLU-${Array.from({ length: 6 }, () => DIGITS[Math.floor(Math.random() * DIGITS.length)]).join('')}`;
}

export const userRoleEnum = pgEnum('user_role', [
  'Superadmin',
  'Helpdesk',
  'Tim Payroll',
  'Tim IT',
  'Tim Marketing',
  'Tim Bussiness',
  'Support',
]);

export const users = pgTable('users', {
  id: varchar({ length: 16 }).$defaultFn(() => randomUserId()).primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  username: varchar({ length: 25 }).notNull().unique(),
  email: varchar({ length: 50 }).notNull().unique(),
  password: text().notNull(),
  role: userRoleEnum().notNull().default('Helpdesk'),
  created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
});

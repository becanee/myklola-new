import { pgEnum, pgTable, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { clientMembers } from './clients';
import { users } from './users';

export const ticketCategoryEnum = pgEnum('ticket_category', ['General', 'Account', 'Incident', 'Bussiness', 'Payroll', 'Helpdesk']);
export const ticketPriorityEnum = pgEnum('ticket_priority', ['Low', 'Medium', 'High', 'Urgent']);
export const ticketStatusEnum = pgEnum('ticket_status', ['Open', 'Pending', 'Action Required', 'Investigate', 'Resolved', 'Closed']);
export const ticketAssignEnum = pgEnum('ticket_assign', ['Helpdesk', 'Tim Payroll', 'Tim IT', 'Tim Marketing', 'Tim Bussiness', 'Support']);

// Pattern: KLTKT-[0-9]{6}  e.g. KLTKT-123098
const DIGITS = '0123456789';

function randomTicketId(): string {
  return `KLTKT-${Array.from({ length: 6 }, () => DIGITS[Math.floor(Math.random() * DIGITS.length)]).join('')}`;
}

export const tickets = pgTable(
  'tickets',
  {
    id: varchar({ length: 16 }).$defaultFn(() => randomTicketId()).primaryKey().notNull(),
    company_id: varchar({ length: 20 }),
    subject: varchar({ length: 255 }),
    category: ticketCategoryEnum().notNull().default('General'),
    priority: ticketPriorityEnum().notNull().default('Medium'),
    status: ticketStatusEnum().notNull().default('Open'),
    assign_to: ticketAssignEnum(),
    description: text(),
    attachments: jsonb().array(),
    closed_avg: integer().notNull().default(0),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    created_by: integer().references(() => clientMembers.id),
    updated_at: timestamp({ mode: 'date', withTimezone: true }),
    updated_by: varchar({ length: 16 }).references(() => users.id),
  },
);

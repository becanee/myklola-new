import { pgTable, serial, varchar, text, boolean, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const clientMembers = pgTable(
  'client_members',
  {
    id: serial().primaryKey().notNull(),
    klola_ids: text().array().notNull().default([]), // array of company IDs
    name: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 100 }).notNull(),
    email: varchar({ length: 50 }).notNull().unique(),
    non_employee: boolean().notNull().default(false),
    has_subordinates: boolean().notNull().default(false),
    has_onboarding: boolean().notNull().default(false),
    has_contract_review: boolean().notNull().default(false),
    has_raters: boolean().notNull().default(false),
    has_supervisor: boolean().notNull().default(false),
    sid: integer().notNull(),

    // area — array of {name, lat, long, radius}
    area: jsonb().notNull().default([]),

    // Employee fields (flattened from employee object)
    jenis_pegawai: varchar({ length: 50 }).notNull(),
    employee_group: varchar({ length: 100 }).notNull(),
    cabang: varchar({ length: 20 }).notNull(),
    jabatan: varchar({ length: 255 }).notNull(),
    pangkat: varchar({ length: 100 }).notNull(),
    golongan: varchar({ length: 20 }).notNull(),
    employee_area: varchar({ length: 50 }).notNull(),
    branch: varchar({ length: 100 }).notNull(),

    // Employee IDs
    id_branch: integer().notNull(),
    id_department: integer().notNull(),
    id_position: integer().notNull(),
    id_rank: integer().notNull(),
    id_grade: integer().notNull(),
    id_divisi: integer().notNull(),
    id_unit: integer(), // nullable

    // Roles
    roles: text().array().notNull().default([]),

    // Settings (full JSON payload)
    setting: jsonb().notNull().default({}),

    // Avatar
    avatar_url: text(),
    avatar_potrait: text(),
    avatar_square: text(),

    // Permission flags (mapped from is_* and admin booleans)
    is_topuser: boolean().notNull().default(false),
    is_payroll: boolean().notNull().default(false),
    is_pseditor: boolean().notNull().default(false),
    is_hris: boolean().notNull().default(false),
    is_hreditor: boolean().notNull().default(false),
    is_pm: boolean().notNull().default(false),
    is_pmapprover: boolean().notNull().default(false),
    is_pmverificator: boolean().notNull().default(false),
    is_essapprover: boolean().notNull().default(false),
    is_essverificator: boolean().notNull().default(false),
    is_hrapprover: boolean().notNull().default(false),
    is_worker: boolean().notNull().default(false),
    is_ga: boolean().notNull().default(false),
    is_contractreviewer: boolean().notNull().default(false),
    is_contractapprover: boolean().notNull().default(false),
    use_travel_cash: boolean().notNull().default(false),
    is_ess_admin: boolean().notNull().default(false),
    is_hr_admin: boolean().notNull().default(false),
    is_payroll_admin: boolean().notNull().default(false),
    is_pm_admin: boolean().notNull().default(false),
    is_finance_admin: boolean().notNull().default(false),
    is_ga_admin: boolean().notNull().default(false),
    is_sys_admin: boolean().notNull().default(false),

    // Timestamps
    last_login: timestamp({ mode: 'date', withTimezone: true }),
    created_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('cm_email_idx').on(t.email),
    index('cm_username_idx').on(t.username),
  ],
);

CREATE TYPE "contact_status" AS ENUM('PENDING', 'PROGRESS', 'DONE');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('ADMIN', 'CLIENT', 'ONBOARD');--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar(24) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"email" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"category" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"agree" boolean NOT NULL,
	"status" "contact_status" DEFAULT 'PENDING'::"contact_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_requests" (
	"id" varchar(24) PRIMARY KEY,
	"full_name" varchar(255) NOT NULL,
	"company_name" varchar(255),
	"email" varchar(50) NOT NULL,
	"phone" varchar(50),
	"purpose" text NOT NULL,
	"questions" text,
	"preferred_date" timestamp with time zone NOT NULL,
	"duration" varchar(50) NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(32) PRIMARY KEY,
	"name" varchar(255) NOT NULL,
	"email" varchar(50) NOT NULL UNIQUE,
	"whatsapp" text NOT NULL,
	"password" text NOT NULL,
	"password_hash" varchar(64),
	"company_id" varchar(24),
	"company_name" varchar(255),
	"role" "user_role" DEFAULT 'CLIENT'::"user_role" NOT NULL,
	"agree" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_members" (
	"id" serial PRIMARY KEY,
	"klola_ids" text[] DEFAULT '{}'::text[] NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(100) NOT NULL,
	"email" varchar(50) NOT NULL UNIQUE,
	"non_employee" boolean DEFAULT false NOT NULL,
	"has_subordinates" boolean DEFAULT false NOT NULL,
	"has_onboarding" boolean DEFAULT false NOT NULL,
	"has_contract_review" boolean DEFAULT false NOT NULL,
	"has_raters" boolean DEFAULT false NOT NULL,
	"has_supervisor" boolean DEFAULT false NOT NULL,
	"sid" integer NOT NULL,
	"area" jsonb DEFAULT '[]' NOT NULL,
	"jenis_pegawai" varchar(50) NOT NULL,
	"employee_group" varchar(100) NOT NULL,
	"cabang" varchar(20) NOT NULL,
	"jabatan" varchar(255) NOT NULL,
	"pangkat" varchar(100) NOT NULL,
	"golongan" varchar(20) NOT NULL,
	"employee_area" varchar(50) NOT NULL,
	"branch" varchar(100) NOT NULL,
	"id_branch" integer NOT NULL,
	"id_department" integer NOT NULL,
	"id_position" integer NOT NULL,
	"id_rank" integer NOT NULL,
	"id_grade" integer NOT NULL,
	"id_divisi" integer NOT NULL,
	"id_unit" integer,
	"roles" text[] DEFAULT '{}'::text[] NOT NULL,
	"setting" jsonb DEFAULT '{}' NOT NULL,
	"avatar_url" text,
	"avatar_potrait" text,
	"avatar_square" text,
	"is_topuser" boolean DEFAULT false NOT NULL,
	"is_payroll" boolean DEFAULT false NOT NULL,
	"is_pseditor" boolean DEFAULT false NOT NULL,
	"is_hris" boolean DEFAULT false NOT NULL,
	"is_hreditor" boolean DEFAULT false NOT NULL,
	"is_pm" boolean DEFAULT false NOT NULL,
	"is_pmapprover" boolean DEFAULT false NOT NULL,
	"is_pmverificator" boolean DEFAULT false NOT NULL,
	"is_essapprover" boolean DEFAULT false NOT NULL,
	"is_essverificator" boolean DEFAULT false NOT NULL,
	"is_hrapprover" boolean DEFAULT false NOT NULL,
	"is_worker" boolean DEFAULT false NOT NULL,
	"is_ga" boolean DEFAULT false NOT NULL,
	"is_contractreviewer" boolean DEFAULT false NOT NULL,
	"is_contractapprover" boolean DEFAULT false NOT NULL,
	"use_travel_cash" boolean DEFAULT false NOT NULL,
	"is_ess_admin" boolean DEFAULT false NOT NULL,
	"is_hr_admin" boolean DEFAULT false NOT NULL,
	"is_payroll_admin" boolean DEFAULT false NOT NULL,
	"is_pm_admin" boolean DEFAULT false NOT NULL,
	"is_finance_admin" boolean DEFAULT false NOT NULL,
	"is_ga_admin" boolean DEFAULT false NOT NULL,
	"is_sys_admin" boolean DEFAULT false NOT NULL,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contacts_status_idx" ON "contacts" ("status");--> statement-breakpoint
CREATE INDEX "contacts_created_idx" ON "contacts" ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_status_created_idx" ON "contacts" ("status","created_at");--> statement-breakpoint
CREATE INDEX "demo_requests_email_idx" ON "demo_requests" ("email");--> statement-breakpoint
CREATE INDEX "demo_requests_created_idx" ON "demo_requests" ("created_at");--> statement-breakpoint
CREATE INDEX "demo_requests_preferred_date_idx" ON "demo_requests" ("preferred_date");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" ("role");--> statement-breakpoint
CREATE INDEX "users_company_idx" ON "users" ("company_id");--> statement-breakpoint
CREATE INDEX "cm_email_idx" ON "client_members" ("email");--> statement-breakpoint
CREATE INDEX "cm_username_idx" ON "client_members" ("username");
CREATE TYPE "contact_status" AS ENUM('PENDING', 'PROGRESS', 'DONE');--> statement-breakpoint
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
CREATE INDEX "contacts_status_idx" ON "contacts" ("status");--> statement-breakpoint
CREATE INDEX "contacts_created_idx" ON "contacts" ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_status_created_idx" ON "contacts" ("status","created_at");--> statement-breakpoint
CREATE INDEX "demo_requests_email_idx" ON "demo_requests" ("email");--> statement-breakpoint
CREATE INDEX "demo_requests_created_idx" ON "demo_requests" ("created_at");--> statement-breakpoint
CREATE INDEX "demo_requests_preferred_date_idx" ON "demo_requests" ("preferred_date");
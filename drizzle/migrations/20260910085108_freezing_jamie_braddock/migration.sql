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
CREATE INDEX "contacts_status_idx" ON "contacts" ("status");--> statement-breakpoint
CREATE INDEX "contacts_created_idx" ON "contacts" ("created_at");--> statement-breakpoint
CREATE INDEX "contacts_status_created_idx" ON "contacts" ("status","created_at");
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_created_by_client_members_id_fkey";--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_updated_by_client_members_id_fkey";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_by" SET DATA TYPE text USING "created_by"::text;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "updated_by" SET DATA TYPE text USING "updated_by"::text;
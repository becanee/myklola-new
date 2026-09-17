ALTER TABLE "tickets" ADD COLUMN "company_id" varchar(20);--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "created_by" SET DATA TYPE integer USING "created_by"::integer;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "updated_by" SET DATA TYPE integer USING "updated_by"::integer;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_client_members_id_fkey" FOREIGN KEY ("created_by") REFERENCES "client_members"("id");--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_updated_by_client_members_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "client_members"("id");
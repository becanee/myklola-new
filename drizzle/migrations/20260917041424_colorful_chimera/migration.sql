CREATE TYPE "ticket_assign" AS ENUM('Helpdesk', 'Tim Payroll', 'Tim IT', 'Tim Marketing', 'Tim Bussiness');--> statement-breakpoint
CREATE TYPE "ticket_status" AS ENUM('Open', 'Pending', 'Action Required', 'Investigate', 'Resolved', 'Closed');--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "status" "ticket_status" DEFAULT 'Open'::"ticket_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "assign_to" "ticket_assign";--> statement-breakpoint
ALTER TABLE "client_members" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
DROP SEQUENCE "client_members_id_seq";--> statement-breakpoint
ALTER TABLE "client_members" ALTER COLUMN "id" SET DATA TYPE integer USING "id"::integer;
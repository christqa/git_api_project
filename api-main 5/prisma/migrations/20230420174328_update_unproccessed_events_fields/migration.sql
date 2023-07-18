-- AlterTable
ALTER TABLE "UnprocessedEvents" ALTER COLUMN "event_body" DROP NOT NULL,
ALTER COLUMN "started_on" DROP NOT NULL;

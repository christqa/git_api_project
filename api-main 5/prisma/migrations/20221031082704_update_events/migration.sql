-- AlterTable
ALTER TABLE "Events" ALTER COLUMN "device_id" DROP NOT NULL;

-- AlterEnum
ALTER TYPE "EventSource" ADD VALUE 'system_generated';

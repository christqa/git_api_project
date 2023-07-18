-- MigrateData
UPDATE "NotificationSettings" SET "push" = false WHERE "enabled" = false;

-- AlterTable
ALTER TABLE "NotificationSettings" DROP COLUMN "enabled";

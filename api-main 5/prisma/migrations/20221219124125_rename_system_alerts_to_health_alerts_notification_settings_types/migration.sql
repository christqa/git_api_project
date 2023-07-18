/*
  Warnings:

  - The values [system_alerts] on the enum `NotificationSettingsTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Migrate data
ALTER TABLE "NotificationSettings" ALTER COLUMN "notification_settings_type" TYPE VARCHAR(100);
UPDATE "NotificationSettings" SET "notification_settings_type" = 'health_alerts' WHERE "notification_settings_type" = 'system_alerts';
ALTER TABLE "MessageType" ALTER COLUMN "notification_settings_type" TYPE VARCHAR(100);
UPDATE "MessageType" SET "notification_settings_type" = 'health_alerts' WHERE "notification_settings_type" = 'system_alerts';
-- Continue
CREATE TYPE "NotificationSettingsTypes_new" AS ENUM ('device_issues', 'health_alerts', 'health_insights', 'notifications');
ALTER TABLE "NotificationSettings" ALTER COLUMN "notification_settings_type" TYPE "NotificationSettingsTypes_new" USING ("notification_settings_type"::text::"NotificationSettingsTypes_new");
ALTER TABLE "MessageType" ALTER COLUMN "notification_settings_type" TYPE "NotificationSettingsTypes_new" USING ("notification_settings_type"::text::"NotificationSettingsTypes_new");
ALTER TYPE "NotificationSettingsTypes" RENAME TO "NotificationSettingsTypes_old";
ALTER TYPE "NotificationSettingsTypes_new" RENAME TO "NotificationSettingsTypes";
DROP TYPE "NotificationSettingsTypes_old";
COMMIT;
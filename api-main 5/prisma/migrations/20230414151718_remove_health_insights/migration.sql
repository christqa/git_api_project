/*
  Warnings:

  - The values [health_insights] on the enum `NotificationSettingsTypes` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
DELETE FROM "NotificationSettings" WHERE notification_settings_type='health_insights';
CREATE TYPE "NotificationSettingsTypes_new" AS ENUM ('device_issues', 'health_alerts', 'notifications', 'feedback_survey');
ALTER TABLE "MessageType" ALTER COLUMN "notification_settings_type" TYPE "NotificationSettingsTypes_new" USING ("notification_settings_type"::text::"NotificationSettingsTypes_new");
ALTER TABLE "NotificationSettings" ALTER COLUMN "notification_settings_type" TYPE "NotificationSettingsTypes_new" USING ("notification_settings_type"::text::"NotificationSettingsTypes_new");
ALTER TYPE "NotificationSettingsTypes" RENAME TO "NotificationSettingsTypes_old";
ALTER TYPE "NotificationSettingsTypes_new" RENAME TO "NotificationSettingsTypes";
DROP TYPE "NotificationSettingsTypes_old";
COMMIT;

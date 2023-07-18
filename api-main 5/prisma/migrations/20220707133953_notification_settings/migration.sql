-- CreateEnum
CREATE TYPE "NotificationSettingsTypes" AS ENUM ('device_issues', 'system_alerts', 'health_insights');

-- CreateEnum
CREATE TYPE "NotificationSettingsOptions" AS ENUM ('immediately', 'daily', 'weekly');

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "deleted" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "NotificationSettings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "push" BOOLEAN NOT NULL,
    "sms" BOOLEAN NOT NULL,
    "notification_settings_option" "NotificationSettingsOptions" NOT NULL,
    "notification_settings_type" "NotificationSettingsTypes" NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "NotificationSettings" ADD COLUMN     "email" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "push" SET DEFAULT false,
ALTER COLUMN "sms" SET DEFAULT false;

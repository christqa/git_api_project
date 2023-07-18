-- AlterTable
ALTER TABLE "DataPrivacyRemovalRequestTypes" ADD COLUMN     "order" INTEGER;

-- Order
UPDATE "DataPrivacyRemovalRequestTypes" SET "order" = 2 WHERE "id" = 1;
UPDATE "DataPrivacyRemovalRequestTypes" SET "order" = 1 WHERE "id" = 2;

-- Update ReferenceDataVersion version
UPDATE "ReferenceDataVersion" SET "version" = "version"+1 WHERE "id" = 1;

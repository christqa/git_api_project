-- CreateTable
CREATE TABLE "DataPrivacyRemovalRequestTypes" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "DataPrivacyRemovalRequestTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPrivacyRemovalRequestReasons" (
    "id" SERIAL NOT NULL,
    "request_type" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "allow_additional_text" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DataPrivacyRemovalRequestReasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPrivacyRemovalRequests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_reason" INTEGER NOT NULL,
    "request_reason_text" TEXT,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataPrivacyRemovalRequests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DataPrivacyRemovalRequestReasons" ADD CONSTRAINT "DataPrivacyRemovalRequestReasons_request_type_fkey" FOREIGN KEY ("request_type") REFERENCES "DataPrivacyRemovalRequestTypes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPrivacyRemovalRequests" ADD CONSTRAINT "DataPrivacyRemovalRequests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPrivacyRemovalRequests" ADD CONSTRAINT "DataPrivacyRemovalRequests_request_reason_fkey" FOREIGN KEY ("request_reason") REFERENCES "DataPrivacyRemovalRequestReasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SEEDING DataPrivacyRemovalRequestTypes
INSERT INTO "DataPrivacyRemovalRequestTypes" ("text") VALUES ('Delete my account and data');

-- SEEDING DataPrivacyRemovalRequestReasons
INSERT INTO "DataPrivacyRemovalRequestReasons" ("request_type", "text", "allow_additional_text") VALUES (1, 'Privacy or Data Concerns', false), (1, 'Transfer of Ownership', false), (1, 'Changing or Upgrading Device', false), (1, 'Restarting Account with New Data', false), (1, 'Obsolete or Inaccurate Data', false), (1, 'No Longer Use the Device', false), (1, 'Moving out', false), (1, 'Other', true);

-- Update ReferenceDataVersion version
UPDATE "ReferenceDataVersion" SET "version" = "version"+1 WHERE "id" = 1;

-- SEEDING DataPrivacyRemovalRequestTypes
INSERT INTO "DataPrivacyRemovalRequestTypes" ("text") VALUES ('Disclose personal data collected about me');

-- SEEDING DataPrivacyRemovalRequestReasons
INSERT INTO "DataPrivacyRemovalRequestReasons" ("request_type", "text", "allow_additional_text") VALUES (2, 'Privacy or Data Concerns', false), (2, 'Transfer of Ownership', false), (2, 'Changing or Upgrading Device', false), (2, 'Restarting Account with New Data', false), (2, 'Obsolete or Inaccurate Data', false), (2, 'No Longer Use the Device', false), (2, 'Moving out', false), (2, 'Other', true);

-- Update ReferenceDataVersion version
UPDATE "ReferenceDataVersion" SET "version" = "version"+1 WHERE "id" = 1;

create extension if not exists "uuid-ossp";

-- AlterTable
ALTER TABLE "DataSharingAgreement" ALTER COLUMN "agreement_id" SET DEFAULT uuid_generate_v4();

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "invite_id" SET DEFAULT uuid_generate_v4();

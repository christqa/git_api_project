create extension if not exists "uuid-ossp";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "message_guid" UUID NOT NULL DEFAULT uuid_generate_v4();

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_guid" UUID NOT NULL DEFAULT uuid_generate_v4();

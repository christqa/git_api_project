-- CreateEnum
CREATE TYPE "GroupUserRoles" AS ENUM ('owner', 'member');

-- AlterTable
ALTER TABLE "DataSharingAgreement" RENAME COLUMN "invite_id" TO "invitation_id";

ALTER TABLE "Invite" RENAME TO "Invitations";
ALTER TABLE "Invitations" RENAME COLUMN "invite_id" TO "invitation_id";
ALTER TABLE "User" RENAME TO "Account";
ALTER TABLE "Account" ADD COLUMN "time_zone_id" INTEGER NOT NULL DEFAULT 491;

-- CreateTable
CREATE TABLE "DeviceInventory" (
    "id" SERIAL NOT NULL,
    "device_serialno" VARCHAR(256) NOT NULL,
    "manufacturing_date" DATE NOT NULL,
    "device_name" VARCHAR(100) NOT NULL,
    "activated_timezone" VARCHAR(100) NOT NULL,

    CONSTRAINT "DeviceInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDevices" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,

    CONSTRAINT "UserDevices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupUsers" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "group_id" INTEGER NOT NULL,
    "added_on" DATE NOT NULL,
    "group_user_roles" "GroupUserRoles" NOT NULL,

    CONSTRAINT "GroupUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" SERIAL NOT NULL,
    "group_name" VARCHAR(100) NOT NULL,
    "created_on" DATE NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUsers" ADD CONSTRAINT "GroupUsers_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupUsers" ADD CONSTRAINT "GroupUsers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Account" RENAME CONSTRAINT "User_pkey" TO "Account_pkey";

-- AlterTable
ALTER TABLE "Invitations" RENAME CONSTRAINT "Invite_pkey" TO "Invitations_pkey";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "regional_pref" DROP DEFAULT;

-- RenameForeignKey
ALTER TABLE "DataSharingAgreement" RENAME CONSTRAINT "DataSharingAgreement_invite_id_fkey" TO "DataSharingAgreement_invitation_id_fkey";

-- RenameForeignKey
ALTER TABLE "Invitations" RENAME CONSTRAINT "Invite_from_user_id_fkey" TO "Invitations_from_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "Invitations" RENAME CONSTRAINT "Invite_to_user_id_fkey" TO "Invitations_to_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_time_zone_id_fkey" FOREIGN KEY ("time_zone_id") REFERENCES "TimeZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "User_auth_id_key" RENAME TO "Account_auth_id_key";

-- RenameIndex
ALTER INDEX "DataSharingAgreement_invite_id_key" RENAME TO "DataSharingAgreement_invitation_id_key";

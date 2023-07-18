-- AlterTable
ALTER TABLE "Invitations" ADD COLUMN     "group_access_level" "GroupUserRoles";

-- MigrateData
UPDATE "Invitations" SET "group_access_level" = 'member' WHERE "invite_type" = 'join_group';

/*
  Warnings:

  - The values [owner] on the enum `GroupUserRoles` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
-- Migrate data
ALTER TABLE "GroupUsers" ALTER COLUMN "group_user_role" TYPE VARCHAR(100);
UPDATE "GroupUsers" SET "group_user_role" = 'admin' WHERE "group_user_role" = 'owner';
-- Continue
CREATE TYPE "GroupUserRoles_new" AS ENUM ('admin', 'member');
ALTER TABLE "GroupUsers" ALTER COLUMN "group_user_role" TYPE "GroupUserRoles_new" USING ("group_user_role"::text::"GroupUserRoles_new");
ALTER TYPE "GroupUserRoles" RENAME TO "GroupUserRoles_old";
ALTER TYPE "GroupUserRoles_new" RENAME TO "GroupUserRoles";
DROP TYPE "GroupUserRoles_old";
COMMIT;

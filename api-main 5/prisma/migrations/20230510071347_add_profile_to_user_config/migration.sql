-- AlterTable
ALTER TABLE "UserConfiguration" ADD COLUMN  "profile_id" INTEGER DEFAULT 1;
UPDATE "UserConfiguration" SET profile_id=(SELECT id FROM "Profile" WHERE "UserConfiguration".user_id = "Profile".user_id);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfiguration_profile_id_key" ON "UserConfiguration"("profile_id");

-- AddForeignKey
ALTER TABLE "UserConfiguration" ADD CONSTRAINT "UserConfiguration_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "UserConfiguration" DROP CONSTRAINT "UserConfiguration_user_id_fkey";

-- DropIndex
DROP INDEX "UserConfiguration_user_id_key";

-- AlterTable
ALTER TABLE "UserConfiguration" DROP COLUMN "user_id",
                                ALTER COLUMN "profile_id" SET NOT NULL;
ALTER TABLE "UserConfiguration" ALTER COLUMN "profile_id" DROP DEFAULT;

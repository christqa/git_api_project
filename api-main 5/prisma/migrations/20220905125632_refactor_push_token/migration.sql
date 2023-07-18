-- Delete PushToken duplicate values
DELETE FROM "PushToken" pt WHERE EXISTS (SELECT FROM "PushToken" WHERE device_token = pt.device_token AND id < pt.id);

-- DropForeignKey
ALTER TABLE "PushToken" DROP CONSTRAINT "PushToken_user_id_fkey";

-- DropIndex
DROP INDEX "PushToken_user_id_device_token_key";

-- AlterTable
ALTER TABLE "PushToken" DROP COLUMN "user_id";

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_device_token_key" ON "PushToken"("device_token");

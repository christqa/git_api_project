-- DropForeignKey
ALTER TABLE "DeviceActivation" DROP CONSTRAINT "DeviceActivation_device_owner_fkey";

-- DropIndex
DROP INDEX "DeviceActivation_device_id_key";

-- AlterTable
ALTER TABLE "DeviceActivation" RENAME COLUMN "device_owner" TO "activated_by";

-- AlterTable
ALTER TABLE "DeviceActivation" ADD COLUMN "deactivated_by" INTEGER,
ADD COLUMN "deleted" TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_activated_by_fkey" FOREIGN KEY ("activated_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_deactivated_by_fkey" FOREIGN KEY ("deactivated_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

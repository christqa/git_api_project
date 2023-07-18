-- DropIndex
DROP INDEX "DeviceSettings_device_id_device_setting_name_key";

-- AlterTable
ALTER TABLE "DeviceSettings" ADD COLUMN     "deleted" TIMESTAMPTZ(3),
ADD COLUMN     "removed_by" INTEGER;

-- AddForeignKey
ALTER TABLE "DeviceSettings" ADD CONSTRAINT "DeviceSettings_removed_by_fkey" FOREIGN KEY ("removed_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSettings_device_id_device_setting_name_key" ON "DeviceSettings"("device_id", "device_setting_name") WHERE "deleted" IS NULL;

-- DropIndex
DROP INDEX "DeviceSettings_device_id_device_setting_name";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "dummy" BOOLEAN NOT NULL DEFAULT false;

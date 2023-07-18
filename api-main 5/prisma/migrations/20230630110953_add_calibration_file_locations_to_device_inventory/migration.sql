-- AlterTable
ALTER TABLE "DeviceInventory" ADD COLUMN     "calibration_file_locations" JSONB NOT NULL DEFAULT '{}';

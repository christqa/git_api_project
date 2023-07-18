-- AlterTable
ALTER TABLE "DeviceInventory" ADD COLUMN     "device_model" VARCHAR(100);
UPDATE "DeviceInventory" SET "device_model" = 'Spectra 1A';
ALTER TABLE "DeviceInventory" ALTER COLUMN "device_model" SET NOT NULL;

-- AlterTable
ALTER TABLE "DeviceActivation" ADD COLUMN     "device_model" VARCHAR(100),
ADD COLUMN     "battery_status" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "device_status_updated_on" TIMESTAMPTZ(3),
ADD COLUMN     "firmware_version" VARCHAR(100),
ADD COLUMN     "rssi" INTEGER,
ADD COLUMN     "wifi_ssid" VARCHAR(250);
UPDATE "DeviceActivation" SET "device_model" = 'Spectra 1A';
ALTER TABLE "DeviceActivation" ALTER COLUMN "device_model" SET NOT NULL;

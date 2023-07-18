-- AlterTable
ALTER TABLE "DeviceInventory" ADD COLUMN     "ble_mac_address" VARCHAR(17) NOT NULL DEFAULT E'',
ADD COLUMN     "device_metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "manufactured_for_region" VARCHAR(100) NOT NULL DEFAULT E'',
ADD COLUMN     "wifi_mac_address" VARCHAR(17) NOT NULL DEFAULT E'';

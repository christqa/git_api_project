-- Seed-Firmware
INSERT INTO "Firmware" ("virtual_firmware", "icp_firmware", "scb_firmware", "battery_controller_firmware", "is_current", "device_model") VALUES ('1.0.0', '1.0.0', '1.0.0', '1.0.0', false, 'Spectra 1A');
INSERT INTO "Firmware" ("virtual_firmware", "icp_firmware", "scb_firmware", "battery_controller_firmware", "is_current", "device_model") VALUES ('1.0.1', '1.0.1', '1.0.0', '1.0.0', true, 'Spectra 1A');

-- Seed-DeviceFirmware
INSERT INTO "DeviceFirmware" ("device_id", "firmware_id", "is_current")
SELECT "device_id", 1 AS "firmware_id", true AS "is_current" FROM "DeviceActivation" WHERE "deleted" IS NULL ORDER BY "id" ASC;

INSERT INTO "DeviceFirmware" ("device_id", "firmware_id", "is_current")
SELECT "device_id", 2 AS "firmware_id", false AS "is_current" FROM "DeviceActivation" WHERE "deleted" IS NULL ORDER BY "id" ASC;

-- AlterTable
ALTER TABLE "DeviceActivation" DROP COLUMN "firmware_version",
ADD COLUMN     "device_firmware_id" INTEGER;
UPDATE "DeviceActivation" SET "device_firmware_id" = "df"."id" FROM "DeviceActivation" AS "da" LEFT JOIN "DeviceFirmware" AS "df" ON "da"."device_id" = "df"."device_id" AND "df"."is_current" = true WHERE "DeviceActivation"."deleted" IS NULL;

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_device_firmware_id_fkey" FOREIGN KEY ("device_firmware_id") REFERENCES "DeviceFirmware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "DeviceFirmware_device_id_firmware_id_key" ON "DeviceFirmware"("device_id", "firmware_id");

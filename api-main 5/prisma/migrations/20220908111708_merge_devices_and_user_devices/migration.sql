-- CreateTable ; the device_status field is not used anymore
CREATE TABLE "DeviceActivation" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "device_owner" INTEGER NOT NULL,
    "time_zone_id" INTEGER NOT NULL DEFAULT 491,
    "device_name" VARCHAR(200) NOT NULL,
    "device_status" JSONB NOT NULL,
    "activated_on" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceActivation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceActivation_device_id_key" ON "DeviceActivation"("device_id");

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_device_owner_fkey" FOREIGN KEY ("device_owner") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_time_zone_id_fkey" FOREIGN KEY ("time_zone_id") REFERENCES "TimeZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

--

-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_device_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_time_zone_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_user_id_fkey";

-- DropTable
DROP TABLE "UserDevices";

--

-- AlterTable
ALTER TABLE "Devices" ADD COLUMN "device_id" INTEGER NOT NULL DEFAULT 1;

-- MigrateData
ALTER TABLE "DeviceInventory" ADD COLUMN "user_id" INTEGER NULL,
ADD COLUMN "time_zone_id" INTEGER NULL,
ADD COLUMN "devices_id" INTEGER NULL;

INSERT INTO "DeviceInventory" ("device_serialno", "manufacturing_date", "device_name", "activated_timezone", "user_id", "time_zone_id", "devices_id")
SELECT uuid_generate_v4() AS "device_serialno", '2019-06-01' AS "manufacturing_date", CONCAT('Smart Toilet #', "id") AS "device_name", 'Europe/Bucharest' AS "activated_timezone", "user_id", "time_zone_id", "id" FROM "Devices";

INSERT INTO "DeviceActivation" ("device_id", "device_owner", "time_zone_id", "device_name", "device_status")
SELECT "id", "user_id", "time_zone_id", "device_name", '{}' AS "device_status" FROM "DeviceInventory" WHERE "user_id" IS NOT NULL;

UPDATE "Devices" SET "device_id" = "DeviceInventory"."id" FROM "DeviceInventory" WHERE "DeviceInventory"."devices_id" = "Devices"."id" AND "DeviceInventory"."user_id" IS NOT NULL;

ALTER TABLE "DeviceInventory" DROP COLUMN "user_id",
DROP COLUMN "time_zone_id",
DROP COLUMN "devices_id";

-- AlterTable
ALTER TABLE "Devices" DROP COLUMN "last_pair_date", DROP COLUMN "time_zone_id";

-- AddForeignKey
ALTER TABLE "Devices" ADD CONSTRAINT "Devices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameTable
ALTER TABLE "Devices" RENAME TO "UserDevices";

-- AlterTable
ALTER TABLE "UserDevices" ALTER COLUMN "device_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UserDevices" RENAME CONSTRAINT "Devices_pkey" TO "UserDevices_pkey";

-- RenameForeignKey
ALTER TABLE "UserDevices" RENAME CONSTRAINT "Devices_device_id_fkey" TO "UserDevices_device_id_fkey";

-- RenameForeignKey
ALTER TABLE "UserDevices" RENAME CONSTRAINT "Devices_user_id_fkey" TO "UserDevices_user_id_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "UserDevices_user_id_device_id_key" ON "UserDevices"("user_id", "device_id");

-- DropForeignKey
ALTER TABLE "StoolData" DROP CONSTRAINT "StoolData_device_id_fkey";

-- DropForeignKey
ALTER TABLE "UrineData" DROP CONSTRAINT "UrineData_device_id_fkey";

-- MigrateData
UPDATE "StoolData" SET "device_id" = "UserDevices"."device_id" FROM "UserDevices" WHERE "UserDevices"."id" = "StoolData"."device_id" AND "UserDevices"."user_id" = "StoolData"."user_id";
UPDATE "UrineData" SET "device_id" = "UserDevices"."device_id" FROM "UserDevices" WHERE "UserDevices"."id" = "UrineData"."device_id" AND "UserDevices"."user_id" = "UrineData"."user_id";

-- AddForeignKey
ALTER TABLE "UrineData" ADD CONSTRAINT "UrineData_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoolData" ADD CONSTRAINT "StoolData_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

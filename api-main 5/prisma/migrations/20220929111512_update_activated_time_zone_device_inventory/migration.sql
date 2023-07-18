-- AlterTable
ALTER TABLE "DeviceInventory" ADD COLUMN "activated_time_zone_id" INTEGER DEFAULT NULL;

-- MigrateData
UPDATE "DeviceInventory" SET "activated_time_zone_id" = "tz"."id" FROM "DeviceInventory" AS "di" LEFT JOIN "TimeZone" AS "tz" on "di"."activated_timezone" = "tz"."text" WHERE "DeviceInventory"."id" = "di"."id";
UPDATE "DeviceInventory" SET "activated_time_zone_id" = 491 WHERE "activated_time_zone_id" IS NULL;

-- AlterTable
ALTER TABLE "DeviceInventory" ALTER COLUMN "activated_time_zone_id" SET NOT NULL, ALTER COLUMN "activated_time_zone_id" SET DEFAULT 491;
ALTER TABLE "DeviceInventory" DROP COLUMN "activated_timezone";

-- AddForeignKey
ALTER TABLE "DeviceInventory" ADD CONSTRAINT "DeviceInventory_activated_time_zone_id_fkey" FOREIGN KEY ("activated_time_zone_id") REFERENCES "TimeZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

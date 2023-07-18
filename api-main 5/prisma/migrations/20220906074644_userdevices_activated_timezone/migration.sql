-- AlterTable
ALTER TABLE "UserDevices" ADD COLUMN     "activated_on" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "time_zone_id" INTEGER NOT NULL DEFAULT 491;

-- AddForeignKey
ALTER TABLE "UserDevices" ADD CONSTRAINT "UserDevices_time_zone_id_fkey" FOREIGN KEY ("time_zone_id") REFERENCES "TimeZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

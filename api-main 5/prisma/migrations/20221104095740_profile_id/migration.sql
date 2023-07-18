-- AlterTable
ALTER TABLE "AnalytesManualEntry" ADD COLUMN     "profile_id" INTEGER;

-- AlterTable
ALTER TABLE "StoolData" ADD COLUMN     "profile_id" INTEGER;

-- AlterTable
ALTER TABLE "UrineData" ADD COLUMN     "profile_id" INTEGER;

-- AddForeignKey
ALTER TABLE "UrineData" ADD CONSTRAINT "UrineData_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoolData" ADD CONSTRAINT "StoolData_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalytesManualEntry" ADD CONSTRAINT "AnalytesManualEntry_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

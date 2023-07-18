-- AlterTable
ALTER TABLE "CumulativeScore" ADD COLUMN     "profile_id" INTEGER;

-- AddForeignKey
ALTER TABLE "CumulativeScore" ADD CONSTRAINT "CumulativeScore_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

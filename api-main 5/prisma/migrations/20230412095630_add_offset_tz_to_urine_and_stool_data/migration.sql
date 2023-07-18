-- AlterTable
ALTER TABLE "StoolData" ADD COLUMN     "offset_tz" TEXT NOT NULL DEFAULT E'+00:00';

-- AlterTable
ALTER TABLE "UrineData" ADD COLUMN     "offset_tz" TEXT NOT NULL DEFAULT E'+00:00';

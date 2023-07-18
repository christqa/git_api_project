-- AlterTable
ALTER TABLE "StoolData" ADD COLUMN "score_date" DATE DEFAULT NULL;
UPDATE "StoolData" SET "score_date" = date;
ALTER TABLE "StoolData" ALTER COLUMN "score_date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UrineData" ADD COLUMN "score_date" DATE DEFAULT NULL;
UPDATE "UrineData" SET "score_date" = date;
ALTER TABLE "UrineData" ALTER COLUMN "score_date" DROP DEFAULT;

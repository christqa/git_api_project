-- Disable old hydration scores
UPDATE "CumulativeScore" SET score_of_record=false WHERE cumulative_score_type='hydration';

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('morning', 'afternoon', 'night');

-- AlterTable
ALTER TABLE "CumulativeScore" ADD COLUMN     "time_of_day" "TimeOfDay";


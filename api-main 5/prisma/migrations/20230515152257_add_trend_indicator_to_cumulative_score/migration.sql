-- CreateEnum
CREATE TYPE "TrendIndicators" AS ENUM ('up', 'down', 'same');

-- AlterTable
ALTER TABLE "CumulativeScore" ADD COLUMN     "trend_indicator" "TrendIndicators";

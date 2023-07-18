/*
  Warnings:

  - You are about to alter the column `value` on the `CumulativeBaselineValue` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `value` on the `CumulativeScore` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `concentration` on the `UrineData` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(4,3)`.
  - Made the column `score_date` on table `StoolData` required. This step will fail if there are existing NULL values in that column.
  - Made the column `score_date` on table `UrineData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CumulativeBaselineValue" ALTER COLUMN "value" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "CumulativeScore" ALTER COLUMN "value" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "StoolData" ALTER COLUMN "score_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "UrineData" ALTER COLUMN "concentration" SET DATA TYPE DECIMAL(4,3);

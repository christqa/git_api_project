/*
  Warnings:

  - Added the required column `updatedAt` to the `CumulativeBaselineValue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CumulativeBaselineValue"
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

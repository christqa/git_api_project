/*
  Warnings:

  - Added the required column `first_in_day` to the `UrineData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UrineData" ADD COLUMN     "first_in_day" BOOLEAN NOT NULL DEFAULT false;

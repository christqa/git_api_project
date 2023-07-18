/*
  Warnings:

  - You are about to drop the column `has_blood` on the `UrineData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UrineData" DROP COLUMN IF EXISTS "has_blood";

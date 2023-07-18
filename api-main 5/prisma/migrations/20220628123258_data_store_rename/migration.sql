/*
  Warnings:

  - Made the column `score_date` on table `UrineData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DataStore" RENAME CONSTRAINT "AppState_pkey" TO "DataStore_pkey";

-- AlterTable
ALTER TABLE "UrineData" ALTER COLUMN "score_date" SET NOT NULL;

-- RenameForeignKey
ALTER TABLE "DataStore" RENAME CONSTRAINT "AppState_user_id_fkey" TO "DataStore_user_id_fkey";

-- RenameIndex
ALTER INDEX "AppState_user_id_key" RENAME TO "DataStore_user_id_key";

/*
  Warnings:

  - You are about to drop the column `total_file_count` on the `UnprocessedEvents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UnprocessedEvents" DROP COLUMN "total_file_count",
ADD COLUMN     "metadata" JSONB;

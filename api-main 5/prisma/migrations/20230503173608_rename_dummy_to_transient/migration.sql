/*
  Warnings:

  - You are about to drop the column `dummy` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" RENAME COLUMN "dummy" TO "transient";


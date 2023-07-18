/*
  Warnings:

  - A unique constraint covering the columns `[auth_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "auth_id" VARCHAR(128) NOT NULL DEFAULT E'N/A',
ALTER COLUMN "email" SET DATA TYPE VARCHAR(256);

-- CreateIndex
CREATE UNIQUE INDEX "User_auth_id_key" ON "User"("auth_id");

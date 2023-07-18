/*
  Warnings:

  - You are about to drop the column `dob` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(128)`.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "dob";
ALTER TABLE "User" RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "User" RENAME COLUMN "lastName" TO "last_name";

ALTER TABLE "User"
ALTER COLUMN "email" SET DATA TYPE VARCHAR(128),
ALTER COLUMN "first_name" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "last_name" SET DATA TYPE VARCHAR(64);

-- CreateTable
CREATE TABLE "Gender" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "dob" VARCHAR(32) NOT NULL,
    "weight_lbs" DOUBLE PRECISION NOT NULL,
    "height_in" SMALLINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "genderId" INTEGER NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_user_id_key" ON "Profile"("user_id");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SEEDING Genders
INSERT INTO "Gender" ("text") VALUES ('male'), ('female'), ('transgender male'), ('transgender female'), ('other')


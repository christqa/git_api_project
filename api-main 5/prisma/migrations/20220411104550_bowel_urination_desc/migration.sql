/*
  Warnings:

  - Added the required column `bowel_movement_id` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urinations_per_day_id` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "bowel_movement_id" INTEGER NOT NULL,
ADD COLUMN     "urinations_per_day_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BowelMovement" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "BowelMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrinationsPerDay" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "UrinationsPerDay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_bowel_movement_id_fkey" FOREIGN KEY ("bowel_movement_id") REFERENCES "BowelMovement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_urinations_per_day_id_fkey" FOREIGN KEY ("urinations_per_day_id") REFERENCES "UrinationsPerDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "BowelMovement" ("text") VALUES 
('Once per day'), 
('2-3x per day'), 
('7-10x per day'), 
('11-15x per day'), 
('16-20x per day'), 
('20+x per day'), 
('Once every 2-3 days'), 
('Once every 4-6 days'),
('Once per week'),
('Once every 2-3 weeks');

INSERT INTO "UrinationsPerDay" ("text") VALUES
('1-3'),
('4-6'),
('7-9'),
('10-12'),
('13-15'),
('16-20'),
('20+');
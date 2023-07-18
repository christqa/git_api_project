/*
  Warnings:

  - You are about to drop the column `lifeStyle` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `medicalConditions` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `medications` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "lifeStyle",
DROP COLUMN "medicalConditions",
DROP COLUMN "medications",
ADD COLUMN  "life_style_id" INTEGER;

-- CreateTable
CREATE TABLE "LifeStyle" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "LifeStyle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalCondition" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "MedicalCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MedicalConditionToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_MedicationToProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MedicalConditionToProfile_AB_unique" ON "_MedicalConditionToProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_MedicalConditionToProfile_B_index" ON "_MedicalConditionToProfile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MedicationToProfile_AB_unique" ON "_MedicationToProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_MedicationToProfile_B_index" ON "_MedicationToProfile"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_life_style_id_fkey" FOREIGN KEY ("life_style_id") REFERENCES "LifeStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicalConditionToProfile" ADD FOREIGN KEY ("A") REFERENCES "MedicalCondition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicalConditionToProfile" ADD FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicationToProfile" ADD FOREIGN KEY ("A") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MedicationToProfile" ADD FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameColumn
ALTER TABLE "Profile" RENAME COLUMN "genderId" TO "gender_id";

-- AlterForeignKe
ALTER TABLE "Profile" RENAME CONSTRAINT "Profile_genderId_fkey" TO "Profile_gender_id_fkey";

-- SEEDING LifeStyles
INSERT INTO "LifeStyle" ("text") VALUES ('Never'), ('Every other week'), ('1 a week'), ('1-2 times a week'), ('3-5 times a week'), ('Every day');

-- SEEDING Medical Condition
INSERT INTO "MedicalCondition" ("text") VALUES ('Constipation'), ('Celiac disease'), ('Diabetes'), ('GERD'), ('Gluten sensitivity'), ('Hemorrhoids, polyps, colorectal cancer'),
  ('History of abdominal surgery'), ('Inflammatory bowel disease (IBD)'), ('Irritable bowel syndrome (IBS)'), ('Kidney Stone'), ('Malabsorption'), ('Pancreatic disease'), ('Pregnant'), ('Urinary tract infection (UTIs)');

-- SEEDING Medications
INSERT INTO "Medication" ("text") VALUES ('Antibiotics'), ('Antidepressants'), ('Biologics'), ('Diaretics'), ('Immunosuppressive'), ('Laxatives, stool softeners'),
  ('Pain medication'), ('Steroids'), ('Supplements');

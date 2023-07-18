/*
  Warnings:

  - You are about to drop the column `agreement_Type` on the `SignedAgreements` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `SignedAgreements` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[agreement_type,version,locale_iso]` on the table `Agreements` will be added. If there are existing duplicate values, this will fail.
*/
-- AlterTable
ALTER TABLE "SignedAgreements" DROP COLUMN "agreement_Type",
DROP COLUMN "version",
ADD COLUMN     "agreement_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "SignedAgreements" ADD CONSTRAINT "SignedAgreements_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "Agreements"("id") ON DELETE CASCADE ON UPDATE CASCADE;


/*
  Warnings:

  - A unique constraint covering the columns `[agreement_type,version,locale_iso]` on the table `Agreements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Agreements_agreement_type_version_locale_iso_key" ON "Agreements"("agreement_type", "version", "locale_iso");

/*
 Warnings:

 - A unique constraint covering the columns `[user_id,agreement_id]` on the table `SignedAgreements` will be added. If there are existing duplicate values, this will fail.

 */
-- Remove duplicates
DELETE FROM "SignedAgreements"
WHERE id IN (
    SELECT id
    FROM "SignedAgreements"
    EXCEPT
    SELECT MIN(id)
    FROM "SignedAgreements"
    GROUP BY user_id,
      agreement_id
  );

-- CreateIndex
CREATE UNIQUE INDEX "SignedAgreements_user_id_agreement_id_key" ON "SignedAgreements"("user_id", "agreement_id");
-- CreateEnum
CREATE TYPE "AgreementTypes" AS ENUM ('privacy_policy', 'terms_and_conditions');

-- CreateTable
CREATE TABLE "SignedAgreements" (
    "id" SERIAL NOT NULL,
    "agreement_Type" "AgreementTypes" NOT NULL,
    "version" SMALLINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "agreed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignedAgreements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SignedAgreements" ADD CONSTRAINT "SignedAgreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

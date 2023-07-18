-- CreateEnum
CREATE TYPE "PermissionTypes" AS ENUM ('read', 'write', 'delete');

-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "invite_id" UUID NOT NULL,
    "from_user_id" INTEGER NOT NULL,
    "to_user_id" INTEGER,
    "to_user_email" VARCHAR(256),
    "permissions" "PermissionTypes"[],
    "sent_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "accepted_at" TIMESTAMPTZ(3),
    "rejected_at" TIMESTAMPTZ(3),

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSharingAgreement" (
    "id" SERIAL NOT NULL,
    "agreement_id" UUID NOT NULL,
    "invite_id" INTEGER NOT NULL,
    "from_user_id" INTEGER NOT NULL,
    "to_user_id" INTEGER NOT NULL,
    "permissions" "PermissionTypes"[],
    "agreed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(3),

    CONSTRAINT "DataSharingAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataSharingAgreement_invite_id_key" ON "DataSharingAgreement"("invite_id");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSharingAgreement" ADD CONSTRAINT "DataSharingAgreement_from_user_id_fkey" FOREIGN KEY ("from_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSharingAgreement" ADD CONSTRAINT "DataSharingAgreement_to_user_id_fkey" FOREIGN KEY ("to_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSharingAgreement" ADD CONSTRAINT "DataSharingAgreement_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "Invite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

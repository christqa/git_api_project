-- AlterTable
ALTER TABLE "AnalytesManualEntry" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "end" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "start" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "CumulativeBaselineValue" ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "CumulativeScore" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "SignedAgreements" ALTER COLUMN "agreed_at" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "StoolData" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "UrineData" ALTER COLUMN "date" SET DATA TYPE TIMESTAMPTZ(3);

-- AddForeignKey
ALTER TABLE "AnalytesManualEntry" ADD CONSTRAINT "AnalytesManualEntry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

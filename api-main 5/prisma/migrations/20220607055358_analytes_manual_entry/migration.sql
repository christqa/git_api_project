-- CreateTable
CREATE TABLE "AnalytesManualEntry" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_urine" BOOLEAN NOT NULL,
    "is_stool" BOOLEAN NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalytesManualEntry_pkey" PRIMARY KEY ("id")
);

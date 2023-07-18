-- CreateTable
CREATE TABLE "CumulativeBaselineValue" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "cumulative_score_type" "CumulativeScoreTypes" NOT NULL,

    CONSTRAINT "CumulativeBaselineValue_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CumulativeBaselineValue" ADD CONSTRAINT "CumulativeBaselineValue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

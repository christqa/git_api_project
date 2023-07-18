-- CreateEnum
CREATE TYPE "CumulativeScoreTypes" AS ENUM ('hydration', 'gut_health');

-- CreateTable
CREATE TABLE "CumulativeScore" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "cumulative_score_type" "CumulativeScoreTypes" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CumulativeScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CumulativeScore" ADD CONSTRAINT "CumulativeScore_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

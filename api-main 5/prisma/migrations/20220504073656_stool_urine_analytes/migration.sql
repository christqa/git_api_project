-- CreateTable
CREATE TABLE "UrineData" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "has_blood" BOOLEAN NOT NULL,
    "duration_in_seconds" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrineData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoolData" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "color" INTEGER NOT NULL,
    "consistency" INTEGER NOT NULL,
    "has_blood" BOOLEAN NOT NULL,
    "duration_in_seconds" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoolData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UrineData" ADD CONSTRAINT "UrineData_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoolData" ADD CONSTRAINT "StoolData_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "UrineFutureData" (
    "id" SERIAL NOT NULL,
    "color" INTEGER NOT NULL,
    "duration_in_seconds" INTEGER NOT NULL,
    "concentration" DECIMAL(4,3) NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(256) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UrineFutureData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoolFutureData" (
    "id" SERIAL NOT NULL,
    "color" INTEGER NOT NULL,
    "has_blood" BOOLEAN NOT NULL,
    "duration_in_seconds" INTEGER NOT NULL,
    "consistency" INTEGER NOT NULL,
    "date" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(256) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StoolFutureData_pkey" PRIMARY KEY ("id")
);

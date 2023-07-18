-- CreateTable
CREATE TABLE "GlobalSettings" (
    "id" SERIAL NOT NULL,
    "setting_name" VARCHAR(250) NOT NULL,
    "setting_type" VARCHAR(250) NOT NULL,
    "setting_value" TEXT NOT NULL,
    "added_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

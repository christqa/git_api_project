ALTER TABLE "UrineData"
    ADD COLUMN IF NOT EXISTS "concentration" DOUBLE PRECISION NOT NULL,
DROP
COLUMN IF EXISTS "has_blood";



-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "exercise_intensity_id" INTEGER;

-- CreateTable
CREATE TABLE "ExerciseIntensity" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "ExerciseIntensity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_exercise_intensity_id_fkey" FOREIGN KEY ("exercise_intensity_id") REFERENCES "ExerciseIntensity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SEEDING ExerciseIntensity
INSERT INTO "ExerciseIntensity" ("text") VALUES ('Light'), ('Moderate'), ('Intense'), ('Very intense');

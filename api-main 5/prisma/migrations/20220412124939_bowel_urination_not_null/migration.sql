-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_bowel_movement_id_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_urinations_per_day_id_fkey";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "bowel_movement_id" DROP NOT NULL,
ALTER COLUMN "urinations_per_day_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_bowel_movement_id_fkey" FOREIGN KEY ("bowel_movement_id") REFERENCES "BowelMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_urinations_per_day_id_fkey" FOREIGN KEY ("urinations_per_day_id") REFERENCES "UrinationsPerDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

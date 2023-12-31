-- CreateEnum
CREATE TYPE "AvailabilityType" AS ENUM ('GENERAL_AVAILABILITY', 'GRADUAL_ROLLOUT_AVAILABILITY', 'INTERNAL_AVAILABILITY');

-- AlterTable
ALTER TABLE "Firmware" ADD COLUMN     "availability_type" "AvailabilityType" NOT NULL DEFAULT 'INTERNAL_AVAILABILITY';

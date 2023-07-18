-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('IN_SERVICE', 'VOID');

-- AlterTable
ALTER TABLE "DeviceInventory" ADD COLUMN     "device_status" "DeviceStatus" NOT NULL DEFAULT 'IN_SERVICE';

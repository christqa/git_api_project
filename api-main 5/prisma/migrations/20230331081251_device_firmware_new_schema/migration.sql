
-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "Status" AS ENUM ('AWAITING_USER_APPROVAL', 'PENDING_INSTALL', 'INSTALLED', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- DropIndex
DROP INDEX IF EXISTS "DeviceSettings_device_id_device_setting_name";

-- AlterTable
ALTER TABLE "DeviceActivation" DROP COLUMN "device_model",
ADD COLUMN     "device_model_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "DeviceFirmware" ADD COLUMN     "approved_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "failure_logs" VARCHAR(1000) NOT NULL DEFAULT E'',
ADD COLUMN     "status" "Status" NOT NULL DEFAULT E'AWAITING_USER_APPROVAL',
ADD COLUMN     "updated_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "DeviceInventory" DROP COLUMN "device_model",
ADD COLUMN     "device_model_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Firmware" DROP COLUMN "battery_controller_firmware",
DROP COLUMN "device_model",
DROP COLUMN "fw_release_date",
DROP COLUMN "icp_firmware",
DROP COLUMN "scb_firmware",
ADD COLUMN     "device_model_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "filename" VARCHAR(50) NOT NULL DEFAULT E'',
ADD COLUMN     "location_metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "md5_checksum" VARCHAR(32) NOT NULL DEFAULT E'2501e15fcc7464a8e7c67aa67d444093',
ADD COLUMN     "release_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "DeviceModel" (
    "id" SERIAL NOT NULL,
    "model" VARCHAR(100) NOT NULL,

    CONSTRAINT "DeviceModel_pkey" PRIMARY KEY ("id")
);
INSERT INTO "DeviceModel" ("id","model") VALUES (1,'Spectra 1A');
-- AddForeignKey
ALTER TABLE "DeviceInventory" ADD CONSTRAINT "DeviceInventory_device_model_id_fkey" FOREIGN KEY ("device_model_id") REFERENCES "DeviceModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceActivation" ADD CONSTRAINT "DeviceActivation_device_model_id_fkey" FOREIGN KEY ("device_model_id") REFERENCES "DeviceModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Firmware" ADD CONSTRAINT "Firmware_device_model_id_fkey" FOREIGN KEY ("device_model_id") REFERENCES "DeviceModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Firmware" (
    "id" SERIAL NOT NULL,
    "virtual_firmware" VARCHAR(50) NOT NULL,
    "icp_firmware" VARCHAR(50) NOT NULL,
    "scb_firmware" VARCHAR(50) NOT NULL,
    "battery_controller_firmware" VARCHAR(50) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "added_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fw_release_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_model" VARCHAR(100) NOT NULL,

    CONSTRAINT "Firmware_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceFirmware" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "firmware_id" INTEGER NOT NULL,
    "added_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_current" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DeviceFirmware_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeviceFirmware" ADD CONSTRAINT "DeviceFirmware_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceFirmware" ADD CONSTRAINT "DeviceFirmware_firmware_id_fkey" FOREIGN KEY ("firmware_id") REFERENCES "Firmware"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "DeviceInventory" RENAME COLUMN "device_serialno" TO "device_serial";

-- RenameIndex
ALTER INDEX "DeviceInventory_device_serialno_key" RENAME TO "DeviceInventory_device_serial_key";

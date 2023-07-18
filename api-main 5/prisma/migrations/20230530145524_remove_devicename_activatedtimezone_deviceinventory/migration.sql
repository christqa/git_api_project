/*
  Warnings:

  - You are about to drop the column `activated_time_zone_id` on the `DeviceInventory` table. All the data in the column will be lost.
  - You are about to drop the column `device_name` on the `DeviceInventory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DeviceInventory" DROP CONSTRAINT "DeviceInventory_activated_time_zone_id_fkey";

-- AlterTable
ALTER TABLE "DeviceInventory" DROP COLUMN "activated_time_zone_id",
DROP COLUMN "device_name";

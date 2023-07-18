/*
  Warnings:

  - A unique constraint covering the columns `[virtual_firmware,device_model_id]` on the table `Firmware` will be added. If there are existing duplicate values, this will fail.

*/
-- Remove duplicates
DELETE FROM "Firmware"
WHERE id IN (
  SELECT id
  FROM "Firmware"
  EXCEPT
  SELECT MIN(id)
  FROM "Firmware"
  GROUP BY virtual_firmware,
    device_model_id
);
-- CreateIndex
CREATE UNIQUE INDEX "Firmware_virtual_firmware_device_model_id_key" ON "Firmware"("virtual_firmware", "device_model_id");

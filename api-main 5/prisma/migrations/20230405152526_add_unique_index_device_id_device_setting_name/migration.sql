/*
  Warnings:

  - A unique constraint covering the columns `[device_id,device_setting_name]` on the table `DeviceSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- Remove duplicates
DELETE FROM "DeviceSettings"
WHERE id IN (
    SELECT id
    FROM "DeviceSettings"
    EXCEPT
    SELECT MIN(id)
    FROM "DeviceSettings"
    GROUP BY device_id,
      device_setting_name
  );

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSettings_device_id_device_setting_name_key" ON "DeviceSettings"("device_id", "device_setting_name");

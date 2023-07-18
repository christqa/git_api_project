-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DeviceSettings_device_id_device_setting_name" ON "DeviceSettings"("device_id", "device_setting_name");

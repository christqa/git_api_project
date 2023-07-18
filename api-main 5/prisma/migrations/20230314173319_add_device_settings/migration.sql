-- CreateTable
CREATE TABLE "DeviceSettings" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "device_setting_name" VARCHAR(250) NOT NULL,
    "device_setting_type" VARCHAR(250) NOT NULL,
    "device_setting_value" TEXT NOT NULL,
    "added_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSettings_device_id_key" ON "DeviceSettings"("device_id");

-- AddForeignKey
ALTER TABLE "DeviceSettings" ADD CONSTRAINT "DeviceSettings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
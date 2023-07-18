-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('device_generated', 'manual_entry');

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER,
    "event_data" JSONB NOT NULL,
    "event_source" "EventSource" NOT NULL,
    "generated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

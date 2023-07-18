-- AlterTable
ALTER TABLE "StoolData" ADD COLUMN     "device_id" INTEGER;

-- AlterTable
ALTER TABLE "UrineData" ADD COLUMN     "device_id" INTEGER;

-- CreateTable
CREATE TABLE "Devices" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "time_zone" TEXT NOT NULL,
    "last_pair_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Devices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Devices" ADD CONSTRAINT "Devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrineData" ADD CONSTRAINT "UrineData_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoolData" ADD CONSTRAINT "StoolData_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

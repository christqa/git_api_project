-- CreateTable
CREATE TABLE "BathroomActivityFiles" (
    "id" SERIAL NOT NULL,
    "bathroom_activity_id" INTEGER NOT NULL,
    "file_metadata" JSONB NOT NULL,
    "filename" TEXT NOT NULL DEFAULT '',
    "created_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_on" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "isFileProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BathroomActivityFiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BathroomActivity" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "event_body" JSONB,
    "started_on" TIMESTAMPTZ(3),
    "ended_on" TIMESTAMPTZ(3),
    "isEventProcessed" BOOLEAN NOT NULL DEFAULT false,
    "eventUuid" UUID NOT NULL,
    "file_location_metadata" JSONB,
    "metadata" JSONB,

    CONSTRAINT "BathroomActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BathroomActivity_eventUuid_key" ON "BathroomActivity"("eventUuid");

-- AddForeignKey
ALTER TABLE "BathroomActivityFiles" ADD CONSTRAINT "BathroomActivityFiles_bathroom_activity_id_fkey" FOREIGN KEY ("bathroom_activity_id") REFERENCES "BathroomActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathroomActivity" ADD CONSTRAINT "BathroomActivity_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BathroomActivity" ADD CONSTRAINT "BathroomActivity_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "UnprocessedEvents" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "event_body" JSONB NOT NULL,
    "started_on" TIMESTAMPTZ(3) NOT NULL,
    "ended_on" TIMESTAMPTZ(3),
    "isEventProcessed" BOOLEAN NOT NULL DEFAULT false,
    "eventUuid" UUID NOT NULL,
    "total_file_count" INTEGER,

    CONSTRAINT "UnprocessedEvents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFiles" (
    "id" SERIAL NOT NULL,
    "unprocessed_event_id" INTEGER NOT NULL,
    "file_metadata" JSONB NOT NULL,
    "created_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_on" TIMESTAMPTZ(3) DEFAULT CURRENT_TIMESTAMP,
    "isFileProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventFiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnprocessedEvents_eventUuid_key" ON "UnprocessedEvents"("eventUuid");

-- AddForeignKey
ALTER TABLE "UnprocessedEvents" ADD CONSTRAINT "UnprocessedEvents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnprocessedEvents" ADD CONSTRAINT "UnprocessedEvents_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFiles" ADD CONSTRAINT "EventFiles_unprocessed_event_id_fkey" FOREIGN KEY ("unprocessed_event_id") REFERENCES "UnprocessedEvents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

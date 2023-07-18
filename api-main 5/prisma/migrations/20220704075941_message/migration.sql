-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "message_type_id" INTEGER NOT NULL,
    "link" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessageConfig" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message_type_id" INTEGER NOT NULL,
    "notify" BOOLEAN NOT NULL,

    CONSTRAINT "UserMessageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageType" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "MessageType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_type_id_fkey" FOREIGN KEY ("message_type_id") REFERENCES "MessageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessageConfig" ADD CONSTRAINT "UserMessageConfig_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessageConfig" ADD CONSTRAINT "UserMessageConfig_message_type_id_fkey" FOREIGN KEY ("message_type_id") REFERENCES "MessageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

--SEEDING
INSERT INTO "MessageType" ("text") VALUES
('occult blood detected'),
('low battery'),
('connection issue'),
('connection established'),
('share request received'),
('share request approved')

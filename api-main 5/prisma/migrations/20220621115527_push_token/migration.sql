-- CreateTable
CREATE TABLE "PushToken" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "device_token" VARCHAR(256) NOT NULL,
    "endpoint_id" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_user_id_device_token_key" ON "PushToken"("user_id", "device_token");

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

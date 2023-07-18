-- CreateTable
CREATE TABLE "ShareUsage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "agreed" BOOLEAN NOT NULL,

    CONSTRAINT "ShareUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareUsage_user_id_key" ON "ShareUsage"("user_id");

-- AddForeignKey
ALTER TABLE "ShareUsage" ADD CONSTRAINT "ShareUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

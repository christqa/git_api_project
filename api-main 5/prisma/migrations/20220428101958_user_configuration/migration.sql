-- CreateTable
CREATE TABLE "UserConfiguration" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "configuration" JSONB NOT NULL,

    CONSTRAINT "UserConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfiguration_user_id_key" ON "UserConfiguration"("user_id");

-- AddForeignKey
ALTER TABLE "UserConfiguration" ADD CONSTRAINT "UserConfiguration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

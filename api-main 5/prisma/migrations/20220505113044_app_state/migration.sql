-- CreateTable
CREATE TABLE "AppState" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "AppState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppState_user_id_key" ON "AppState"("user_id");

-- AddForeignKey
ALTER TABLE "AppState" ADD CONSTRAINT "AppState_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

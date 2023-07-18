-- CreateTable
CREATE TABLE "UserMobile" (
    "id" SERIAL NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "push_token_id" INTEGER NOT NULL,

    CONSTRAINT "UserMobile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserMobile_push_token_id_key" ON "UserMobile"("push_token_id");

-- AddForeignKey
ALTER TABLE "UserMobile" ADD CONSTRAINT "UserMobile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMobile" ADD CONSTRAINT "UserMobile_push_token_id_fkey" FOREIGN KEY ("push_token_id") REFERENCES "PushToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Delete PushToken ids duplicate values
DELETE FROM "UserMobile" um WHERE EXISTS (SELECT FROM "UserMobile" WHERE push_token_id = um.push_token_id AND id < um.id);

-- DropIndex
DROP INDEX "UserMobile_push_token_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "UserMobile_user_id_push_token_id_key" ON "UserMobile"("user_id", "push_token_id");

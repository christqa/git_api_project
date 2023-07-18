/*
  Warnings:

  - A unique constraint covering the columns `[user_id,notification_settings_type]` on the table `NotificationSettings` will be added. If there are existing duplicate values, this will fail.

*/
DELETE FROM "NotificationSettings"
WHERE id IN (
  SELECT id
  FROM "NotificationSettings"
  EXCEPT
  SELECT MIN(id)
  FROM "NotificationSettings"
  GROUP BY user_id,
    notification_settings_type
);
-- CreateIndex
CREATE UNIQUE INDEX "NotificationSettings_user_id_notification_settings_type_key" ON "NotificationSettings"("user_id", "notification_settings_type");

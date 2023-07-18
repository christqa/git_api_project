DELETE FROM "NotificationSettings" WHERE "NotificationSettings".notification_settings_type='email';
DELETE FROM "MessageType" WHERE "MessageType".notification_settings_type = 'email';
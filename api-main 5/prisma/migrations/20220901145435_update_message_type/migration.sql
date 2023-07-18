-- AlterTable
ALTER TABLE "MessageType" ADD COLUMN "notification_settings_type" "NotificationSettingsTypes" NOT NULL DEFAULT E'device_issues';
update "MessageType" set notification_settings_type='system_alerts' where id='1';
update "MessageType" set notification_settings_type='device_issues' where id='2';
update "MessageType" set notification_settings_type='device_issues' where id='3';
update "MessageType" set notification_settings_type='device_issues' where id='4';
update "MessageType" set notification_settings_type='device_issues' where id='5';
update "MessageType" set notification_settings_type='device_issues' where id='6';

ALTER TABLE "MessageType" ALTER COLUMN "notification_settings_type" DROP DEFAULT;

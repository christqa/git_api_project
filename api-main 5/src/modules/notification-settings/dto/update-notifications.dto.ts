import {
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from '../notification-settings.type';

export interface IUpdateNotificationSettingsRequestDto {
  type: NotificationSettingsTypes;
  option: NotificationSettingsOptions;
  sms: boolean;
  push: boolean;
  email: boolean;
}

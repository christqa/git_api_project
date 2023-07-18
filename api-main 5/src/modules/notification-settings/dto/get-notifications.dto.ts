import {
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from '../notification-settings.type';

export interface IGetNotificationSettingsResponseDto {
  type: NotificationSettingsTypes;
  option: NotificationSettingsOptions;
  sms: boolean;
  push: boolean;
}

export interface IGetNotificationSettingsInternalRequestDto {
  userGuid: string;
}

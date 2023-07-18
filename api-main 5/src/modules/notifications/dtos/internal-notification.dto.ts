export interface ITriggerPushNotificationRequestDto {
  userGuid: string;
  title: string;
  type: string;
  message: string;
  link?: string;
  // eslint-disable-next-line
  customInfo?: { [key: string]: any };
}

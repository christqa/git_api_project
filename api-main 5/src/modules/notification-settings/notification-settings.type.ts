import { NotificationSettings } from '@prisma/client';

export type INotificationSettings = NotificationSettings;

export type INotificationSettingsResponse = Omit<
  NotificationSettings,
  'id' | 'userId'
>;

export enum NotificationSettingsTypes {
  deviceIssues = 'deviceIssues',
  healthAlerts = 'healthAlerts',
  notifications = 'notifications',
  feedbackSurvey = 'feedbackSurvey',
}

export enum NotificationSettingsOptions {
  immediately = 'immediately',
  daily = 'daily',
  weekly = 'weekly',
}

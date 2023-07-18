import {
  INotificationSettings,
  INotificationSettingsResponse,
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from '@modules/notification-settings/notification-settings.type';
import { PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';

const { notificationSettings } = prisma;

const findMany = (
  userId: number,
  type?: NotificationSettingsTypes,
  option?: NotificationSettingsOptions
): Promise<INotificationSettingsResponse[]> => {
  return notificationSettings.findMany({
    where: {
      userId,
      type,
      option,
    },
    select: {
      push: true,
      email: true,
      sms: true,
      option: true,
      type: true,
    },
  });
};

const createMany = (
  data: INotificationSettings[],
  prismaTr?: PrismaClient
): Promise<{ count: number }> => {
  return (prismaTr || prisma).notificationSettings.createMany({
    data,
    skipDuplicates: true,
  });
};

const update = async (
  data: INotificationSettings,
  userId: number,
  type: NotificationSettingsTypes,
  prismaTr?: PrismaClient
): Promise<void> => {
  await (prismaTr || prisma).notificationSettings.updateMany({
    where: {
      userId,
      type,
    },
    data,
  });
};

export { findMany, update, createMany };

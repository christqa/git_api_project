import { PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';

import * as notificationSettingsRepository from '@repositories/notification-settings.repository';
import {
  INotificationSettings,
  INotificationSettingsResponse,
  NotificationSettingsOptions,
  NotificationSettingsTypes,
} from './notification-settings.type';
import {
  IGetNotificationSettingsResponseDto,
  IUpdateNotificationSettingsRequestDto,
} from './dto/notification-settings.index.dto';
import { userService } from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';

const findNotificationSettings = async (
  userGuid: string,
  type?: NotificationSettingsTypes,
  option?: NotificationSettingsOptions
): Promise<IGetNotificationSettingsResponseDto[]> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const settings = await notificationSettingsRepository.findMany(
    userId,
    type,
    option
  );

  // check for missing notification settings types
  const currentSettingsTypes = settings.map((setting) => setting.type);
  const allSettingsTypes = Object.values(NotificationSettingsTypes);
  const missingSettingsTypes = allSettingsTypes.filter(
    (notificationSettingsType) =>
      !currentSettingsTypes.includes(notificationSettingsType)
  );

  // create default notification settings
  if (!settings.length || (!type && !option && missingSettingsTypes.length)) {
    await createDefaultNotificationSettings(userId, missingSettingsTypes);
    return (await notificationSettingsRepository.findMany(
      userId
    )) as IGetNotificationSettingsResponseDto[];
  }
  return settings as IGetNotificationSettingsResponseDto[];
};

const createDefaultNotificationSettings = async (
  userId: number,
  notificationSettingsTypes?: string[],
  prismaTr?: PrismaClient
) => {
  let data = Object.values(NotificationSettingsTypes).map((type) => {
    let push = true;
    const sms = false;
    let email = false;
    let option = NotificationSettingsOptions.immediately;

    switch (NotificationSettingsTypes[type]) {
      case NotificationSettingsTypes.deviceIssues:
        push = true;
        email = true;
        option = NotificationSettingsOptions.immediately;
        break;
      case NotificationSettingsTypes.healthAlerts:
        push = true;
        option = NotificationSettingsOptions.daily;
        break;
      case NotificationSettingsTypes.notifications:
        push = false;
        email = true;
        option = NotificationSettingsOptions.immediately;
        break;
      default:
        break;
    }

    return {
      userId,
      type: NotificationSettingsTypes[type],
      push,
      sms,
      email,
      option,
    } as INotificationSettings;
  });
  // create only missing types if are defined
  if (notificationSettingsTypes?.length) {
    data = data.filter((item) => notificationSettingsTypes.includes(item.type));
  }
  await notificationSettingsRepository.createMany(data, prismaTr);
};

const updateNotificationSettings = async (
  userGuid: string,
  data: IUpdateNotificationSettingsRequestDto[]
) => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  await findNotificationSettings(userGuid);
  await prisma.$transaction(async (prismaClient) => {
    for (const item of data) {
      await notificationSettingsRepository.update(
        {
          sms: item.sms,
          push: item.push,
          option: item.option,
          email: item.email,
        } as INotificationSettings,
        userId,
        item.type,
        prismaClient as PrismaClient
      );
    }
  });
};

const findNotificationSettingsByUser = async (
  userGuid: string
): Promise<INotificationSettingsResponse[]> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  return notificationSettingsRepository.findMany(userId);
};

export {
  findNotificationSettings,
  updateNotificationSettings,
  createDefaultNotificationSettings,
  findNotificationSettingsByUser,
};

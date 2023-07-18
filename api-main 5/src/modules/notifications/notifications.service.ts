import { Prisma, PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';

import { PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT } from '@core/error-handling/error.middleware';
import pushTokenRepository from '@repositories/push-token.repository';
import {
  publishMessage,
  registerDevice,
  unregisterDevice,
} from '@modules/notifications/push-notification.service';
import { IPushTokenRequestDto } from './dtos/notifications.index.dto';
import { IPushToken, IPushTokenWhereInput } from './push-token.type';
import { noDeviceToken } from './notifications.error';
import logger from '@core/logger/logger';
import { login } from '@modules/user-mobile/user-mobile.service';
import config from '@core/enviroment-variable-config';

const findPushToken = async (
  where: IPushTokenWhereInput
): Promise<IPushToken | null> => {
  return pushTokenRepository.findFirst(where);
};

const createPushToken = async (
  userGuid: string,
  pushTokenRequestDTO: IPushTokenRequestDto
): Promise<void> => {
  const pushToken = await findPushToken({
    ...pushTokenRequestDTO,
  });

  if (pushToken) {
    await login(
      {
        deviceToken: pushTokenRequestDTO.deviceToken,
      },
      userGuid
    );
    return;
  }

  const createdEndpoint = await registerDevice(pushTokenRequestDTO.deviceToken);

  try {
    await pushTokenRepository.create({
      endpointId: createdEndpoint.EndpointArn,
      ...pushTokenRequestDTO,
    } as IPushToken);
    await login(
      {
        deviceToken: pushTokenRequestDTO.deviceToken,
      },
      userGuid
    );
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code !== PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT)
    ) {
      unregisterDevice(createdEndpoint.EndpointArn as string);
    }
    throw error;
  }
};

const deletePushToken = async (
  pushTokenRequestDTO: IPushTokenRequestDto
): Promise<void> => {
  const foundPushToken = await pushTokenRepository.findFirst({
    ...pushTokenRequestDTO,
  });

  if (!foundPushToken) {
    throw noDeviceToken();
  }

  await prisma.$transaction(async (prismaClient) => {
    await pushTokenRepository.remove(
      {
        id: foundPushToken.id,
      },
      prismaClient as PrismaClient
    );
    await unregisterDevice(foundPushToken.endpointId);
  });
};

const triggerPushNotifications = async (
  userGuid: string,
  title: string,
  message: string,
  link: string,
  notifType = 'generic',
  // eslint-disable-next-line
  customInfo?: { [key: string]: any }
): Promise<void> => {
  try {
    const pushTokens =
      await pushTokenRepository.findActiveDeviceTokenManyByUserGuid(userGuid);

    // no tokens
    if (!pushTokens.length) {
      logger.info(`Push tokens not found for user guid: ${userGuid}`);
      return;
    }

    // send push notifications
    await Promise.all(
      pushTokens.map(({ endpointId }) =>
        publishMessage(
          endpointId,
          title,
          message,
          link || config.iosNotificationDeepLinkPrefix,
          customInfo
        )
      )
    );

    logger.info(
      `Successfully sent push notifications to user guid: ${userGuid}, notification type ${notifType}`
    );
  } catch (error) {
    logger.error(
      `Failed to send push notifications to user guid: ${userGuid}, ${error}`
    );
  }
};

export default {
  createPushToken,
  findPushToken,
  deletePushToken,
  triggerPushNotifications,
};

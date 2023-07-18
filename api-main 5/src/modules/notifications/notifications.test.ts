import httpStatus from 'http-status';
import { PrismaClient } from '@prisma/client';
import * as pushNotificationService from '@modules/notifications/push-notification.service';
import ApiError from '@core/error-handling/api-error';
import notificationService from './notifications.service';
import pushTokenRepository from '@repositories/push-token.repository';
import { IPushToken } from './push-token.type';
import userMobileRepository from '@repositories/user-mobile.repository';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { generateUser } from '@test/utils/generate';

const pushTokenObject = {
  id: 1,
  userId: 1,
  deviceToken: 'deviceToken',
  endpointId: 'endpointId',
  timestamp: new Date(),
} as IPushToken;

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);

  jest.spyOn(PrismaClient.prototype, '$transaction').mockResolvedValue(null);
  jest
    .spyOn(pushTokenRepository, 'findFirst')
    .mockResolvedValue(pushTokenObject);
  jest
    .spyOn(pushTokenRepository, 'findActiveDeviceTokenMany')
    .mockResolvedValue([pushTokenObject]);
  jest
    .spyOn(pushTokenRepository, 'findActiveDeviceTokenManyByUserGuid')
    .mockResolvedValue([pushTokenObject]);
  jest.spyOn(pushTokenRepository, 'create').mockResolvedValue(pushTokenObject);
  jest.spyOn(pushTokenRepository, 'remove').mockResolvedValue(undefined);
  jest
    .spyOn(pushNotificationService, 'registerDevice')
    // eslint-disable-next-line
    .mockResolvedValue({} as unknown as any);
  jest
    .spyOn(pushNotificationService, 'unregisterDevice')
    // eslint-disable-next-line
    .mockResolvedValue({} as unknown as any);
  jest
    .spyOn(pushNotificationService, 'publishMessage')
    // eslint-disable-next-line
    .mockResolvedValue({} as unknown as any);
  const userMobile = {
    id: 1,
    active: true,
    updatedAt: new Date(),
    createdAt: new Date(),
    userId: 1,
    pushTokenId: 1,
  };
  jest.spyOn(userMobileRepository, 'upsert').mockResolvedValue(userMobile);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Notifications', () => {
  test('should test createPushToken function', async () => {
    jest.spyOn(pushTokenRepository, 'findFirst').mockResolvedValueOnce(null);
    await notificationService.createPushToken(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        deviceToken: 'deviceToken',
      }
    );
  });

  test('should test createPushToken function (409 device token already exists)', async () => {
    try {
      await notificationService.createPushToken(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          deviceToken: 'deviceToken',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.message).toBe('Device token already exists');
    }
  });

  test('should test createPushToken function (unregister device on fail)', async () => {
    jest.spyOn(pushTokenRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(pushTokenRepository, 'create').mockRejectedValue('Error');

    try {
      await notificationService.createPushToken(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          deviceToken: 'deviceToken',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(
        jest.spyOn(pushNotificationService, 'unregisterDevice')
      ).toHaveBeenCalledTimes(1);
    }
  });

  test('should test deletePushToken function', async () => {
    await notificationService.deletePushToken({
      deviceToken: 'deviceToken',
    });
  });

  test('should test deletePushToken function (404 device token not found)', async () => {
    jest.spyOn(pushTokenRepository, 'findFirst').mockResolvedValue(null);

    try {
      await notificationService.deletePushToken({
        deviceToken: 'deviceToken',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('notifications_no_device_token');
    }
  });

  test('should test triggerPushNotifications function', async () => {
    await notificationService.triggerPushNotifications(
      '1',
      'sent title',
      'sent message',
      '1',
      ''
    );
    expect(
      jest.spyOn(pushNotificationService, 'publishMessage')
    ).toHaveBeenCalledTimes(1);
  });

  test('should test triggerPushNotifications function (push tokens empty list)', async () => {
    jest
      .spyOn(pushTokenRepository, 'findActiveDeviceTokenManyByUserGuid')
      .mockResolvedValue([]);
    await notificationService.triggerPushNotifications(
      '1',
      'sent title',
      'sent message',
      '1',
      ''
    );
    expect(
      jest.spyOn(pushNotificationService, 'publishMessage')
    ).toHaveBeenCalledTimes(0);
  });
});

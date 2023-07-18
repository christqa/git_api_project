import * as userMobileService from '@modules/user-mobile/user-mobile.service';
import pushTokenRepository from '@repositories/push-token.repository';
import userMobileRepository from '@repositories/user-mobile.repository';
import { IPushToken } from '@modules/notifications/push-token.type';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import { userService } from '@modules/index/index.service';
import { IUser } from '@modules/user/user.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  const pushTokenObject = {
    id: 1,
    userId: 1,
    deviceToken: 'deviceToken',
    endpointId: 'endpointId',
    timestamp: new Date(),
  } as IPushToken;
  const userMobile = {
    id: 1,
    active: true,
    updatedAt: new Date(),
    createdAt: new Date(),
    userId: 1,
    pushTokenId: 1,
  };
  jest
    .spyOn(pushTokenRepository, 'findFirst')
    .mockResolvedValue(pushTokenObject);
  jest.spyOn(userMobileRepository, 'upsert').mockResolvedValue(userMobile);
  jest.spyOn(userMobileRepository, 'update').mockResolvedValue(userMobile);
  jest.spyOn(userService, 'findOne').mockResolvedValue({ id: 1 } as IUser);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('User Mobile', () => {
  test('should test login function (404 device token not found)', async () => {
    try {
      jest.spyOn(pushTokenRepository, 'findFirst').mockResolvedValueOnce(null);
      await userMobileService.login(
        {
          deviceToken: 'abc123',
        },
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('user_mobile_device_token_not_found');
    }
  });

  test('should test logout function (404 device token not found)', async () => {
    try {
      jest.spyOn(pushTokenRepository, 'findFirst').mockResolvedValueOnce(null);
      await userMobileService.logout({
        userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
        deviceToken: 'abc123',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('user_mobile_device_token_not_found');
    }
  });

  test('should test login function', async () => {
    await userMobileService.login(
      {
        deviceToken: 'abc123',
      },
      '1'
    );
  });

  test('should test logout function', async () => {
    await userMobileService.logout({
      userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
      deviceToken: 'abc123',
    });
  });
});

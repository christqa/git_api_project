import { generateAuth0User, generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import {
  checkUserDeviceByUserId,
  findMe,
  getMedicalConditionTexts,
  getMedicationTexts,
  getUserByDeviceSerial,
  getUserByProfileId,
  getAllUsers,
  passwordReset,
  getUsersByDeviceTZ,
} from './user.service';
import * as authService from '@modules/auth/auth.service';
import {
  deviceActivationService,
  signedAgreementsService,
  userService,
} from '@modules/index/index.service';
import * as notificationSettingsRepository from '@repositories/notification-settings.repository';
import inviteRepository from '@repositories/invite.repository';
import ApiError from '@core/error-handling/api-error';
import axios from 'axios';
import { IUser } from './user.type';
import profileRepository from '@repositories/profile.repository';
import userMobileRepository from '@repositories/user-mobile.repository';
import groupUsersRepository from '@repositories/group-users.repository';

jest.mock('@prisma/client');
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const userDevice = {
  deviceSerial: 'test',
  deviceName: 'test',
  timeZoneId: 1,
  activatedOn: 'test',
};
const auth0User = generateAuth0User();
const userData = generateUser({
  email: auth0User.email,
});

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userData);
  jest
    .spyOn(deviceActivationService, 'findDevices')
    .mockResolvedValue([userDevice]);
  jest
    .spyOn(userRepository, 'findOneByDeviceSerial')
    .mockResolvedValue(userData);
  jest
    .spyOn(userRepository, 'usersFindMany')
    .mockResolvedValueOnce({ count: 1, users: [userData] });
  jest.spyOn(userRepository, 'findManyByDeviceTZ').mockResolvedValueOnce([
    {
      userGuid: userData.userGuid,
      email: userData.email,
      profile: { id: 1 },
    },
  ]);
});

beforeAll(() => {
  jest.resetAllMocks();
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('UserController', () => {
  describe('getMe', () => {
    test('should return new User', async () => {
      const auth0User = generateAuth0User();
      const userData = generateUser({
        email: auth0User.email,
      });
      jest.spyOn(userRepository, 'findMe').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockResolvedValueOnce(userData);
      jest
        .spyOn(authService, 'findUserByAuthId')
        .mockResolvedValueOnce(auth0User);
      jest
        .spyOn(notificationSettingsRepository, 'createMany')
        .mockResolvedValue({
          count: 3,
        });
      jest.spyOn(inviteRepository, 'updateMany').mockResolvedValueOnce();
      jest
        .spyOn(groupUsersRepository, 'groupsFindManyMe')
        .mockResolvedValueOnce([]);
      const user = await findMe(userData.authId, [], false);
      expect(user).toMatchObject(userData);
      expect(userRepository.findMe).toHaveBeenCalledTimes(1);
      expect(authService.findUserByAuthId).toHaveBeenCalledTimes(1);
    });

    test('should return the User', async () => {
      const userData = generateUser();
      jest.spyOn(userRepository, 'findMe').mockResolvedValueOnce(userData);
      jest.spyOn(signedAgreementsService, 'createSignedAgreements');
      jest
        .spyOn(signedAgreementsService, 'findShareAgreement')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(signedAgreementsService, 'findLastAgreementVersions')
        .mockResolvedValueOnce({
          privacyPolicyVersion: 1,
          termsAndConditionsVersion: 1,
        });
      jest
        .spyOn(userMobileRepository, 'findUserMobilePushTokens')
        .mockResolvedValueOnce([]);
      jest
        .spyOn(groupUsersRepository, 'groupsFindManyMe')
        .mockResolvedValueOnce([]);
      const user = await findMe(userData.authId, [], false);
      expect(user).toMatchObject(userData);
      expect(userRepository.findMe).toHaveBeenCalled();
    });
  });

  describe('getMedicalConditionTexts', () => {
    test('should test getMedicalConditionTexts function (no data)', async () => {
      const auth0User = generateAuth0User() as IUser;
      auth0User.profile = {};

      const medicalConditionTexts = await getMedicalConditionTexts(
        auth0User.profile
      );
      expect(medicalConditionTexts).toHaveLength(0);
    });

    test('should test getMedicalConditionTexts function (with data)', async () => {
      const auth0User = generateAuth0User() as IUser;
      auth0User.profile = {
        medicalConditionIds: [1, 2],
      };

      jest
        .spyOn(profileRepository, 'findMedicalConditionById')
        .mockResolvedValue({ id: 1, text: 'test' });

      const medicalConditionTexts = await getMedicalConditionTexts(
        auth0User.profile
      );
      expect(medicalConditionTexts[0]).toBe('test');
      expect(medicalConditionTexts[1]).toBe('test');
    });
  });

  describe('getMedicationTexts', () => {
    test('should test getMedicationTexts function (no data)', async () => {
      const auth0User = generateAuth0User() as IUser;
      auth0User.profile = {};

      const medicationTexts = await getMedicationTexts(auth0User.profile);
      expect(medicationTexts).toHaveLength(0);
    });

    test('should test getMedicationTexts function (with data)', async () => {
      const auth0User = generateAuth0User() as IUser;
      auth0User.profile = {
        medicationIds: [1, 2],
      };

      jest
        .spyOn(profileRepository, 'findMedicationById')
        .mockResolvedValue({ id: 1, text: 'test' });

      const medicationTexts = await getMedicationTexts(auth0User.profile);
      expect(medicationTexts[0]).toBe('test');
      expect(medicationTexts[1]).toBe('test');
    });
  });

  describe('passwordReset', () => {
    test('should test passwordReset function', async () => {
      jest
        .spyOn(authService, 'managementApiAccessToken')
        .mockResolvedValue('jwt');
      mockedAxios.request.mockResolvedValue({
        response: {
          data: {},
        },
      });
      mockedAxios.post.mockResolvedValue({
        response: {
          data: {
            message: 'OK',
          },
        },
      });

      await passwordReset('test@test.com');
    });

    test('should test passwordReset function (passwordResetError case 1)', async () => {
      jest
        .spyOn(authService, 'managementApiAccessToken')
        .mockResolvedValue('jwt');
      mockedAxios.request.mockResolvedValue({
        response: {
          data: {},
        },
      });
      mockedAxios.post.mockRejectedValue({});

      try {
        await passwordReset('test@test.com');
        // eslint-disable-next-line
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(400);
        expect(JSON.parse(error.message).key).toBe('user_something_went_wrong');
      }
    });
  });

  describe('getUserByProfileId', () => {
    test('should test getUserByProfileId function', async () => {
      const userData = generateUser();
      jest
        .spyOn(userRepository, 'findFirstByProfileId')
        .mockResolvedValueOnce(userData);
      const users = await getUserByProfileId(1);
      expect(users).toMatchObject({
        id: userData.id,
        userGuid: userData.userGuid,
        email: userData.email,
      });
      expect(userRepository.findFirstByProfileId).toHaveBeenCalled();
    });

    test('should test getUserByProfileId function (user not found)', async () => {
      jest
        .spyOn(userRepository, 'findFirstByProfileId')
        .mockResolvedValueOnce(null);
      try {
        await getUserByProfileId(1);
        // eslint-disable-next-line
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(404);
        expect(error.localised.key).toBe('user_user_not_found');
      }
    });
  });

  test('should test checkUserDevice function', async () => {
    await checkUserDeviceByUserId(1);
    expect(deviceActivationService.findDevices).toBeCalled();
  });

  test('should test checkUserDevice function with error', async () => {
    jest.spyOn(deviceActivationService, 'findDevices').mockResolvedValue([]);
    try {
      await checkUserDeviceByUserId(1);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(400);
      expect(error.localised.key).toBe('user_user_has_no_device');
    }
  });

  test('should test getUserByDeviceSerial function', async () => {
    await getUserByDeviceSerial('test');
    expect(userRepository.findOneByDeviceSerial).toBeCalled();
  });

  test('should test getAllUsers function', async () => {
    await getAllUsers(0, 10);
    expect(userRepository.usersFindMany).toBeCalled();
  });

  test('should test getUsersByDeviceTZ function', async () => {
    await getUsersByDeviceTZ('+00', 0, 10);
    expect(userRepository.findManyByDeviceTZ).toBeCalled();
  });
});

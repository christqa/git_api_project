import httpStatus from 'http-status';
import dataSharingAgreementRepository from '@repositories/data-sharing-agreement.repository';
import ApiError from '@core/error-handling/api-error';
import {
  dataSharingAgreementService,
  userService,
} from '@modules/index/index.service';
import {
  IDataSharingAgreement,
  IDataSharingAgreementExtended,
} from './data-sharing-agreement.type';
import { dataSharingAgreementAuthMiddleware } from './data-sharing-agreement.middleware';
import { TEST_USER } from '@test/api-test-cases/core/constants';
import userRepository from '@repositories/user.repository';
import { generateUser } from '@test/utils/generate';
import { IUser } from '@modules/user/user.type';
import { IGetUserProfileResponseDto } from '@modules/user/dtos/get-me.dto';

let userData: IGetUserProfileResponseDto | IUser | Promise<IUser | null> | null;

const dataSharingAgreementObject = {
  id: 1,
  agreementId: '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
  invitationId: 1,
  fromUserId: 1,
  fromUser: {
    authId: '123',
  },
  toUserId: 2,
  permissions: ['read', 'write', 'delete'],
  agreedAt: new Date(),
  revokedAt: null,
} as IDataSharingAgreementExtended | null;

beforeEach(() => {
  jest
    .spyOn(dataSharingAgreementRepository, 'findFirst')
    .mockResolvedValue(dataSharingAgreementObject);
  jest
    .spyOn(dataSharingAgreementRepository, 'update')
    .mockResolvedValue(dataSharingAgreementObject as IDataSharingAgreement);
  userData = generateUser({
    email: 'test@test.com',
  });
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userData);
  jest.spyOn(userRepository, 'findMe').mockResolvedValue(userData);
  jest.spyOn(userService, 'findMe').mockResolvedValue(userData);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Data Sharing Agreement', () => {
  test('should test dataSharingAgreementAuthMiddleware function with exception no api permissions length', async () => {
    const request = {
      method: 'GET',
    };
    try {
      await dataSharingAgreementAuthMiddleware(
        request as any,
        [],
        '123',
        TEST_USER
      );
    } catch (ex) {
      expect((ex as ApiError).status).toBe(httpStatus.FORBIDDEN);
    }
  });
  test('should test dataSharingAgreementAuthMiddleware function with no id or current user', async () => {
    const request = {
      method: 'GET',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['read'],
      null,
      TEST_USER
    );
  });

  test('should test dataSharingAgreementAuthMiddleware function with recognized method GET', async () => {
    const request = {
      method: 'GET',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['read'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function with recognized method POST', async () => {
    const request = {
      method: 'POST',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['write'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function with recognized method PUT', async () => {
    const request = {
      method: 'PUT',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['write'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function with recognized method PATCH', async () => {
    const request = {
      method: 'PATCH',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['write'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function with recognized method DELETE', async () => {
    const request = {
      method: 'DELETE',
    };
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['delete'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function no agreement', async () => {
    const request = {
      method: 'GET',
    };
    const dataSharingAgreementObjectNoAuthUser = {
      id: 1,
      agreementId: '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
      invitationId: 1,
      fromUserId: 1,
      toUserId: 2,
      permissions: ['read'],
      agreedAt: new Date(),
      revokedAt: null,
    } as IDataSharingAgreementExtended | null;
    jest
      .spyOn(dataSharingAgreementRepository, 'findFirst')
      .mockResolvedValue(dataSharingAgreementObjectNoAuthUser);
    await dataSharingAgreementAuthMiddleware(
      request as any,
      ['read'],
      '123',
      TEST_USER
    );
  });
  test('should test dataSharingAgreementAuthMiddleware function with unrecognized method', async () => {
    try {
      const request = {
        method: 'XYZ',
      };
      await dataSharingAgreementAuthMiddleware(
        request as any,
        ['read'],
        '123',
        TEST_USER
      );
    } catch (ex) {
      expect((ex as ApiError).status).toBe(httpStatus.FORBIDDEN);
    }
  });
});

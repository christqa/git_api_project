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
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';

const dataSharingAgreementObject = {
  id: 1,
  agreementId: '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
  invitationId: 1,
  fromUserId: 1,
  toUserId: 2,
  permissions: ['read'],
  agreedAt: new Date(),
  revokedAt: null,
} as IDataSharingAgreementExtended | null;

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest
    .spyOn(dataSharingAgreementRepository, 'findFirst')
    .mockResolvedValue(dataSharingAgreementObject);
  jest
    .spyOn(dataSharingAgreementRepository, 'update')
    .mockResolvedValue(dataSharingAgreementObject as IDataSharingAgreement);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Data Sharing Agreement', () => {
  test('should test getDataSharingAgreement function', async () => {
    await dataSharingAgreementService.getDataSharingAgreement(
      '1',
      '30afe0ce-f76c-461a-8e28-2408b4b2dc1c'
    );
    expect(dataSharingAgreementRepository.findFirst).toHaveBeenCalledTimes(1);
  });

  test('should test revokeDataSharingAgreement function', async () => {
    await dataSharingAgreementService.revokeDataSharingAgreement(
      '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
      '1'
    );
  });

  test('should test revokeDataSharingAgreement function (404)', async () => {
    jest
      .spyOn(dataSharingAgreementRepository, 'findFirst')
      .mockResolvedValue(null);

    try {
      await dataSharingAgreementService.revokeDataSharingAgreement(
        '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
    }
  });

  test('should test revokeDataSharingAgreement function (400)', async () => {
    jest.spyOn(dataSharingAgreementRepository, 'findFirst').mockResolvedValue({
      ...dataSharingAgreementObject,
      revokedAt: new Date(),
    } as IDataSharingAgreementExtended);

    try {
      await dataSharingAgreementService.revokeDataSharingAgreement(
        '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
    }
  });
});

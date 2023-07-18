import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import signedAgreementsRepository from '@repositories/signed-agreements.repository';
import { AgreementTypes } from '@prisma/client';
import {
  signedAgreementsService,
  userService,
} from '@modules/index/index.service';
import userRepository from '@repositories/user.repository';
import { generateUser } from '@test/utils/generate';
import agreementsRepository from '@repositories/agreements.repository';

const signedAgreementObject = {
  id: 1,
  agreementId: 1,
  userId: 1,
  agreedAt: new Date(),
};
const shareUsageObject = {
  id: 1,
  userId: 1,
  agreed: true,
};

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(agreementsRepository, 'findFirst').mockResolvedValue({
    agreementType: AgreementTypes.privacyPolicy,
    version: 1,
    url: 'http://url.com',
    localeIso: 'en',
    id: 1,
  });
  jest
    .spyOn(signedAgreementsRepository, 'findFirst')
    .mockResolvedValue(signedAgreementObject);
  jest
    .spyOn(signedAgreementsRepository, 'create')
    .mockResolvedValue(signedAgreementObject);
  jest
    .spyOn(signedAgreementsRepository, 'findLastAgreementVersion')
    .mockResolvedValue(1);
  jest
    .spyOn(signedAgreementsRepository, 'updateShareUsage')
    .mockResolvedValue(shareUsageObject);
  jest
    .spyOn(signedAgreementsRepository, 'findFirstShareUsage')
    .mockResolvedValue(shareUsageObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Signed Agreements', () => {
  test('should test createAgreement function', async () => {
    const createSignedAgreements =
      await signedAgreementsService.createSignedAgreements(
        {
          privacyPolicyVersion: 1,
          termsAndConditionsVersion: 1,
          shareUsageAgreed: true,
        },
        '1'
      );
    expect(createSignedAgreements).toBeUndefined();
  });

  test('should test createAgreement function (different agreements versions)', async () => {
    const createSignedAgreements =
      await signedAgreementsService.createSignedAgreements(
        {
          privacyPolicyVersion: 2,
          termsAndConditionsVersion: 2,
          shareUsageAgreed: true,
        },
        '1'
      );
    expect(createSignedAgreements).toBeUndefined();
  });

  test('should test createAgreement function (different agreements versions create if not exists)', async () => {
    jest.spyOn(signedAgreementsRepository, 'findFirst').mockResolvedValue(null);

    const createSignedAgreements =
      await signedAgreementsService.createSignedAgreements(
        {
          privacyPolicyVersion: 2,
          termsAndConditionsVersion: 2,
          shareUsageAgreed: true,
        },
        '1'
      );
    expect(createSignedAgreements).toBeUndefined();
    expect(jest.spyOn(signedAgreementsRepository, 'create')).toBeCalledTimes(2);
  });

  test('should test createAgreement function (400 signed agreements not exists)', async () => {
    try {
      await signedAgreementsService.createSignedAgreements(
        {
          privacyPolicyVersion: 0,
          termsAndConditionsVersion: 0,
          shareUsageAgreed: true,
        },
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'signed_agreements_no_signed_agreements'
      );
    }
  });

  test('should test findLastAgreementVersions function', async () => {
    const lastAgreementVersions =
      await signedAgreementsService.findLastAgreementVersions(1);
    expect(lastAgreementVersions.privacyPolicyVersion).toBe(1);
    expect(lastAgreementVersions.termsAndConditionsVersion).toBe(1);
  });

  test('should test findShareAgreement function', async () => {
    const shareAgreement = await signedAgreementsService.findShareAgreement(1);
    expect(shareAgreement?.agreed).toBe(shareUsageObject.agreed);
    expect(shareAgreement?.id).toBe(shareUsageObject.id);
    expect(shareAgreement?.userId).toBe(shareUsageObject.userId);
  });
});

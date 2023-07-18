import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import { referenceDataService } from '@modules/index/index.service';
import referenceDataRepository from '@repositories/reference-data.repository';
import { NotificationSettingsTypes } from '../notification-settings/notification-settings.type';
import { IReferenceDataVersion } from '@modules/reference-data/reference-data-version.type';
import agreementsRepository from '@repositories/agreements.repository';

const genericObject = {
  id: 1,
  text: 'Generic',
};

beforeEach(() => {
  jest.spyOn(agreementsRepository, 'findAll').mockResolvedValue([
    {
      agreementType: 'privacyPolicy',
      id: 1,
      version: 1,
      url: 'http://localhost',
      localeIso: 'en',
    },
    {
      agreementType: 'termsAndConditions',
      id: 2,
      version: 2,
      url: 'http://localhost',
      localeIso: 'en',
    },
    {
      agreementType: 'privacyPolicy',
      id: 1,
      version: 1,
      url: 'http://localhost',
      localeIso: 'zh',
    },
  ]);
  jest
    .spyOn(referenceDataRepository, 'findReferenceDataVersion')
    .mockResolvedValue({
      version: 1,
    } as IReferenceDataVersion);
  jest
    .spyOn(referenceDataRepository, 'findGender')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findLifeStyle')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findExerciseIntensity')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findMedicalCondition')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findMedication')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findUrinationsPerDay')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findBowelMovement')
    .mockResolvedValue([genericObject]);
  jest
    .spyOn(referenceDataRepository, 'findTimeZone')
    .mockResolvedValue([{ ...genericObject, gmt: '+00:00' }]);
  jest.spyOn(referenceDataRepository, 'findMessageTypes').mockResolvedValue([
    {
      ...genericObject,
      NotificationSettingsTypes: NotificationSettingsTypes.deviceIssues,
    },
  ]);
  jest
    .spyOn(referenceDataRepository, 'findRegionalPref')
    .mockResolvedValue([{ ...genericObject, short: 'test' }]);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Reference Data', () => {
  test('should test find function', async () => {
    const referenceData = await referenceDataService.find();
    expect(referenceData).toBeTruthy();
  });

  test('should test find function (404 referenceData Version not found)', async () => {
    jest
      .spyOn(referenceDataRepository, 'findReferenceDataVersion')
      .mockResolvedValue(null);

    try {
      await referenceDataService.find();
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'reference_data_referencedata_version_not_found'
      );
    }
  });
});

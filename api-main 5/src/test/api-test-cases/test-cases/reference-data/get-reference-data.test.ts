import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { NotificationSettingsTypes, RegionalPref } from '.prisma/client';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import agreementsRepository from '@repositories/agreements.repository';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Reference Data Endpoint', () => {
  mockAuthentication();

  test('should be successful with valid parameters', (done) => {
    //Setup
    const referenceDataVersion = {
      id: 1,
      version: 1,
    };

    const placeholder = [
      {
        id: 1,
        text: 'placeholder',
      },
    ];

    prismaMock.referenceDataVersion.findFirst.mockResolvedValue(
      referenceDataVersion
    );
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
    prismaMock.gender.findMany.mockResolvedValue(placeholder);
    prismaMock.lifeStyle.findMany.mockResolvedValue(placeholder);
    prismaMock.exerciseIntensity.findMany.mockResolvedValue(placeholder);
    prismaMock.medicalCondition.findMany.mockResolvedValue(placeholder);
    prismaMock.medication.findMany.mockResolvedValue(placeholder);
    prismaMock.urinationsPerDay.findMany.mockResolvedValue(placeholder);
    prismaMock.messageType.findMany.mockResolvedValue([
      {
        id: 1,
        text: 'placeholder',
        NotificationSettingsTypes: NotificationSettingsTypes.deviceIssues,
      },
    ]);
    prismaMock.bowelMovement.findMany.mockResolvedValue(placeholder);
    prismaMock.regionalPref.findMany.mockResolvedValue(
      placeholder as RegionalPref[]
    );

    //When
    request(testApplication)
      .get(`${Constants.REFERENCE_DATA_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(200, done);
  });
});

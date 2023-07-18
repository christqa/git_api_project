import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import * as userDefaultConfiguration from '@modules/user-configuration/user-configuration.json';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { PdfService } from '@modules/pdf-service/pdf-service';
import moment from 'moment';
import { IProfile } from '@modules/profile/profile.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import { DATE_FORMAT_ISO8601 } from '../../../../constants';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

// Mock the generate PDF Service
const mockGeneratePdFService = jest.spyOn(PdfService, 'generatePDF');

beforeEach(() => {
  mockGeneratePdFService.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolve({
          length: 0,
          document: '',
        });
      })
  );
});

afterEach(() => {
  mockGeneratePdFService.mockReset();
});

describe('API Test Suite: Get PDF Report Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    Constants.PDF_REPORT_ENDPOINT,
    RequestMethod.GET
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.gender.findUnique.mockResolvedValue({
      id: 1,
      text: 'Male',
    });
    prismaMock.profile.findFirst.mockResolvedValue({
      id: 1,
    } as IProfile);
    prismaMock.userConfiguration.upsert.mockResolvedValueOnce({
      id: 1,
      profileId: 1,
      configuration: userDefaultConfiguration,
    });

    const startDate = encodeURIComponent('2000-01-01T12:33:00Z');
    const endDate = encodeURIComponent(
      moment().format(DATE_FORMAT_ISO8601).split('+')[0] + 'Z'
    );
    const personalData = false;
    const annotations = false;
    const conditionsAndMedications = false;

    //When
    request(testApplication)
      .get(
        `${Constants.PDF_REPORT_ENDPOINT}?startDate=${startDate}&endDate=${endDate}&personalData=${personalData}&annotations=${annotations}&conditionsAndMedications=${conditionsAndMedications}`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .expect(200, done);
  });
});

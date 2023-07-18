import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import * as userDefaultConfiguration from '@modules/user-configuration/user-configuration.json';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { IProfile } from '@modules/profile/profile.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get My Configuration Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.USERS_ENDPOINT}/me/scoring-configuration`,
    RequestMethod.GET
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.userConfiguration.findUnique.mockResolvedValue({
      id: 1,
      profileId: 1,
      configuration: userDefaultConfiguration,
    });
    prismaMock.profile.findFirst.mockResolvedValue({
      id: 1,
    } as IProfile);
    prismaMock.userConfiguration.upsert.mockResolvedValue({
      id: 1,
      profileId: 1,
      configuration: userDefaultConfiguration,
    });

    //When
    request(testApplication)
      .get(`${Constants.USERS_ENDPOINT}/me/scoring-configuration`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(200)
      .expect(
        {
          ...userDefaultConfiguration,
          firstSampleDate: null,
        },
        done
      );
  });
});

import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Get Data Store Endpoint', () => {
  mockAuthentication();

  const GET_DATA_STORE_ENDPOINT = Constants.DATA_STORE_ENDPOINT;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    GET_DATA_STORE_ENDPOINT,
    RequestMethod.PUT
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.dataStore.findUnique.mockResolvedValue(
      Constants.SAMPLE_DATA_STORE
    );

    //When
    request(testApplication)
      .get(`${GET_DATA_STORE_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(200, done)
      .expect(Constants.SAMPLE_DATA_STORE.data);
  });
});

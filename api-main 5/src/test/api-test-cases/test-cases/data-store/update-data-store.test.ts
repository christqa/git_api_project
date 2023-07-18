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

describe('API Test Suite: Update Data Store Endpoint', () => {
  mockAuthentication();

  const UPDATE_DATA_STORE_ENDPOINT = Constants.DATA_STORE_ENDPOINT;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    UPDATE_DATA_STORE_ENDPOINT,
    RequestMethod.PUT
  );

  test('should be successful with valid parameters', (done) => {
    //When
    request(testApplication)
      .put(`${UPDATE_DATA_STORE_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        isBathroomUsageCompleted: false,
        isLifestyleCompleted: false,
        isMedicalConditionsCompleted: true,
        isMedicationsCompleted: false,
        batteryLevel: 'high',
        batteryPercentage: 100,
      })

      //Then
      .expect(204, done);
  });
});

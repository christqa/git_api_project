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

describe('API Test Suite: Delete Push Token Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    Constants.NOTIFICATIONS_PUSH_TOKENS_ENDPOINT,
    RequestMethod.DELETE
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    //When
    request(testApplication)
      .delete(`${Constants.NOTIFICATIONS_PUSH_TOKENS_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: 'device-token-to-delete',
      })
      //Then
      .expect(204, done);
  });
});

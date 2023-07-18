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

describe('API Test Suite: Mark Message as Read Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.MESSAGES_ENDPOINT}/${Constants.SAMPLE_MESSAGE_DATA.messageGuid}/read`,
    RequestMethod.PATCH
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    prismaMock.message.findFirst.mockResolvedValue(
      Constants.SAMPLE_MESSAGE_DATA
    );

    //When
    request(testApplication)
      .patch(
        `${Constants.MESSAGES_ENDPOINT}/${Constants.SAMPLE_MESSAGE_DATA.messageGuid}/read`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(204, done);
  });

  test('should fail because message is already read', (done) => {
    //Setup
    prismaMock.message.findFirst.mockResolvedValue({
      ...Constants.SAMPLE_MESSAGE_DATA,
      read: true,
    });

    //When
    request(testApplication)
      .patch(
        `${Constants.MESSAGES_ENDPOINT}/${Constants.SAMPLE_MESSAGE_DATA.messageGuid}/read`
      )
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(409);
          expect(response.body.message).toBe('Message already marked as read');
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

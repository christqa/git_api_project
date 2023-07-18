import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import * as PushNotificationService from '@modules/notifications/push-notification.service';
import { CreatePlatformEndpointCommandOutput } from '@aws-sdk/client-sns';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Create Push Token Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    Constants.NOTIFICATIONS_PUSH_TOKENS_ENDPOINT,
    RequestMethod.POST
  );

  test('should be successful with token creation', (done) => {
    //Setup
    prismaMock.pushToken.create.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    prismaMock.userMobile.upsert.mockResolvedValue({
      id: 1,
      active: false,
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: Constants.TEST_USER.id,
      pushTokenId: Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION.id,
    });

    const registerDeviceMock = jest.spyOn(
      PushNotificationService,
      'registerDevice'
    );

    registerDeviceMock.mockResolvedValue({
      EndpointArn: 'endpoint',
    } as CreatePlatformEndpointCommandOutput);

    //When
    request(testApplication)
      .post(`${Constants.NOTIFICATIONS_PUSH_TOKENS_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: 'new-token',
      })
      //Then
      .expect(201, done);
  });

  test('should be successful as token already exists', (done) => {
    //Setup
    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    prismaMock.userMobile.upsert.mockResolvedValue({
      id: 1,
      active: false,
      updatedAt: new Date(),
      createdAt: new Date(),
      userId: Constants.TEST_USER.id,
      pushTokenId: Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION.id,
    });

    //When
    request(testApplication)
      .post(`${Constants.NOTIFICATIONS_PUSH_TOKENS_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION.deviceToken,
      })
      //Then
      .expect(201, done);
  });
});

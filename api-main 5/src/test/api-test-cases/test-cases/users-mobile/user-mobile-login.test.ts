import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import * as Constants from '../../core/constants';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { prismaMock } from '@core/prisma/singleton';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';
import * as express from 'express';
import ApiError from '@core/error-handling/api-error';

import { UNAUTHORIZED } from 'http-status';
import { INTERNAL_SERVER_ERROR_MESSAGE } from '@core/error-handling/error.middleware';
import * as Authentication from '@core/authentication/auth0-authentication';

import { IUser } from '@modules/user/user.type';

const expressAuthentication = jest.spyOn(
  Authentication,
  'expressAuthentication'
);

const userObject = generateUser({ id: 2 });

beforeAll(() => {
  expressAuthentication.mockImplementation(
    (request: express.Request): Promise<IUser> => {
      return new Promise((resolve, reject) => {
        if (
          request.header(Constants.AUTHORIZATION_REQUEST_KEY) ==
          Constants.VALID_TOKEN
        ) {
          resolve(Constants.TEST_USER);
        } else {
          reject(new ApiError(UNAUTHORIZED, INTERNAL_SERVER_ERROR_MESSAGE));
        }
      });
    }
  );
});

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('Api test suit for user-mobile log-in', () => {
  const IOSDeviceToken =
    '740f4707 bebcf74f 9b7c25d4 8e335894 5f6aa01d a5ddb387 462c7eaf 61bb78ad';
  const invalidIOSDeviceToken1 =
    '740f4707 bebcfasdasdddqqqq1sbdbuiu888923794286sadasdasd 74f 9b7c25d4 8easdasdasdadasdasdasdasdvjh jh asdasdasdasfsrg000092332rsdfsfcsjhvdyqwvwd335894 5f6aa01d a5ddb3dsfsdfsfsdfsdfdsf87 462c7eaf 61bb78aasdas33jbhjb3hbv21213h21dbjh34vrv3223bvk42u3hv4khj2bryu34ri3b4irbdasdaferrkjbiuy2virv2iyviyvshevfuysvf1dfgdfddddddd';
  const invalidIOSDeviceToke2 = 'string';

  verifyEndpointFailsWithoutAuthenticationTestCase(
    '/users-mobile/login',
    RequestMethod.POST
  );

  test('test case valid params', (done) => {
    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 201,
            message: 'success',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case where device token is not found', (done) => {
    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 404,
            message: 'Device token not found',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid device token - 1', (done) => {
    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: invalidIOSDeviceToken1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message:
              '"deviceToken" length must be less than or equal to 256 characters long',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid device token - 2', (done) => {
    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: invalidIOSDeviceToke2,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message:
              '"deviceToken" with value "string" fails to match the required pattern: /[0-9a-f]+/',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid device token type', (done) => {
    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"deviceToken" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case where token is not provided', (done) => {
    request(testApplication)
      .post('/users-mobile/login')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({})
      .end((error, resposne) => {
        if (error) {
          return done(error);
        }
        try {
          expect(resposne.body).toEqual({
            status: 400,
            message: '"deviceToken" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

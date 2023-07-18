import request from 'supertest';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { prismaMock } from '@core/prisma/singleton';
import * as Constants from '../../core/constants';
import { testApplication } from '@test/api-test-cases/test-application';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

describe('Test suit for users-mobile log out endpoint', () => {
  mockAuthentication();
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findOne').mockResolvedValue(userObject);

  const userGuid = '992c137d-27eb-454b-93ce-8671bd80f682';
  const invalidUserGuid = '992c137d 27eb 454b 93ce 8671bd80f682';
  const IOSDeviceToken =
    '740f4707 bebcf74f 9b7c25d4 8e335894 5f6aa01d a5ddb387 462c7eaf 61bb78ad';
  const invalidIOSDeviceToken1 =
    '740f4707 bebcfasdasdddqqqq1sbdbuiu888923794286sadasdasd 74f 9b7c25d4 8easdasdasdadasdasdasdasdvjh jh asdasdasdasfsrg000092332rsdfsfcsjhvdyqwvwd335894 5f6aa01d a5ddb3dsfsdfsfsdfsdfdsf87 462c7eaf 61bb78aasdas33jbhjb3hbv21213h21dbjh34vrv3223bvk42u3hv4khj2bryu34ri3b4irbdasdaferrkjbiuy2virv2iyviyvshevfuysvf1dfgdfddddddd';
  const invalidIOSDeviceToke2 = 'string';

  test('test case with valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.pushToken.findFirst.mockResolvedValue(
      Constants.SAMPLE_PUSH_TOKEN_NOTIFICATION
    );

    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
        userGuid,
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

  test('test case where token is not found', (done) => {
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
    jest.spyOn(userService, 'findOne').mockResolvedValue(userObject);

    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.pushToken.findFirst.mockResolvedValue(null);

    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
        userGuid,
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

  test('test case where user is not found', (done) => {
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(null);
    prismaMock.account.findFirst.mockResolvedValue(null);

    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
        userGuid,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 404,
            message: 'User not found',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid user guid', (done) => {
    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: IOSDeviceToken,
        userGuid: invalidUserGuid,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"userGuid" must be a valid GUID',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid token - 1', (done) => {
    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: invalidIOSDeviceToken1,
        userGuid,
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

  test('test case with invalid token - 2', (done) => {
    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: invalidIOSDeviceToke2,
        userGuid,
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

  test('test case with invalid token type', (done) => {
    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        deviceToken: 1,
        userGuid,
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

  test('test case where token/user guid is not provided', (done) => {
    request(testApplication)
      .post('/users-mobile/logout')
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({})
      .end((error, resposne) => {
        if (error) {
          return done(error);
        }
        try {
          expect(resposne.body).toEqual({
            status: 400,
            message: '"deviceToken" is required, "userGuid" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

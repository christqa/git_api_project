import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';

describe('Test suit: testing groups put endpoint', () => {
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups`,
    RequestMethod.PUT
  );

  test('testing with valid body and params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.groups.update.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);

    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        groupName: 'home2',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({ status: 'success' });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing without having a group', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        groupName: 'home2',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 404,
            message: 'Group not found',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing without having a group user', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);

    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        groupName: 'home2',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 404,
            message: 'Group user not found',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without sending groupId', (done) => {
    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupName: 'home2',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupId" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without sending groupName', (done) => {
    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupName" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid groupId', (done) => {
    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: '',
        groupName: 'home2',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupId" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid groupName', (done) => {
    request(testApplication)
      .put(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        groupName: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"groupName" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

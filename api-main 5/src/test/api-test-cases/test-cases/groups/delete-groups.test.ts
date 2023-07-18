import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';

describe('Test suit: testing groups delete endpoint', () => {
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups`,
    RequestMethod.DELETE
  );
  test('test case with valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.groupUsers.count.mockResolvedValue(1);
    request(testApplication)
      .delete(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
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

  test('test case with more than one group user', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.groupUsers.count.mockResolvedValue(2);
    request(testApplication)
      .delete(`/groups`)
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
            status: 409,
            message: 'Group cannot be deleted, first remove all group users',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without sending groupId', (done) => {
    request(testApplication)
      .delete(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({})
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

  test('test case with invalid groupId', (done) => {
    request(testApplication)
      .delete(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: '',
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
});

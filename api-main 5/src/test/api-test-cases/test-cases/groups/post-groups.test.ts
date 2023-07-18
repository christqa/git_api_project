import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';

describe('Test suit: testing groups post endpoint', () => {
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups`,
    RequestMethod.POST
  );
  test('createing  groups using valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groupUsers.create.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.$transaction.mockResolvedValue({
      groupId: Constants.SAMPLE_GROUP_DATA.id,
      groupName: Constants.SAMPLE_GROUP_DATA.groupName,
      role: Constants.SAMPLE_GROUP_USER_DATA.role,
      createdOn: Constants.SAMPLE_GROUP_DATA.createdOn,
      addedOn: Constants.SAMPLE_GROUP_USER_DATA.addedOn,
    });

    request(testApplication)
      .post(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupName: 'Home',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(201);
          expect(response.body).toEqual({
            groupId: 1,
            groupName: 'Home',
            role: 'admin',
            createdOn: Constants.SAMPLE_GROUP_DATA.createdOn.toISOString(),
            addedOn: Constants.SAMPLE_GROUP_USER_DATA.addedOn.toISOString(),
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing with non unique group name', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findFirst.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    request(testApplication)
      .post(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupName: 'Home',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: 'This group name already exists',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing with invalid group name', (done) => {
    prismaMock.groups.findFirst.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    request(testApplication)
      .post(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
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

  test('testing without sending group name', (done) => {
    prismaMock.groups.findFirst.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    request(testApplication)
      .post(`/groups`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({})
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
});

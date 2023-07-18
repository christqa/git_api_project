import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';
import { IGroup, IGroupUser } from '@modules/groups/groups.type';

describe('Test suit: testing groups get endpoint', () => {
  const skip = 0;
  const take = 10;
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups?skip=${skip}&take=${take}`,
    RequestMethod.GET
  );
  test('getting all groups using valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groupUsers.count.mockResolvedValue(1);
    prismaMock.groupUsers.findMany.mockResolvedValue([
      {
        ...Constants.SAMPLE_GROUP_USER_DATA,
        group: { ...Constants.SAMPLE_GROUP_DATA } as IGroup,
      } as IGroupUser,
    ]);
    request(testApplication)
      .get(`/groups?skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            total: 1,
            groups: [
              {
                groupId: 1,
                groupName: 'Home',
                role: 'admin',
                createdOn:
                  Constants.SAMPLE_GROUP_DATA.createdOn
                    .toISOString()
                    .split('.')[0] + 'Z',
                addedOn:
                  Constants.SAMPLE_GROUP_USER_DATA.addedOn
                    .toISOString()
                    .split('.')[0] + 'Z',
              },
            ],
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing with invalid skip', (done) => {
    request(testApplication)
      .get(`/groups?skip=${'skip'}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"skip" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing with invalid take', (done) => {
    request(testApplication)
      .get(`/groups?skip=${skip}&take=${'take'}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"take" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing without skip', (done) => {
    request(testApplication)
      .get(`/groups?take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"skip" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('testing without take', (done) => {
    request(testApplication)
      .get(`/groups?skip=${skip}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"take" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

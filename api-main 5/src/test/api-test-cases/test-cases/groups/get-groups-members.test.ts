import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';
import { IUser } from '@modules/user/user.type';

describe('Test suit: testing groups getting members endpoint', () => {
  const SAMPLE_GROUP_USER_DATA = {
    ...Constants.SAMPLE_GROUP_USER_DATA,
    user: {
      ...Constants.TEST_USER,
      userGuid: '99c02d9f-0fa4-4dbd-91ea-f99d9e2bacb3',
    } as IUser,
  };
  const result = {
    role: 'admin',
    email: 'test-user@projectspectra.dev',
    pending: 0,
    addedOn: new Date(),
    userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
    firstName: 'Austin',
    lastName: 'Gispanski',
  };

  const groupId = 1;
  const skip = 0;
  const take = 10;

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups/members?groupId=${groupId}`,
    RequestMethod.GET
  );

  test('test case with valid params', (done) => {
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(
      Constants.SAMPLE_GROUP_USER_DATA
    );
    prismaMock.groupUsers.findMany.mockResolvedValue([SAMPLE_GROUP_USER_DATA]);
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ count: 1 }]);
    prismaMock.$queryRawUnsafe.mockResolvedValue([result]);

    request(testApplication)
      .get(`/groups/members?groupId=${groupId}&skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.status).toEqual(200);
          expect(response.body).toEqual({
            groupName: 'Home',
            groupMembers: [
              {
                userGuid: '397322cd-6405-464f-8fc6-4dc28971ef2f',
                memberName: 'Austin',
                memberLastName: 'Gispanski',
                memberAccess: 'admin',
                memberEmail: 'test-user@projectspectra.dev',
                addedOn: result.addedOn.toISOString().split('.')[0] + 'Z',
              },
            ],
            pendingGroupMembers: [],
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid groupId', (done) => {
    request(testApplication)
      .get(`/groups/members?groupId=${'groupId'}&skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
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

  test('test case without groupId', (done) => {
    request(testApplication)
      .get(`/groups/members?skip=${skip}&take=${take}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
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
});

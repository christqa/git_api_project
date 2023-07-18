import request from 'supertest';
import { testApplication } from '@test/api-test-cases/test-application';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '@test/api-test-cases/core/common';
import { RequestMethod } from '@test/api-test-cases/core/enums';
import * as Constants from '../../core/constants';
import { prismaMock } from '@core/prisma/singleton';
import { IUser } from '@modules/user/user.type';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import * as sqsClient from '../../../../lib/sqs.client';

describe('Test suit: testing groups members updating endpoint', () => {
  const SAMPLE_GROUP_USER_DATA = {
    ...Constants.SAMPLE_GROUP_USER_DATA,
    user: {
      ...Constants.TEST_USER,
      userGuid: '99c02d9f-0fa4-4dbd-91ea-f99d9e2bacb3',
    } as IUser,
  };

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `/groups/access`,
    RequestMethod.POST
  );

  test('test case with valid params', (done) => {
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(SAMPLE_GROUP_USER_DATA);
    prismaMock.account.findFirst.mockResolvedValue({
      ...Constants.TEST_USER,
      userGuid: Constants.TEST_USER.userGuid,
    });
    prismaMock.groupUsers.count.mockResolvedValue(2);
    prismaMock.profile.findFirst.mockResolvedValue(Constants.TEST_Profile);
    const apiSQSResp = {
      $metadata: 1,
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);

    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        userGuid: Constants.TEST_USER.userGuid,
        accessLevel: 'member',
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

  test('test case where number of groupsUser count = 1', (done) => {
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);
    prismaMock.groupUsers.findFirst.mockResolvedValue(SAMPLE_GROUP_USER_DATA);
    prismaMock.account.findFirst.mockResolvedValue({
      ...Constants.TEST_USER,
      userGuid: Constants.TEST_USER.userGuid,
    });
    prismaMock.groupUsers.count.mockResolvedValue(1);
    prismaMock.profile.findFirst.mockResolvedValue(Constants.TEST_Profile);
    const apiSQSResp = {
      $metadata: 1,
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);

    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        userGuid: Constants.TEST_USER.userGuid,
        accessLevel: 'member',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 409,
            message:
              'You are the only Admin. Assign another Admin before changing your group role.',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case with invalid groupId', (done) => {
    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: '',
        userGuid: Constants.TEST_USER.userGuid,
        accessLevel: 'member',
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

  test('test case with invalid accessLevel', (done) => {
    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        userGuid: Constants.TEST_USER.userGuid,
        accessLevel: 1,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message:
              '"accessLevel" must be one of [admin, member], "accessLevel" must be a string',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without groupId', (done) => {
    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        userGuid: Constants.TEST_USER.userGuid,
        accessLevel: 'admin',
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

  test('test case without accessLevel', (done) => {
    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        userGuid: Constants.TEST_USER.userGuid,
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"accessLevel" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('test case without userGuid', (done) => {
    request(testApplication)
      .post(`/groups/access`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        groupId: 1,
        accessLevel: 'admin',
      })
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"userGuid" is required',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

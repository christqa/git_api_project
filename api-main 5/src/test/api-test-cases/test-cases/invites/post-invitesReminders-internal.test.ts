import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { IInvitations } from '@modules/invite/invite.type';
import { InvitationType } from '@prisma/client';
import * as sqsClient from '../../../../lib/sqs.client';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Reject Invite Endpoint', () => {
  const skip = 0;
  const take = 10;
  const periodDays = 2;
  const inviteId = '0b4ace5c-651c-4955-a46d-f185f6ddd59d';

  test('should be successful with valid parameters', (done) => {
    //When
    request(testApplication)
      .post(
        `/internal/invites/reminders/${periodDays}?skip=${skip}&take=${take}`
      )
      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 200,
            message: [],
            invitesLength: 0,
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should fail if skip is string', (done) => {
    request(testApplication)
      .post(
        `/internal/invites/reminders/${periodDays}?skip=${'skip'}&take=${take}`
      )
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

  test('should fail if take is string', (done) => {
    request(testApplication)
      .post(
        `/internal/invites/reminders/${periodDays}?skip=${skip}&take=${'take'}`
      )
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

  test('should fail if period days is string', (done) => {
    request(testApplication)
      .post(
        `/internal/invites/reminders/${'periodDays'}?skip=${skip}&take=${take}`
      )
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 400,
            message: '"periodDays" must be a number',
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });

  test('should be successful with valid parameters', (done) => {
    //Setup

    const sampleInvite = {
      id: 1,
      invitationId: inviteId,
      fromUserId: 2,
      toUserId: 1,
      toUserEmail: 'tester@projectspectra.dev',
      permissions: ['read'],
      sentAt: new Date('2022-06-09'),
      expiresAt: new Date('2100-01-01'),
      acceptedAt: null,
      rejectedAt: null,
      inviteType: InvitationType.joingroup,
    } as IInvitations;

    const apiSQSResp = {
      $metadata: 1,
      MessageId: '1',
    };

    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);

    prismaMock.invitations.findMany.mockResolvedValue([sampleInvite]);
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.profile.findFirst.mockResolvedValue(Constants.TEST_Profile);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);

    //When
    request(testApplication)
      .post(
        `/internal/invites/reminders/${periodDays}?skip=${skip}&take=${take}`
      )

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({
            status: 200,
            errorMsgs: [
              'One of toGroupId or fromUserId is not found for invite 0b4ace5c-651c-4955-a46d-f185f6ddd59d',
            ],
            invitesLength: 1,
          });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

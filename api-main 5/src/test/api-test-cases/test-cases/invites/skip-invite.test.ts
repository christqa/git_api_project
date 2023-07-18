import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { IInvitations } from '@modules/invite/invite.type';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
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

describe('API Test Suite: Skip Invite Endpoint', () => {
  mockAuthentication();

  const inviteId = '0b4ace5c-651c-4955-a46d-f185f6ddd59d';

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.INVITES_ENDPOINT}/${inviteId}/skip`,
    RequestMethod.PATCH
  );

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

    prismaMock.invitations.findFirst.mockResolvedValueOnce(sampleInvite);
    prismaMock.invitations.findFirst.mockResolvedValueOnce(null);
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    prismaMock.profile.findFirst.mockResolvedValue(Constants.TEST_Profile);
    prismaMock.groups.findUnique.mockResolvedValue(Constants.SAMPLE_GROUP_DATA);

    //When
    request(testApplication)
      .patch(`${Constants.INVITES_ENDPOINT}/${inviteId}/skip`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body).toEqual({ status: 200, message: 'success' });
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

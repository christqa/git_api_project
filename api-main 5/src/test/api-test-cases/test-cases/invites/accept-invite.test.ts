import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { IInvitations } from '@modules/invite/invite.type';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
});

describe('API Test Suite: Accept Invite Endpoint', () => {
  mockAuthentication();

  const email = encodeURIComponent(Constants.TEST_USER.email);
  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.INVITES_ENDPOINT}/${email}/accept`,
    RequestMethod.PATCH
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    const inviteId = '0b4ace5c-651c-4955-a46d-f185f6ddd59d';

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
    } as IInvitations;

    prismaMock.invitations.findFirst.mockResolvedValueOnce(sampleInvite);
    prismaMock.invitations.findFirst.mockResolvedValueOnce(null);
    prismaMock.invitations.update.mockResolvedValue(sampleInvite);

    //When
    request(testApplication)
      .patch(`${Constants.INVITES_ENDPOINT}/${inviteId}/reject`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .expect(200, done);
  });

  test('should fail because expired invitations cannot be expired', (done) => {
    //Setup
    const inviteId = '0b4ace5c-651c-4955-a46d-f185f6ddd59d';

    const sampleInvite = {
      id: 1,
      invitationId: inviteId,
      fromUserId: 2,
      toUserId: 1,
      toUserEmail: 'tester@projectspectra.dev',
      permissions: ['read'],
      sentAt: new Date('2022-06-09'),
      expiresAt: new Date('2022-01-01'),
      acceptedAt: null,
      rejectedAt: null,
    } as IInvitations;

    prismaMock.invitations.findFirst.mockResolvedValueOnce(sampleInvite);
    prismaMock.invitations.findFirst.mockResolvedValueOnce(null);
    prismaMock.invitations.update.mockResolvedValue(sampleInvite);

    //When
    request(testApplication)
      .patch(`${Constants.INVITES_ENDPOINT}/${inviteId}/reject`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(400);
          expect(response.body.message).toBe(
            'Invitation has expired. Please request a new invitation from the group admin.'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

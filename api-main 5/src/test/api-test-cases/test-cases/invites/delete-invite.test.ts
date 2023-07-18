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

describe('API Test Suite: Delete Invite Endpoint', () => {
  mockAuthentication();

  const inviteId = '0b4ace5c-651c-4955-a46d-f185f6ddd59d';
  const memberEmail = 'tester@projectspectra.dev';

  verifyEndpointFailsWithoutAuthenticationTestCase(
    `${Constants.INVITES_ENDPOINT}`,
    RequestMethod.DELETE
  );

  test('should be successful with valid parameters', (done) => {
    //Setup

    const sampleInvite = {
      id: 1,
      invitationId: inviteId,
      fromUserId: 2,
      toUserId: 1,
      toUserEmail: memberEmail,
      permissions: ['read'],
      sentAt: new Date('2022-06-09'),
      expiresAt: new Date('2100-01-01'),
      acceptedAt: null,
      rejectedAt: null,
    } as IInvitations;

    prismaMock.invitations.findFirst.mockResolvedValue(sampleInvite);

    //When
    request(testApplication)
      .delete(`${Constants.INVITES_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({ invitationType: 'datasharing', memberEmail })

      //Then
      .expect(200, done);
  });

  test('should fail with invalid member email', (done) => {
    //Setup
    const invalidMemberEmail = 'tester';
    //When
    request(testApplication)
      .delete(`${Constants.INVITES_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({ invitationType: 'datasharing', memberEmail: invalidMemberEmail })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(400);
          expect(response.body.message).toBe(
            '"memberEmail" must be a valid email'
          );
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

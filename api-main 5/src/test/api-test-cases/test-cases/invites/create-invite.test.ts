import { prismaMock } from '@core/prisma/singleton';
import request from 'supertest';
import { testApplication } from '../../test-application';
import * as Constants from '../../core/constants';
import { RequestMethod } from '../../core/enums';
import { verifyEndpointFailsWithoutAuthenticationTestCase } from '../../core/common';
import { IUser } from '@modules/user/user.type';
import { mockAuthentication } from '@test/api-test-cases/core/authentication';
import { Groups, InvitationType } from '@prisma/client';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import {
  groupsService,
  inviteService,
  userService,
} from '@modules/index/index.service';
import inviteRepository from '@repositories/invite.repository';
import { IInvitations } from '@modules/invite/invite.type';
import groupUsersRepository from '@repositories/group-users.repository';
import profileRepository from '@repositories/profile.repository';
import { IProfile } from '@modules/profile/profile.type';

const userObject = generateUser({ id: 50 });

describe('API Test Suite: Create Invite Endpoint', () => {
  mockAuthentication();

  verifyEndpointFailsWithoutAuthenticationTestCase(
    Constants.INVITES_ENDPOINT,
    RequestMethod.POST
  );

  test('should be successful with valid parameters', (done) => {
    //Setup
    const invitedUser = {
      id: 20,
      userGuid: Constants.TEST_USER.userGuid,
      email: 'invited-user@projectspectra.dev',
      authId: '',
      firstName: 'Bruce',
      lastName: 'Wayne',
      localCutoff: '',
    } as IUser;

    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
    jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);
    jest
      .spyOn(inviteService, 'getUserByIdOrEmail')
      .mockResolvedValue(invitedUser);
    prismaMock.account.findFirst.mockResolvedValue(userObject);

    //When
    request(testApplication)
      .post(`${Constants.INVITES_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        email: invitedUser.email,
        permissions: ['read'],
        invitationType: InvitationType.datasharing,
      })

      //Then
      .expect(201, done);
  });

  test('should be successful with valid parameters (re-send invite)', (done) => {
    //Setup
    const invitedUser = {
      id: 20,
      userGuid: Constants.TEST_USER.userGuid,
      email: 'invited-user@projectspectra.dev',
      authId: '',
      firstName: 'Bruce',
      lastName: 'Wayne',
      localCutoff: '',
    } as IUser;

    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
    jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);
    jest
      .spyOn(inviteService, 'getUserByIdOrEmail')
      .mockResolvedValue(invitedUser);
    jest.spyOn(inviteRepository, 'findMany').mockResolvedValue([
      {
        toGroupId: 123,
        invitationId: '123',
      } as unknown as IInvitations,
    ]);
    jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
      {
        id: 123,
      } as Groups,
    ]);
    jest.spyOn(inviteService, 'resendGroupInvites').mockResolvedValue(['1']);
    jest.spyOn(groupUsersRepository, 'findMany').mockResolvedValue([]);
    prismaMock.account.findFirst.mockResolvedValue(userObject);

    //When
    request(testApplication)
      .post(`${Constants.INVITES_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        email: invitedUser.email,
        resendInvite: true,
        invitationType: InvitationType.joingroup,
      })

      //Then
      .expect(201, done);
  });

  test('should fail when user invites himself', (done) => {
    //Setup
    prismaMock.account.findFirst.mockResolvedValue(Constants.TEST_USER);
    jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
    jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);
    jest
      .spyOn(inviteService, 'getUserByIdOrEmail')
      .mockResolvedValue(userObject);

    //When
    request(testApplication)
      .post(`${Constants.INVITES_ENDPOINT}`)
      .set(Constants.AUTHORIZATION_REQUEST_KEY, Constants.VALID_TOKEN)
      .send({
        email: Constants.TEST_USER.email,
        permissions: ['read'],
        invitationType: InvitationType.datasharing,
      })

      //Then
      .end((error, response) => {
        if (error) {
          return done(error);
        }
        try {
          expect(response.body.status).toBe(400);
          expect(response.body.message).toBe('You cannot invite yourself');
        } catch (e) {
          return done(e);
        }
        return done();
      });
  });
});

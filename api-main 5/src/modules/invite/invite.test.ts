import httpStatus from 'http-status';
import moment from 'moment';
import inviteRepository from '@repositories/invite.repository';
import userRepository from '@repositories/user.repository';
import * as sqsClient from '../../lib/sqs.client';
import dataSharingAgreementRepository from '@repositories/data-sharing-agreement.repository';
import ApiError from '@core/error-handling/api-error';
import {
  groupsService,
  inviteService,
  userService,
} from '@modules/index/index.service';
import { IDataSharingAgreement } from '../data-sharing-agreement/data-sharing-agreement.type';
import {
  generateUser,
  generateProfile,
  generateInvitationsToJoinGroup,
} from '@test/utils/generate';
import { IInvitations, PermissionTypes } from './invite.type';
import {
  Groups,
  GroupUserRoles,
  GroupUsers,
  Invitations,
  InvitationType,
  PrismaClient,
} from '@prisma/client';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import profileRepository from '@repositories/profile.repository';
import { IUser } from '@modules/user/user.type';
import { IProfile } from '@modules/profile/profile.type';
import groupsRepository from '@repositories/groups.repository';
import { IGroup, IGroupUser } from '@modules/groups/groups.type';
import groupUsersRepository from '@repositories/group-users.repository';
import express from 'express';
import config from '@core/enviroment-variable-config';

const userInvitationsToJoinGroup = generateInvitationsToJoinGroup();
const userObject = generateUser({ id: 2 });
const userProfile = generateProfile();
const groupObject = {
  id: 1,
  groupName: 'Home',
  createdOn: new Date(),
  deletedBy: null,
  deleted: null,
} as IGroup;

const groupUserObject = {
  id: 1,
  userId: 1,
  groupId: 1,
  addedOn: new Date(),
  role: GroupUserRoles.admin,
  deleted: null,
} as IGroupUser;

const inviteObject = {
  id: 1,
  invitationId: 'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
  fromUserId: 1,
  toUserId: 2,
  toUserEmail: null,
  permissions: [PermissionTypes.read],
  sentAt: new Date(),
  expiresAt: moment(new Date()).add(24, 'hours').toDate(),
  acceptedAt: null,
  rejectedAt: null,
  inviteType: InvitationType.datasharing,
} as IInvitations;
const inviteObjectJoinGroup = {
  id: 1,
  invitationId: 'a0b835f4-7fe9-1eb0-b866-f7123a4e9d1a',
  fromUserId: 1,
  toUserId: 2,
  toUserEmail: 'test@test.com',
  permissions: [PermissionTypes.read],
  sentAt: new Date(),
  expiresAt: moment(new Date()).add(24, 'hours').toDate(),
  acceptedAt: null,
  rejectedAt: null,
  inviteType: InvitationType.joingroup,
} as IInvitations;
const dataSharingAgreementObject = {
  id: 1,
  agreementId: '30afe0ce-f76c-461a-8e28-2408b4b2dc1c',
  invitationId: 1,
  fromUserId: 1,
  toUserId: 2,
  permissions: [PermissionTypes.read],
  agreedAt: new Date(),
  revokedAt: null,
} as IDataSharingAgreement;
const profileObject = {
  dob: '04/05/2003',
  regionalPref: 'en-US',
  weightLbs: 5,
  heightIn: 1,
  userId: 1,
  genderId: 1,
  lifeStyleId: 1,
  exerciseIntensityId: 1,
  urinationsPerDayId: 1,
  bowelMovementId: 1,
} as IProfile;

beforeEach(() => {
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(PrismaClient.prototype, '$transaction').mockResolvedValue(null);
  jest
    .spyOn(userRepository, 'findFirst')
    .mockResolvedValue(generateUser({ id: 6 }));
  jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(userProfile);
  jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue(inviteObject);
  jest.spyOn(inviteRepository, 'create').mockResolvedValue(inviteObject);
  jest.spyOn(inviteRepository, 'update').mockResolvedValue(inviteObject);
  jest.spyOn(inviteRepository, 'updateMany').mockResolvedValue();
  jest.spyOn(inviteRepository, 'remove').mockResolvedValue(inviteObject);
  jest
    .spyOn(dataSharingAgreementRepository, 'create')
    .mockResolvedValue(dataSharingAgreementObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Invite', () => {
  test('should test createInvite function', async () => {
    const invite = await inviteService.createInvite(
      { email: 'test@test.com', permissions: [PermissionTypes.read] },
      {
        user: {
          userGuid: '1',
          firstName: 'First',
          lastName: 'Last',
        },
        headers: {
          host: 'localhost',
        },
        protocol: 'https',
      } as unknown as express.Request
    );
    expect(invite).toHaveLength(0);
  });

  test('should test createInvite function for joingroup and admin exceeds invite count', async () => {
    jest.spyOn(inviteService, 'getUserByIdOrEmail').mockResolvedValue(null);
    jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
      {
        id: 1,
        groupName: 'Home',
      },
    ] as Groups[]);
    jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue({
      role: GroupUserRoles.admin,
    } as GroupUsers);

    jest
      .spyOn(inviteRepository, 'getNumberOfinvitesSentByUser')
      .mockResolvedValue(config.maxInvitesUnacceptedPerAdmin + 1);
    try {
      await inviteService.createInvite(
        {
          email: 'test@test.com',
          toGroupIds: [1],
          permissions: [PermissionTypes.read],
          invitationType: InvitationType.joingroup,
        },
        {
          user: {
            userGuid: '1',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe('invite_count_for_admin_exceeded');
    }
  });

  test('should test createInvite function for joingroup and user does not exist', async () => {
    jest.spyOn(inviteService, 'getUserByIdOrEmail').mockResolvedValue(null);
    jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
      {
        id: 1,
        groupName: 'Home',
      },
    ] as Groups[]);
    jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue({
      role: GroupUserRoles.admin,
    } as GroupUsers);

    try {
      await inviteService.createInvite(
        {
          email: 'test@test.com',
          toGroupIds: [1],
          permissions: [PermissionTypes.read],
          invitationType: InvitationType.joingroup,
        },
        {
          user: {
            userGuid: '1',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe('invite_no_such_user');
    }
  });

  test('should test createInvite function for joingroup and user role is not admin', async () => {
    jest.spyOn(inviteService, 'getUserByIdOrEmail').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
    } as IUser);
    jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
      {
        id: 111,
      },
    ] as Groups[]);
    const userProfile2 = Object.assign({}, userProfile);
    userProfile2.id = 35;
    jest
      .spyOn(inviteService, 'getProfileByUserOrUserId')
      .mockResolvedValue(userProfile);
    jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue({
      role: GroupUserRoles.member,
    } as GroupUsers);
    try {
      await inviteService.createInvite(
        {
          email: 'test@test.com',
          toGroupIds: [111],
          permissions: [PermissionTypes.read],
          invitationType: InvitationType.joingroup,
        },
        {
          user: {
            userGuid: '10',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe(
        'groups_group_user_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test createInvite function for joingroup and user role is admin and destination user has no profile', async () => {
    jest.spyOn(inviteService, 'getUserByIdOrEmail').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
    } as IUser);
    // jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
    //   {
    //     id: 111,
    //   },
    // ] as Groups[]);

    try {
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.message).toBe(
        'Invitation unsuccessful. Retry again after user completes registration'
      );
    }
  });

  test('should test createInvite function for joingroup and user is already a member', async () => {
    jest.spyOn(inviteService, 'getUserByIdOrEmail').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
    } as IUser);
    jest.spyOn(groupsService, 'getGroups').mockResolvedValue([
      {
        id: 1,
        groupName: 'Home',
      },
    ] as Groups[]);
    const userProfile2 = Object.assign({}, userProfile);
    userProfile2.id = 35;
    jest
      .spyOn(inviteService, 'getProfileByUserOrUserId')
      .mockResolvedValue(userProfile);
    jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue({
      role: GroupUserRoles.admin,
    } as GroupUsers);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    try {
      await inviteService.createInvite(
        {
          email: 'test@test.com',
          toGroupIds: [1],
          permissions: [PermissionTypes.read],
          invitationType: InvitationType.joingroup,
        },
        {
          user: {
            userGuid: '10',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe('invite_user_already_in_group');
    }
  });

  test('should test getRemindersForJoiningGroup function', async () => {
    jest
      .spyOn(inviteRepository, 'findMany')
      .mockResolvedValue(userInvitationsToJoinGroup);
    await inviteService.getRemindersForJoiningGroup(14);
    expect(inviteRepository.findMany).toBeCalled;
  });

  test('should test createInvite function (unknown user)', async () => {
    let createInviteData;
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(inviteRepository, 'create').mockImplementationOnce((data) => {
      createInviteData = data;
      return Promise.resolve(inviteObject);
    });
    const invite = await inviteService.createInvite(
      { email: 'test@test.com', permissions: [PermissionTypes.read] },
      {
        user: {
          userGuid: '1',
          firstName: 'First',
          lastName: 'Last',
        },
        headers: {
          host: 'localhost',
        },
        protocol: 'https',
      } as unknown as express.Request
    );
    expect(invite).toHaveLength(0);
    expect((createInviteData as unknown as IInvitations).toUserEmail).toBe(
      'test@test.com'
    );
  });

  test('should test createInvite function for invitation joingroup and role admin', async () => {
    const userData = generateUser({
      email: inviteObjectJoinGroup.toUserEmail!,
    });
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
    jest.spyOn(groupsRepository, 'findMany').mockResolvedValue([groupObject]);
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue(groupUserObject);
    jest.spyOn(inviteRepository, 'create').mockImplementationOnce(() => {
      return Promise.resolve(inviteObjectJoinGroup);
    });
    jest
      .spyOn(PrismaClient.prototype, '$transaction')
      .mockImplementation(() => {
        return Promise.resolve(inviteObjectJoinGroup);
      });

    const invite = await inviteService.createInvite(
      {
        email: 'test@test.com',
        permissions: [PermissionTypes.read],
        invitationType: InvitationType.joingroup,
      },
      {
        user: {
          userGuid: '10',
          firstName: 'First',
          lastName: 'Last',
        },
        headers: {
          host: 'localhost',
        },
        protocol: 'https',
      } as unknown as express.Request
    );
    expect(invite).toHaveLength(0);
  });

  test('should test resendInvite function (unknown user)', async () => {
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(inviteRepository, 'findMany').mockResolvedValue(null);

    try {
      await inviteService.resendInvite({ email: 'test@test.com' }, {
        user: {
          userGuid: '1',
          firstName: 'First',
          lastName: 'Last',
        },
        headers: {
          host: 'localhost',
        },
        protocol: 'https',
      } as unknown as express.Request);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe('invite_invite_not_found');
    }
  });

  test('should test resendInvite function for invitation joingroup and role admin', async () => {
    const userData = generateUser({
      email: inviteObjectJoinGroup.toUserEmail!,
    });
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
    jest.spyOn(groupsRepository, 'findMany').mockResolvedValue([groupObject]);
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue(groupUserObject);
    jest
      .spyOn(inviteRepository, 'findMany')
      .mockResolvedValue([inviteObjectJoinGroup]);
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue({} as SendMessageCommandOutput);

    const invite = await inviteService.resendInvite(
      {
        email: 'test@test.com',
        invitationType: InvitationType.joingroup,
      },
      {
        user: {
          userGuid: '1',
          firstName: 'First',
          lastName: 'Last',
        },
        headers: {
          host: 'localhost',
        },
        protocol: 'https',
      } as unknown as express.Request
    );
    expect(invite[0]).toBe('a0b835f4-7fe9-1eb0-b866-f7123a4e9d1a');
  });

  test('should test resendInvite function for invitation joingroup and role admin and invite count exceeded', async () => {
    const userData = generateUser({
      email: inviteObjectJoinGroup.toUserEmail!,
    });
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
    jest.spyOn(groupsRepository, 'findMany').mockResolvedValue([groupObject]);
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue(groupUserObject);
    jest
      .spyOn(inviteRepository, 'findMany')
      .mockResolvedValue([inviteObjectJoinGroup]);
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue({} as SendMessageCommandOutput);

    jest
      .spyOn(inviteRepository, 'getNumberOfinvitesSentByUser')
      .mockResolvedValue(config.maxInvitesUnacceptedPerAdmin + 1);
    try {
      const invite = await inviteService.resendInvite(
        {
          email: 'test@test.com',
          invitationType: InvitationType.joingroup,
        },
        {
          user: {
            userGuid: '1',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.localised.key).toBe('invite_count_for_admin_exceeded');
    }
  });

  test('Should test getProfileByUserOrUserId function', async () => {
    const toUser = {
      id: 123,
    };

    await inviteService.getProfileByUserOrUserId(toUser.id);
    expect(profileRepository.findByUserId).toBeCalled;
  });

  test('Should test sendNotificationsForExpiredInvitationsForJoiningGroup function', async () => {
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);
    const userData = generateUser({
      email: inviteObjectJoinGroup.toUserEmail!,
    });
    jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
    jest.spyOn(groupsRepository, 'findOne').mockResolvedValue(groupObject);
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue(groupUserObject);
    jest.spyOn(inviteRepository, 'findMany').mockResolvedValue([inviteObject]);
    await inviteService.sendNotificationsForExpiredInvitationsForJoiningGroup(
      14
    );
  });

  test('Should test getUserByIdOrEmail function', async () => {
    const user = {
      email: 'austin@gipanski.com',
      firstName: 'Austin',
    };
    jest
      .spyOn(userRepository, 'findFirst')
      .mockResolvedValue(user as unknown as IUser);
    await inviteService.getUserByIdOrEmail(1);
    expect(userRepository.findFirst).toBeCalled();
  });

  test('Should test sendGroupNotificationMessages function', async () => {
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(userService, 'findByUserId')
      .mockResolvedValue({ id: 2 } as IUser);
    jest
      .spyOn(inviteService, 'getProfileByUserOrUserId')
      .mockResolvedValue(userProfile);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);

    const res = await inviteService.sendGroupNotificationMessages(
      [
        {
          id: 1,
          invitationId: '1',
          fromUserId: 1,
        } as unknown as Invitations,
        {
          id: 1,
          invitationId: '2',
          fromUserId: 1,
        } as unknown as Invitations,
      ],
      'InvitePending'
    );
    expect(res[0]).toBe(
      'One of toGroupId or fromUserId is not found for invite 1'
    );
    expect(res[1]).toBe(
      'One of toGroupId or fromUserId is not found for invite 2'
    );
  });

  test('Should test getProfileByUserOrUserId function (Error case)', async () => {
    try {
      jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue(null);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.message).toBe('No such profile');
    }
  });

  test('Should test sendGroupNotificationMessage function', async () => {
    const apiSQSResp = {
      $metadata: 1,
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
    const resp = await inviteService.sendGroupNotificationMessage(
      [
        {
          groupName: 'Group 1',
          memberName: 'Austin Gipanski',
          groupId: 123,
          profileId: 12344,
        },
      ],
      'JoinGroupPending',
      12345
    );
    expect(resp).toBe(apiSQSResp as SendMessageCommandOutput);
  });

  test('should test createInvite function (400 self invite)', async () => {
    jest
      .spyOn(userRepository, 'findFirst')
      .mockResolvedValue(generateUser({ id: 1 }));

    try {
      await inviteService.createInvite(
        {
          email: 'test@projectspectra.dev',
          permissions: [PermissionTypes.read],
        },
        {
          user: {
            userGuid: '1',
            firstName: 'First',
            lastName: 'Last',
          },
          headers: {
            host: 'localhost',
          },
          protocol: 'https',
        } as unknown as express.Request
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('invite_user_cant_invite_himself');
    }
  });

  test('should test acceptInvite function', async () => {
    jest
      .spyOn(inviteRepository, 'findFirst')
      .mockResolvedValueOnce(inviteObject);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);
    await inviteService.acceptInvite(
      'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
      '1'
    );
  });
  test('should test acceptInvite function #2 datasharing', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);
    await inviteService.acceptInvite(
      'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
      '1'
    );
  });
  test('should test acceptInvite function #3 joingroup', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObjectJoinGroup,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    await inviteService.acceptInvite(
      'a0c825f4-7fe9-4dd0-b866-f7123a4e9d1a',
      '134'
    );
  });

  test('should test acceptInvite function (404 invite not found)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue(null);

    try {
      await inviteService.acceptInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('invite_invite_is_no_longer_available');
    }
  });

  test('should test acceptInvite function (400 invite already accepted)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue({
      ...inviteObject,
      acceptedAt: new Date(),
    } as unknown as IInvitations);

    try {
      await inviteService.acceptInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });

  test('should test acceptInvite function (400 another invitation for same group accepted)', async () => {
    inviteObject.inviteType = InvitationType.joingroup;
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: new Date(),
    } as unknown as IInvitations);

    try {
      await inviteService.acceptInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });

  test('should test acceptInvite function (400 invite rejected)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      rejectedAt: new Date(),
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);

    try {
      await inviteService.acceptInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });

  test('should test acceptInvite function (400 invite expired)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      expiresAt: moment(new Date()).subtract(24, 'hours').toDate(),
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);

    try {
      await inviteService.acceptInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('invite_invite_has_expired');
    }
  });

  test('should test skipInvite function', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObjectJoinGroup,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);

    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);
    jest.spyOn(groupsService, 'getGroup').mockResolvedValue(groupObject);
    jest
      .spyOn(inviteService, 'getUserByIdOrEmail')
      .mockResolvedValue(userObject);
    jest
      .spyOn(inviteService, 'getProfileByUserOrUserId')
      .mockResolvedValue(profileObject);
    await inviteService.skipInvite('123b', '10');
  });

  test('should test skipInvite function (400 another invitation for same group accepted)', async () => {
    inviteObject.inviteType = InvitationType.joingroup;
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: new Date(),
    } as unknown as IInvitations);

    try {
      await inviteService.skipInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('invite_cant_skip_an_accepted_invite');
    }
  });

  test('should test getRemindersAndSendGroupNotifications', async () => {
    jest
      .spyOn(inviteRepository, 'findMany')
      .mockResolvedValue(userInvitationsToJoinGroup);
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(userService, 'findByUserId')
      .mockResolvedValue({ id: 2 } as IUser);
    jest
      .spyOn(inviteService, 'getProfileByUserOrUserId')
      .mockResolvedValue(userProfile);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);

    const resp = await inviteService.getRemindersAndSendGroupNotifications(
      14,
      0,
      10
    );
    expect(resp?.invitesLength).toBe(2);
    expect(resp?.errorMsgs.length).toBe(0);
  });

  test('should test getExpiredInvitationsForJoiningGroup function', async () => {
    jest
      .spyOn(inviteRepository, 'findMany')
      .mockResolvedValue(userInvitationsToJoinGroup);

    const response = await inviteService.getExpiredInvitationsForJoiningGroup(
      14,
      0,
      10
    );
    expect(response).toEqual(userInvitationsToJoinGroup);
  });

  test('should test rejectInvite function', async () => {
    jest
      .spyOn(inviteRepository, 'findFirst')
      .mockResolvedValueOnce(inviteObject);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);
    await inviteService.rejectInvite(
      'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
      '1'
    );
  });

  test('should test rejectInvite function (404 invite not found)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue(null);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('invite_invite_is_no_longer_available');
    }
  });

  test('should test rejectInvite function (400 invite accepted)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: new Date(),
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });

  test('should test rejectInvite function (400 another invitation for same group accepted)', async () => {
    inviteObject.inviteType = InvitationType.joingroup;
    jest
      .spyOn(groupsService, 'getGroup')
      .mockResolvedValue({ id: 1 } as Groups);
    jest
      .spyOn(groupUsersRepository, 'findMany')
      .mockResolvedValue([groupUserObject]);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: null,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      acceptedAt: new Date(),
    } as unknown as IInvitations);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });

  test('should test rejectInvite function (400 invite rejected)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue({
      ...inviteObject,
      rejectedAt: new Date(),
    } as unknown as IInvitations);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'invite_invite_response_already_submitted'
      );
    }
  });
  test('should test rejectInvite function for joingroup', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObjectJoinGroup,
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);
    jest.spyOn(inviteRepository, 'update').mockResolvedValue({
      ...inviteObjectJoinGroup,
    } as unknown as IInvitations);
    jest.spyOn(groupsService, 'getGroup').mockResolvedValue({
      id: 111,
    } as Groups);
    jest
      .spyOn(inviteService, 'sendGroupNotificationMessage')
      .mockResolvedValue({
        $metadata: 1,
        MessageId: '1',
      } as SendMessageCommandOutput);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.message).toBe('Invite already rejected');
    }
  });

  test('should test rejectInvite function (400 invite expired)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce({
      ...inviteObject,
      expiresAt: moment(new Date()).subtract(24, 'hours').toDate(),
    } as unknown as IInvitations);
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValueOnce(null);

    try {
      await inviteService.rejectInvite(
        'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('invite_invite_has_expired');
    }
  });

  test('should test removeInvite function', async () => {
    await inviteService.removeInvite('397322cd-6405-464f-8fc6-4dc28971ef2f', {
      invitationType: 'datasharing',
      memberEmail: 'test@test.com',
    });
  });

  test('should test removeInvite function (404 invite not found)', async () => {
    jest.spyOn(inviteRepository, 'findFirst').mockResolvedValue(null);

    try {
      await inviteService.removeInvite('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        invitationType: 'datasharing',
        memberEmail: 'test@test.com',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('invite_invite_not_found');
    }
  });

  test('should test removeInvite function (group user without permissions)', async () => {
    jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue({
      role: GroupUserRoles.member,
    } as GroupUsers);

    try {
      await inviteService.removeInvite('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        invitationType: 'joingroup',
        memberEmail: 'test@test.com',
        groupId: 1,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_group_user_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test assignReceivedInvites function', async () => {
    await inviteService.assignReceivedInvites(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      'test@test.com'
    );
  });

  test('should test acceptInvite function', async () => {
    const output = await inviteService.updateInviteCreatedDate(
      'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
      new Date()
    );
    expect(output).toBeUndefined();
  });
});

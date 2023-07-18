import {
  EventSource,
  Groups,
  GroupUserRoles,
  Invitations,
  InvitationType,
  PrismaClient,
  Profile,
} from '@prisma/client';
import prisma from '@core/prisma/prisma';
import moment from 'moment';
import inviteRepository from '@repositories/invite.repository';
import userRepository from '@repositories/user.repository';
import dataSharingAgreementRepository from '@repositories/data-sharing-agreement.repository';
import { IInvitations, IInvitationsWhereInput } from './invite.type';
import { IDataSharingAgreement } from '@modules/data-sharing-agreement/data-sharing-agreement.type';
import {
  ICreateInviteRequestDto,
  IDeleteInviteRequestDto,
} from '@modules/invite/dtos/invite.dto';
import {
  inviteAccepted,
  inviteAlreadyAccepted,
  inviteAlreadyRejected,
  inviteExpired,
  inviteNoLongerAvailable,
  inviteRejected,
  inviteSkipAccepted,
  inviteTypeNotFound,
  noInvite,
  noInviteHimself,
  noSuchProfile,
  noSuchUser,
  userAlreadyAcceptedInvite,
  userAlreadyInGroups,
  userIncompleteProfile,
  userMaxInvitesThresholdExcceded,
  userMaxUnacceptedInvitesExceeded,
} from './invite.error';
import groupUsersRepository from '@repositories/group-users.repository';
import {
  groupsService,
  inviteService,
  userService,
} from '@modules/index/index.service';
import profileRepository from '@repositories/profile.repository';
import { v4 as uuidv4 } from 'uuid';

import { IUser } from '@modules/user/user.type';
import { groupUserNotAuthorized } from '@modules/groups/groups.error';
import * as sqsClient from '../../lib/sqs.client';
import { includeCriteria } from './invite.query.criteria';
import config from '@core/enviroment-variable-config';
import { badRequestError } from '@core/error-handling/error-list';
import express from 'express';
import { EmailDto } from './dtos/email-dto';
import { isAuthorized } from '@modules/groups/groups.service';
import { userNotFound } from '@modules/user/user.error';
import { IProfile } from '@modules/profile/profile.type';
import { createDefaultNotificationSettings } from '@modules/notification-settings/notification-settings.service';
import { update } from '@modules/user/user.service';

// This is for QA. LinkForInvite will be generated automatically by AppFlyer integration
const tempLinkForInvite = config.appsFlyerLink;

const getProfileByUserOrUserId = async (
  toUser: IUser | number | null,
  prismaTr?: PrismaClient
): Promise<Profile> => {
  if (!toUser) {
    throw noSuchProfile();
  }

  let toProfile;
  if (typeof toUser === 'object') {
    toProfile = await profileRepository.findByUserId(toUser.id, prismaTr);
  } else {
    toProfile = await profileRepository.findByUserId(toUser, prismaTr);
  }
  if (!toProfile) {
    throw noSuchProfile();
  }
  return toProfile;
};

const getUserByIdOrEmail = async (
  userId: number | string
): Promise<IUser | null> => {
  let user;
  if (typeof userId == 'number') {
    user = await userRepository.findFirst({
      id: userId,
    });
  } else {
    user = await userRepository.findFirst({
      email: userId,
    });
  }
  return user;
};

const getUserByGuidOrEmail = async (input: {
  userGuid: string;
  email: string;
}): Promise<IUser | null> => {
  let user;

  const { userGuid, email } = input;
  if (userGuid && userGuid.length) {
    user = await userRepository.findFirst({
      userGuid,
    });
  } else {
    user = await userRepository.findFirst({
      email,
    });
  }
  return user;
};

const sendGroupNotificationMessage = async (
  dataMessage: Array<object>,
  messageType: string,
  sourceProfileId: number
) => {
  const Message = {
    profileId: sourceProfileId,
    eventSource: EventSource.SystemGenerated,
    default: `group:Group|type:${messageType}`,
    group: 'Group',
    type: messageType,
    data: dataMessage,
  };
  return sqsClient.publishMessageSQS(Message);
};

const sendGroupNotificationMessages = async (
  reminders: Invitations[],
  messageType: string
): Promise<string[]> => {
  const errorMsgs: string[] = [];
  for (const invite of reminders) {
    try {
      if (!invite.toGroupId || !invite.fromUserId) {
        errorMsgs.push(
          `One of toGroupId or fromUserId is not found for invite ${invite.invitationId}`
        );
        continue;
      }
      const group = await groupsService.getGroup(invite.toGroupId);
      const sourceUser = await userService.findByUserId(invite.fromUserId);
      if (!sourceUser) {
        errorMsgs.push(
          `sourceUser not found for invite ${invite.invitationId}`
        );
        continue;
      }

      if (invite.toUserId) {
        const sourceProfile = await inviteService.getProfileByUserOrUserId(
          sourceUser.id
        );
        const toUser = await userService.findByUserId(invite.toUserId);
        if (!toUser) {
          errorMsgs.push(
            `toUserId not found for invite ${invite.invitationId}`
          );
          continue;
        }
        const toProfile = await inviteService.getProfileByUserOrUserId(
          toUser.id
        );

        //send notification to receiver
        await inviteService.sendGroupNotificationMessage(
          [
            {
              groupName: group.groupName,
              groupAdminName: sourceUser.firstName + ' ' + sourceUser.lastName,
              groupId: group.id,
              profileId: sourceProfile.id,
              metaData: { inviteId: invite.invitationId },
            },
          ],
          messageType,
          toProfile.id
        );
      } else {
        await sqsClient.publishMessageSQS({
          default: 'group:Email',
          eventSource: EventSource.SystemGenerated,
          group: 'Email',
          type: messageType,
          data: [
            {
              emailRecipient: invite.toUserEmail,
              groupName: group.groupName,
              inviterName: sourceUser.firstName,
              inviterLastName: sourceUser.lastName,
              productName: 'Spectra',
            },
          ],
        });
      }
    } catch (err) {
      errorMsgs.push(JSON.stringify(err as string));
    }
  }
  return errorMsgs;
};

const resendGroupInvites = async (
  groups: Groups[],
  userGuid: string,
  groupsWithInvitationId: { groupId: number; invitationId: string }[],
  resentInvitationIds: string[],
  emailData: EmailDto,
  type: string,
  toUserIdentifier: string | number,
  profileId?: number
): Promise<string[]> => {
  for (const group of groups) {
    const groupUser = await groupsService.getGroupUser(userGuid, group.id);
    //maybe the user is not an admin anymore in that group, so continue
    const selectedGroup = groupsWithInvitationId.filter(
      (gr) => gr.groupId == group.id
    )[0];
    if (groupUser.role !== GroupUserRoles.admin) {
      // remove the invitation id from the array
      if (!selectedGroup) {
        //this should not occur
        continue;
      }
      const indexInvitation = resentInvitationIds.indexOf(
        selectedGroup.invitationId
      );
      if (indexInvitation > -1) {
        resentInvitationIds.splice(indexInvitation, 1);
      }
      continue;
    }
  }
  for (const inviteId of resentInvitationIds) {
    const groupFilter = groupsWithInvitationId.filter(
      (obj: { groupId: number; invitationId: string }) =>
        obj.invitationId == inviteId
    )[0];

    if (!groupFilter) {
      continue;
    }
    const groupId = groupFilter.groupId;
    const groupName = groups.filter((gr: Groups) => gr.id == groupId)[0]
      .groupName;
    const numberOfInvitesSentPerPeriodOfTime =
      await inviteRepository.getNumberOfinvitesSentByUserToDestinationUser(
        toUserIdentifier,
        groupId
      );
    if (
      numberOfInvitesSentPerPeriodOfTime >=
      config.maxInvitesForAdminForSameUserSameGroupThreshold
    ) {
      throw userMaxInvitesThresholdExcceded();
    }
    emailData.groupName = groupName;
    const inviteMessageUuid = uuidv4();
    emailData.linkForInvite = `${tempLinkForInvite}/${inviteMessageUuid}`;
    emailData.metaData = {
      inviteId,
    };
    emailData.messageGuid = inviteMessageUuid;
    await sqsClient.publishMessageSQS({
      default: 'group:Email',
      eventSource: EventSource.SystemGenerated,
      group: 'Email',
      type,
      profileId,
      data: [emailData],
    });
  }
  return resentInvitationIds;
};

const createOrResendInvite = async (
  requestDTO: ICreateInviteRequestDto,
  request: express.Request
) => {
  let invitationIds;
  if (requestDTO.resendInvite) {
    invitationIds = await inviteService.resendInvite(requestDTO, request);
  } else {
    invitationIds = await inviteService.createInvite(requestDTO, request);
  }
  return invitationIds;
};

const resendInvite = async (
  resendRequestDTO: ICreateInviteRequestDto,
  request: express.Request
): Promise<string[]> => {
  const userGuid = request.user.userGuid;
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const sourceFirstName = request.user.firstName;
  const sourceLastName = request.user.lastName;

  let toUserId, toUserEmail: string;
  const { email: invitedUserEmail } = resendRequestDTO;
  if (!resendRequestDTO.invitationType) {
    resendRequestDTO.invitationType = InvitationType.joingroup;
  }

  if (resendRequestDTO.invitationType == InvitationType.datasharing) {
    throw noInvite();
  }

  const toUser = await inviteService.getUserByIdOrEmail(invitedUserEmail);
  let toProfile: IProfile | undefined;

  if (toUser) {
    toUserId = toUser.id;
    toUserEmail = toUser.email;
    try {
      toProfile = await getProfileByUserOrUserId(toUser);
    } catch (_) {
      throw userIncompleteProfile();
    }
  } else {
    toUserEmail = invitedUserEmail;
  }

  // handle if user invites himself
  if (userId === toUserId) {
    throw noInviteHimself();
  }

  let resentInvitationIds: string[] = [];
  const invitationsToResend = await inviteRepository.findMany(
    {
      fromUserId: userId,
      toUserEmail,
      inviteType: InvitationType.joingroup,
      acceptedAt: null,
      rejectedAt: null,
    },
    undefined,
    undefined,
    undefined
  );

  if (!invitationsToResend) {
    throw noInvite();
  }

  // check for invite count here
  const numberOfInvitesSent =
    await inviteRepository.getNumberOfinvitesSentByUser(userId);
  if (numberOfInvitesSent >= config.maxInvitesUnacceptedPerAdmin) {
    throw userMaxUnacceptedInvitesExceeded();
  }

  const groupsWithInvitationId = invitationsToResend.reduce(
    (accum: any[], obj) => {
      const groupId = obj.toGroupId;
      if (!groupId || !obj.invitationId) {
        return accum;
      }
      accum.push({ groupId, invitationId: obj.invitationId });
      return accum;
    },
    []
  );

  const groups = await groupsService.getGroups(
    groupsWithInvitationId.map((el) => el['groupId'])
  );

  for (const invite of invitationsToResend) {
    resentInvitationIds.push(invite.invitationId);
  }

  // validate if invited user is not a group member
  if (toUser) {
    const invitedUserGroups = await groupUsersRepository.findMany({
      groupId: {
        in: groups.reduce((accum: number[], obj) => {
          accum.push(obj.id);
          return accum;
        }, []),
      },
      userId,
    });

    if (invitedUserGroups?.length) {
      throw userAlreadyAcceptedInvite();
    }
  }

  const toUserIdentifier: string | number = toUser
    ? toUser.id
    : invitedUserEmail;

  resentInvitationIds = await inviteService.resendGroupInvites(
    groups,
    request.user.userGuid,
    groupsWithInvitationId,
    resentInvitationIds,
    //groupName gets assigned the correct value inside resendGroupInvites
    {
      groupName: '',
      emailRecipient: toUserEmail,
      firstName: toUser?.firstName,
      lastName: toUser?.lastName,
      linkForInvite: tempLinkForInvite,
      inviterName: sourceFirstName,
      inviterLastName: sourceLastName,
      productName: 'Spectra',
      legalCopy:
        'Lorem ipsum dolor sit amet. Et quisquam aspernatur et similique amet et laborum iure quo debitis animi. Eum sint dolorem ea doloremque ipsa in voluptatem fugit aut quibusdam laboriosam eos ipsum dolorem ab veritatis quasi.',
    },
    toUser ? 'joinGroupEmail' : 'joinGroupEmailNewUser',
    toUserIdentifier,
    toProfile?.id
  );
  return resentInvitationIds;
};

const createInvite = async (
  createRequestDTO: ICreateInviteRequestDto,
  request: express.Request
): Promise<string[]> => {
  const userGuid = request.user.userGuid;
  const user = await findUser(userGuid);
  const userId = user.id;

  //check

  const sourceFirstName = request.user.firstName;
  const sourceLastName = request.user.lastName;

  let toUserId, toUserEmail: string;
  const { email: invitedUserEmail, permissions } = createRequestDTO;

  const toUser = await inviteService.getUserByIdOrEmail(invitedUserEmail);
  let toProfile: IProfile | undefined;
  if (!createRequestDTO.invitationType) {
    createRequestDTO.invitationType = InvitationType.datasharing;
  }

  if (toUser) {
    toUserId = toUser.id;
    toUserEmail = toUser.email;
    try {
      toProfile = await getProfileByUserOrUserId(toUser);
    } catch (_) {
      // empty body
    }
  } else {
    toUserEmail = invitedUserEmail;
  }

  // handle if user invites himself
  validateNoInviteHimself(userId, toUserId);

  const expirePeriodHours =
    createRequestDTO.invitationType === InvitationType.datasharing
      ? 24
      : 24 * config.inviteGroupMaxPeriodDays;

  const invitationBodyMsg = {
    fromUserId: userId,
    toUserId,
    toUserEmail,
    expiresAt: moment(new Date()).add(expirePeriodHours, 'hours').toDate(),
    permissions,
    inviteType: createRequestDTO.invitationType
      ? createRequestDTO.invitationType
      : InvitationType.datasharing,
    toGroupId: null,
    groupAccessLevel: createRequestDTO.groupAccessLevel,
  } as IInvitations;

  if (createRequestDTO.invitationType == InvitationType.datasharing) {
    await inviteRepository.create(invitationBodyMsg);
    return [];
  }
  createRequestDTO.permissions = undefined;
  //send notfication to admin that he created an invite
  const groups = await groupsService.getGroups(createRequestDTO.toGroupIds!);
  const createdInvitations: string[] = [];
  // validate if user is admin of the groups
  await validateGroupUserNotAuthorized(groups, request);
  // check for invite count here
  const numberOfInvitesSent =
    await inviteRepository.getNumberOfinvitesSentByUser(userId);
  if (numberOfInvitesSent >= config.maxInvitesUnacceptedPerAdmin) {
    throw userMaxUnacceptedInvitesExceeded();
  }

  //check for threshold here
  //any admin of the same group can send max 1 invitation per 24h to the same user

  // validate if invited user is not a group member
  await validateUserAlreadyInGroups(createRequestDTO, groups, toUser);

  const toUserDestination: string | number = toUserId ? toUserId : toUserEmail;

  for (const group of groups) {
    //check any other invite to the same user, same group and soft delete it ("inactivate" )

    const numberOfInvitesSentPerPeriodOfTime =
      await inviteRepository.getNumberOfinvitesSentByUserToDestinationUser(
        toUserDestination,
        group.id
      );
    if (
      numberOfInvitesSentPerPeriodOfTime >=
      config.maxInvitesForAdminForSameUserSameGroupThreshold
    ) {
      throw userMaxInvitesThresholdExcceded();
    }

    await prisma.$transaction(async (prismaClient) => {
      await inviteRepository.updateMany(
        {
          toUserEmail,
          toGroupId: group.id,
          acceptedAt: null,
          rejectedAt: null,
        },
        {
          deleted: new Date(),
        },
        prismaClient as PrismaClient
      );

      const createdInvitation = await inviteRepository.create(
        { ...invitationBodyMsg, toGroupId: group.id },
        prismaClient as PrismaClient
      );
      createdInvitations.push(createdInvitation.invitationId);

      await publishInviteMessage(
        toUserEmail,
        group,
        sourceFirstName,
        sourceLastName,
        createdInvitation,
        toUser,
        user,
        toProfile,
        prismaClient as PrismaClient
      );
    });
  }

  return createdInvitations;
};

const invitationsExpireMany = async (periodDays: number) => {
  const startDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 0, minute: 0, second: 0 })
    .format();
  const endDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 23, minute: 59, second: 59 })
    .format();

  const startDate20 = moment()
    .utcOffset(0)
    .subtract(20, 'd')
    .set({ hour: 0, minute: 0, second: 0 })
    .format();
  const endDate20 = moment()
    .utcOffset(0)
    .subtract(20, 'd')
    .set({ hour: 23, minute: 59, second: 59 })
    .format();

  //cleanup pending invites to transient users
  inviteRepository.updateMany(
    {
      OR: {
        AND: {
          sentAt: {
            gte: startDate,
            lte: endDate,
          },
          expiresAt: {
            gt: new Date(),
          },
          acceptedAt: null,
          rejectedAt: null,
          toUser: {
            transient: true,
          },
        },
        sentAt: {
          gte: startDate20,
          lte: endDate20,
        },
        toUser: {
          transient: true,
        },
      },
      deleted: null,
    },
    {
      deleted: new Date(),
    }
  );
};

const getRemindersForJoiningGroup = async (
  periodDays: number,
  skip = 0,
  take = 10
) => {
  const startDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 0, minute: 0, second: 0 })
    .format();
  const endDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 23, minute: 59, second: 59 })
    .format();
  return inviteRepository.findMany(
    {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
      expiresAt: {
        gt: new Date(),
      },
      acceptedAt: null,
      rejectedAt: null,
      inviteType: InvitationType.joingroup,
    },
    includeCriteria,
    skip,
    take
  );
};

const getRemindersAndSendGroupNotifications = async (
  periodDays: number,
  skip: number,
  take: number
) => {
  const reminders = await inviteService.getRemindersForJoiningGroup(
    periodDays,
    skip,
    take
  );
  if (!reminders) {
    return null;
  }

  const maxPeriodForInvite = config.inviteGroupMaxPeriodDays;
  const remainingPeriod = maxPeriodForInvite - periodDays;

  // the endpoint should be called with 7 or 13 for periodDays (e.g. after 7 and 13 days)
  // if the SQS consumer does not have the specific message type, such as GroupInvite5DaysRemaining
  // then it should not process it.
  const messageType: string =
    remainingPeriod > 1
      ? `GroupInvite${remainingPeriod}DaysRemaining`
      : `GroupInvite${remainingPeriod}DayRemaining`;

  const errorMsgs = await inviteService.sendGroupNotificationMessages(
    reminders,
    messageType
  );

  return {
    invitesLength: reminders.length,
    errorMsgs,
  };
};

const getExpiredInvitationsForJoiningGroup = async (
  periodDays: number,
  skip = 0,
  take = 10
) => {
  const startDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 0, minute: 0, second: 0 })
    .format();
  const endDate = moment()
    .utcOffset(0)
    .subtract(periodDays, 'd')
    .set({ hour: 23, minute: 59, second: 59 })
    .format();
  return inviteRepository.findMany(
    {
      sentAt: {
        gte: startDate,
        lte: endDate,
      },
      expiresAt: {
        lte: new Date(),
      },
      acceptedAt: null,
      rejectedAt: null,
      inviteType: InvitationType.joingroup,
    },
    includeCriteria,
    skip,
    take
  );
};

const sendNotificationsForExpiredInvitationsForJoiningGroup = async (
  periodDays: number,
  skip = 0,
  take = 10
) => {
  const expiredInvites =
    await inviteService.getExpiredInvitationsForJoiningGroup(
      periodDays,
      skip,
      take
    );
  if (!expiredInvites) {
    return {
      invitesLength: 0,
      errorMsgs: [],
    };
  }
  const errorMsgs: string[] = [];

  for (const invite of expiredInvites) {
    try {
      const sourceUser = await userService.findByUserId(invite.fromUserId);
      const sourceProfile = await inviteService.getProfileByUserOrUserId(
        sourceUser!.id
      );
      const group = await groupsService.getGroup(invite.toGroupId!);
      const toUser = await getUserByIdOrEmail(invite.toUserId!);

      //send notif. to sender
      if (toUser) {
        const toProfile = await getProfileByUserOrUserId(toUser);
        await inviteService.sendGroupNotificationMessage(
          [
            {
              groupName: group.groupName,
              emailAddress: toUser.email,
              groupId: group.id,
              profileId: toProfile.id,
            },
          ],
          'GroupInviteExpired',
          sourceProfile.id
        );

        //send notif. to receiver
        await inviteService.sendGroupNotificationMessage(
          [
            {
              groupName: group.groupName,
              groupAdminName:
                sourceUser!.firstName + ' ' + sourceUser!.lastName,
              groupId: group.id,
              profileId: sourceProfile.id,
            },
          ],
          'GroupInvite0DaysRemaining',
          toProfile.id
        );
      } else {
        await inviteService.sendGroupNotificationMessage(
          [
            {
              groupName: group.groupName,
              emailAddress: invite.toUserEmail,
              groupId: group.id,
              metaData: { inviteId: invite.invitationId },
            },
          ],
          'GroupInviteNewUserExpired',
          sourceProfile.id
        );
      }
    } catch (err) {
      errorMsgs.push(JSON.stringify(err as string));
    }
  }
  return {
    invitesLength: expiredInvites.length,
    errorMsgs,
  };
};

const acceptInvite = async (
  invitationId: string,
  toUserGuid: string
): Promise<void> => {
  const user = await userService.findByUserGuid(toUserGuid);
  if (!user) {
    throw userNotFound();
  }
  const toUserId = user.id;
  const foundInvite = await inviteRepository.findFirst({
    invitationId,
    toUserId,
  } as IInvitationsWhereInput);

  if (!foundInvite) {
    throw inviteNoLongerAvailable();
  }

  if (foundInvite.acceptedAt) {
    throw inviteAlreadyAccepted();
  }

  //check if the destination user already accepted an invite to the same group as the group mentioned in the invitationId
  const invitesFromSameAdminToSameGroupAlreadyAccepted =
    await inviteRepository.findFirst({
      toUserId,
      acceptedAt: {
        not: null,
      },
      toGroupId: foundInvite.toGroupId,
    } as IInvitationsWhereInput);

  if (invitesFromSameAdminToSameGroupAlreadyAccepted) {
    throw inviteAlreadyAccepted();
  }

  if (foundInvite.rejectedAt) {
    throw inviteRejected();
  }

  if (moment(new Date(foundInvite.expiresAt)).isBefore(moment(new Date()))) {
    throw inviteExpired();
  }

  if (foundInvite.inviteType == InvitationType.datasharing) {
    await prisma.$transaction(async (prismaClient) => {
      await inviteRepository.update(
        { id: foundInvite.id },
        {
          acceptedAt: new Date(),
        } as IInvitations,
        prismaClient as PrismaClient
      );
      await dataSharingAgreementRepository.create(
        {
          invitationId: foundInvite.id,
          fromUserId: foundInvite.fromUserId,
          toUserId,
          permissions: foundInvite.permissions,
        } as IDataSharingAgreement,
        prismaClient as PrismaClient
      );
    });
  } else if (foundInvite.inviteType == InvitationType.joingroup) {
    const sourceProfile = await getProfileByUserOrUserId(
      foundInvite.fromUserId
    );
    const toUser = await getUserByIdOrEmail(toUserId);
    if (!toUser) {
      throw noSuchUser();
    }
    const toProfile = await getProfileByUserOrUserId(toUser);
    const group = await groupsService.getGroup(foundInvite.toGroupId!);

    await prisma.$transaction(async (prismaClient) => {
      await inviteRepository.update(
        { id: foundInvite.id },
        {
          acceptedAt: new Date(),
        } as IInvitations,
        prismaClient as PrismaClient
      );

      await groupUsersRepository.create(
        {
          userId: toUserId,
          groupId: foundInvite.toGroupId!,
          role: foundInvite.groupAccessLevel as GroupUserRoles,
        },
        prismaClient as PrismaClient
      );

      await inviteService.sendGroupNotificationMessage(
        [
          {
            groupName: group.groupName,
            memberName: toUser.firstName + ' ' + toUser.lastName,
            groupId: foundInvite.toGroupId,
            profileId: toProfile.id,
          },
        ],
        'GroupInviteAccepted',
        sourceProfile.id
      );
    });
  } else {
    throw inviteTypeNotFound();
  }
};

const skipInvite = async (
  invitationId: string,
  userGuid: string
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  const foundInvite = await inviteRepository.findFirst({
    invitationId,
    toUserId: user.id,
  } as IInvitationsWhereInput);

  const userId = user.id;

  if (!foundInvite) {
    throw inviteNoLongerAvailable();
  }

  if (foundInvite.acceptedAt) {
    throw inviteSkipAccepted();
  }

  //check if the destination user already accepted an invite to the same group as the group mentioned in the invitationId
  const invitesFromSameAdminToSameGroupAlreadyAccepted =
    await inviteRepository.findFirst({
      toUserId: userId,
      acceptedAt: {
        not: null,
      },
      toGroupId: foundInvite.toGroupId,
    } as IInvitationsWhereInput);

  if (invitesFromSameAdminToSameGroupAlreadyAccepted) {
    throw inviteSkipAccepted();
  }

  if (foundInvite.rejectedAt) {
    throw inviteAlreadyRejected();
  }

  if (moment(new Date(foundInvite.expiresAt)).isBefore(moment(new Date()))) {
    throw inviteExpired();
  }

  //endpoint works only for joingroup invites
  if (foundInvite.inviteType !== InvitationType.joingroup) {
    throw inviteTypeNotFound();
  }

  const toUser = await getUserByIdOrEmail(userId);
  if (!toUser) {
    throw noSuchUser();
  }
  const sourceProfile = await getProfileByUserOrUserId(foundInvite.fromUserId);
  const toProfile = await getProfileByUserOrUserId(userId);
  const group = await groupsService.getGroup(foundInvite.toGroupId!);

  await inviteService.sendGroupNotificationMessage(
    [
      {
        groupName: group.groupName,
        emailAddress: toUser.email,
        groupId: group.id,
        profileId: toProfile.id,
      },
    ],
    'GroupInvitePending',
    sourceProfile.id
  );
};

const rejectInvite = async (
  invitationId: string,
  userGuid: string
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const foundInvite = await inviteRepository.findFirst({
    invitationId,
    toUserId: userId,
  } as IInvitationsWhereInput);

  if (!foundInvite) {
    throw inviteNoLongerAvailable();
  }

  if (foundInvite.acceptedAt) {
    throw inviteAccepted();
  }

  //check if the destination user already accepted an invite to the same group as the group mentioned in the invitationId
  const invitesFromSameAdminToSameGroupAlreadyAccepted =
    await inviteRepository.findFirst({
      toUserId: userId,
      acceptedAt: {
        not: null,
      },
      toGroupId: foundInvite.toGroupId,
    } as IInvitationsWhereInput);

  if (invitesFromSameAdminToSameGroupAlreadyAccepted) {
    throw inviteAccepted();
  }

  if (foundInvite.rejectedAt) {
    throw inviteAlreadyRejected();
  }

  if (moment(new Date(foundInvite.expiresAt)).isBefore(moment(new Date()))) {
    throw inviteExpired();
  }

  await inviteRepository.update({ id: foundInvite.id }, {
    rejectedAt: new Date(),
  } as IInvitations);

  if (foundInvite.inviteType == InvitationType.joingroup) {
    // send notfication
    const toUser = await getUserByIdOrEmail(userId);
    if (!toUser) {
      throw noSuchUser();
    }
    const sourceProfile = await getProfileByUserOrUserId(
      foundInvite.fromUserId
    );
    const toProfile = await getProfileByUserOrUserId(userId);
    const group = await groupsService.getGroup(foundInvite.toGroupId!);
    await inviteService.sendGroupNotificationMessage(
      [
        {
          groupName: group.groupName,
          emailAddress: toUser.email,
          groupId: group.id,
          profileId: toProfile.id,
        },
      ],
      'GroupInviteDeclined',
      sourceProfile.id
    );
  }
};

const removeInvite = async (
  userGuid: string,
  deleteInviteDTO: IDeleteInviteRequestDto
): Promise<void> => {
  // only group admins can remove a pending group member
  if (deleteInviteDTO.invitationType === InvitationType.joingroup) {
    const groupUser = await groupsService.getGroupUser(
      userGuid,
      deleteInviteDTO.groupId!
    );
    isAuthorized(groupUser.role);
  }

  const foundInvite = await inviteRepository.findFirst({
    inviteType: deleteInviteDTO.invitationType,
    toUserEmail: deleteInviteDTO.memberEmail,
    toGroupId: deleteInviteDTO.groupId || null,
    acceptedAt: null,
    rejectedAt: null,
  } as IInvitationsWhereInput);

  if (!foundInvite) {
    throw noInvite();
  }
  await inviteRepository.remove({ id: foundInvite.id });
};

const assignReceivedInvites = async (
  userGuid: string,
  userEmail: string
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  await inviteRepository.updateMany(
    {
      toUserEmail: userEmail,
    },
    {
      toUserId: userId,
    }
  );
};

const updateInviteCreatedDate = async (
  invitationId: string,
  sentAt?: Date,
  expiresAt?: Date
): Promise<void> => {
  const foundInvite = await inviteRepository.findFirst({
    invitationId,
  } as IInvitationsWhereInput);

  if (!foundInvite) {
    throw noInvite();
  }
  if (!sentAt) {
    sentAt = foundInvite.sentAt;
  }

  if (expiresAt) {
    if (moment(new Date(expiresAt)).isBefore(moment(sentAt))) {
      throw inviteExpired();
    }
    await inviteRepository.update({ id: foundInvite.id }, {
      sentAt,
      expiresAt,
    } as IInvitations);
  } else if (sentAt) {
    await inviteRepository.update({ id: foundInvite.id }, {
      sentAt,
    } as IInvitations);
  } else {
    throw badRequestError('Either createdDate or expiresDate or both required');
  }
};

const findUser = async (userGuid: string) => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  return user;
};

const validateNoInviteHimself = (userId: number, toUserId?: number) => {
  if (toUserId && userId === toUserId) {
    throw noInviteHimself();
  }
};

const validateGroupUserNotAuthorized = async (
  groups: Groups[],
  request: express.Request
) => {
  for (const group of groups) {
    const groupUser = await groupsService.getGroupUser(
      request.user.userGuid,
      group.id!
    );
    if (groupUser.role !== GroupUserRoles.admin) {
      throw groupUserNotAuthorized();
    }
  }
};

const validateUserAlreadyInGroups = async (
  createRequestDTO: ICreateInviteRequestDto,
  groups: Groups[],
  toUser: IUser | null
) => {
  if (toUser) {
    const invitedUserGroups = await groupUsersRepository.findMany({
      groupId: {
        in: createRequestDTO.toGroupIds,
      },
      userId: toUser.id,
    });
    if (invitedUserGroups?.length) {
      throw userAlreadyInGroups(
        groups
          .filter((group) =>
            invitedUserGroups
              .map((groupUser) => groupUser.groupId)
              .includes(group.id)
          )
          .map((group) => group.groupName)
          .join(',')
      );
    }
  }
};

const publishInviteMessage = async (
  toUserEmail: string,
  group: Groups,
  sourceFirstName: string,
  sourceLastName: string,
  createdInvitation: Invitations,
  toUser: IUser | null,
  sourceUser: IUser,
  toProfile?: Profile,
  prismaTr?: PrismaClient
) => {
  const inviteMessageUuid = uuidv4();
  const sourceProfile = await getProfileByUserOrUserId(sourceUser, prismaTr);
  if (!toProfile) {
    let transientUser;
    if (!toUser) {
      //create a transient profile
      transientUser = await userRepository.create(
        {
          timeZoneId: sourceUser.timeZoneId ? sourceUser.timeZoneId : 491,
          email: toUserEmail,
          authId: inviteMessageUuid,
          firstName: ' ',
          lastName: ' ',
          transient: true,
        },
        prismaTr
      );
    } else {
      transientUser = { ...toUser, authId: inviteMessageUuid, transient: true };
    }
    await createDefaultNotificationSettings(
      transientUser.id,
      undefined,
      prismaTr
    );
    //create a transient profile
    await update(
      transientUser,
      {
        firstName: ' ',
        lastName: ' ',
        profile: {
          dob: '01/01/00',
          regionalPref: sourceProfile.regionalPref,
          genderId: 1,
        },
      },
      true,
      prismaTr
    );
    toProfile = await getProfileByUserOrUserId(transientUser, prismaTr);
    toUser = transientUser;
  }
  await sqsClient.publishMessageSQS({
    default: 'group:Email',
    eventSource: EventSource.SystemGenerated,
    group: toUser ? 'Group' : 'Email',
    type: toUser ? 'joinGroup' : 'joinGroupEmailNewUser',
    profileId: toProfile?.id,
    data: [
      {
        emailRecipient: toUserEmail,
        firstName: toUser?.firstName,
        lastName: toUser?.lastName,
        groupName: group.groupName,
        linkForInvite: `${tempLinkForInvite}/${inviteMessageUuid}`,
        inviterName: sourceFirstName,
        inviterLastName: sourceLastName,
        productName: 'Spectra',
        metaData: { inviteId: createdInvitation.invitationId },
        messageGuid: inviteMessageUuid,
      },
    ],
  });
};

export {
  createInvite,
  createOrResendInvite,
  resendGroupInvites,
  resendInvite,
  invitationsExpireMany,
  skipInvite,
  acceptInvite,
  rejectInvite,
  removeInvite,
  getProfileByUserOrUserId,
  assignReceivedInvites,
  getUserByGuidOrEmail,
  updateInviteCreatedDate,
  getRemindersAndSendGroupNotifications,
  getRemindersForJoiningGroup,
  sendNotificationsForExpiredInvitationsForJoiningGroup,
  sendGroupNotificationMessage,
  sendGroupNotificationMessages,
  getUserByIdOrEmail,
  getExpiredInvitationsForJoiningGroup,
};

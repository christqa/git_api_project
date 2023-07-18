import { GroupUserRoles, PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';
import config from '@core/enviroment-variable-config';
import { IGroup, IGroupUser } from './groups.type';
import groupsRepository from '@repositories/groups.repository';
import groupUsersRepository from '@repositories/group-users.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import deviceActivationRepository from '@repositories/device-activation.repository';
import {
  groupNameNotUnique,
  groupNotFound,
  groupUserLastAdmin,
  groupUserLastAdminDowngrade,
  groupUserLastAdminLeaveGroup,
  groupUserNotAuthorized,
  groupUserNotFound,
  groupWithDevices,
  groupWithUsers,
  notAuthorized,
} from './groups.error';
import {
  ICreateGroupRequestDto,
  IDeleteGroupRequestDto,
  IGetGroupResponseDto,
  IGetGroupsRequestDto,
  IGetGroupsResponseDto,
  ILeaveGroupRequestDto,
  IUpdateGroupRequestDto,
  IGetGroupDevicesRequestDto,
  IGetGroupDevicesResponseDto,
  IGetGroupMembersResponseDto,
  IUpdateGroupMemberAccessRequestDto,
  IGetPendingGroupMemberResponseDto,
  IGetGroupsSummaryRequestDto,
  IGetGroupsSummaryResponseDto,
  IGetGroupMembersRequestDto,
} from './dtos/groups.index.dto';
import { getDateWithFormat } from '@utils/date.util';
import {
  IDeviceActivationDeviceBatteryStatus,
  IDeviceActivationDeviceConnectionStatus,
} from '@modules/device-activation/device-activation.type';
import { IInvitations } from '@modules/invite/invite.type';
import { IUser } from '@modules/user/user.type';
import {
  inviteService,
  profileService,
  userService,
} from '@modules/index/index.service';
import firmwareService from '@modules/firmware/firmware.service';
import userRepository from '@repositories/user.repository';
import { userNotFound } from '@modules/user/user.error';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const findGroups = async (
  userGuid: string,
  { skip, take }: IGetGroupsRequestDto
): Promise<IGetGroupsResponseDto> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const { count: total, groupUsers } =
    await groupUsersRepository.groupsFindMany(
      {
        userId,
        deleted: null,
      },
      {
        skip,
        take,
      }
    );

  return {
    total,
    groups: groupUsers.map((gUser) => ({
      groupId: gUser.group.id,
      groupName: gUser.group.groupName,
      role: gUser.role,
      createdOn: getDateWithFormat({
        date: gUser.group.createdOn,
        format: DATE_FORMAT_ISO8601,
      }),
      addedOn: getDateWithFormat({
        date: gUser.addedOn,
        format: DATE_FORMAT_ISO8601,
      }),
    })),
  };
};

const findGroupsMe = async (
  userId: number
): Promise<IGetGroupResponseDto[]> => {
  const groupUsers = await groupUsersRepository.groupsFindManyMe({
    userId,
    deleted: null,
  });
  return groupUsers.map((groupUser) => ({
    groupId: groupUser.group.id,
    groupName: groupUser.group.groupName,
    createdOn: getDateWithFormat({
      date: groupUser.group.createdOn,
      format: DATE_FORMAT_ISO8601,
    }),
    role: groupUser.role,
    addedOn: getDateWithFormat({
      date: groupUser.addedOn,
      format: DATE_FORMAT_ISO8601,
    }),
  }));
};

const findGroupsSummary = async (
  userGuid: string,
  { skip, take }: IGetGroupsSummaryRequestDto
): Promise<IGetGroupsSummaryResponseDto> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const { count: total, groupUsers } =
    await groupUsersRepository.groupsSummaryFindMany(
      {
        userId,
        deleted: null,
      },
      {
        skip,
        take,
      }
    );

  return {
    total,
    groups: groupUsers.map((gUser) => ({
      groupId: gUser.group.id,
      groupName: gUser.group.groupName,
      role: gUser.role,
      createdOn: gUser.group.createdOn,
      addedOn: gUser.addedOn,
      devices: gUser.group.groupDevices.map((groupDevice) => ({
        deviceName: groupDevice.deviceInventory.deviceActivation[0].deviceName,
        batteryStatus: getBatteryStatus(
          groupDevice.deviceInventory.deviceActivation[0].batteryStatus
        ),
        bleMacAddress: groupDevice.deviceInventory.bleMacAddress,
      })),
      groupMembers: gUser.group.groupUsers.map((groupUser) => ({
        userGuid: groupUser.user.userGuid,
        memberName: groupUser.user.firstName,
        memberLastName: groupUser.user.lastName,
        memberAccess: groupUser.role,
        memberEmail: groupUser.user.email,
        addedOn: getDateWithFormat({
          date: groupUser.addedOn,
          format: DATE_FORMAT_ISO8601,
        }),
      })),
      pendingGroupMembers:
        gUser.role === GroupUserRoles.admin
          ? (gUser.group.invitations || []).map((joinGroupInvitation) => {
              const invite = joinGroupInvitation as IInvitations & {
                toUser: IUser;
              };
              return {
                memberAccess: invite.groupAccessLevel as GroupUserRoles,
                memberEmail: invite.toUser
                  ? invite.toUser.email
                  : invite.toUserEmail,
              } as IGetPendingGroupMemberResponseDto;
            })
          : [],
    })),
  };
};

const createGroup = async (
  userGuid: string,
  createGroupRequest: ICreateGroupRequestDto
): Promise<IGetGroupResponseDto> => {
  // check group name unique
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const group = await groupsRepository.findFirst({
    createdBy: userId,
    groupName: {
      equals: createGroupRequest.groupName,
      mode: 'insensitive',
    },
  });

  if (group) {
    throw groupNameNotUnique();
  }

  return prisma.$transaction(async (transaction) => {
    const prismaTr = transaction as PrismaClient;

    // create group
    const newGroup = await groupsRepository.create(
      {
        createdBy: userId,
        ...createGroupRequest,
      },
      prismaTr
    );

    // assign user to group
    await groupUsersRepository.create(
      {
        userId,
        groupId: newGroup.id,
        role: GroupUserRoles.admin,
      },
      prismaTr
    );

    return {
      groupId: newGroup.id,
      groupName: newGroup.groupName,
      role: GroupUserRoles.admin,
      createdOn: getDateWithFormat({
        date: newGroup.createdOn,
        format: DATE_FORMAT_ISO8601,
      }),
      addedOn: getDateWithFormat({
        date: newGroup.createdOn,
        format: DATE_FORMAT_ISO8601,
      }),
    };
  });
};

const updateGroup = async (
  userGuid: string,
  updateGroupRequest: IUpdateGroupRequestDto
): Promise<void> => {
  // get/check group
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const group = await getGroup(updateGroupRequest.groupId);

  // get/check group user
  const groupUser = await getGroupUser(userGuid, updateGroupRequest.groupId);

  // permissions check
  isAuthorized(groupUser.role);

  // check group name unique
  const groupByName = await groupsRepository.findFirst({
    id: { not: group.id },
    groupName: {
      equals: updateGroupRequest.groupName,
      mode: 'insensitive',
    },
    createdBy: userId,
  });
  if (groupByName) {
    throw groupNameNotUnique();
  }

  // update group name
  await groupsRepository.update(
    {
      id: group.id,
    },
    { groupName: updateGroupRequest.groupName }
  );
};

const removeGroup = async (
  userGuid: string,
  deleteGroupRequest: IDeleteGroupRequestDto
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  // get/check group
  const group = await getGroup(deleteGroupRequest.groupId);

  // get/check group user
  const groupUser = await getGroupUser(userGuid, deleteGroupRequest.groupId);

  // permissions check
  isAuthorized(groupUser.role);

  // if last admin group can be deleted
  // count group users
  const groupUsersCount = await groupUsersRepository.count({
    groupId: group.id,
  });
  if (groupUsersCount > 1) {
    throw groupWithUsers();
  }

  // check if all devices are deactivated before deleting a group
  const groupDevicesCount = await groupDevicesRepository.count({
    groupId: group.id,
  });
  if (groupDevicesCount) {
    throw groupWithDevices();
  }

  // remove group and group users (soft delete)
  await prisma.$transaction(async (transaction) => {
    const prismaTr = transaction as PrismaClient;

    // update who deleted the group
    await groupsRepository.update(
      { id: group.id },
      {
        deletedBy: userId,
      },
      prismaTr
    );

    // remove group
    await groupsRepository.remove(
      {
        id: group.id,
      },
      prismaTr
    );

    // remove group users
    await groupUsersRepository.removeMany(
      {
        groupId: group.id,
      },
      prismaTr
    );
  });
};

const leaveGroup = async (
  userGuid: string,
  leaveGroupRequest: ILeaveGroupRequestDto
): Promise<void> => {
  // get/check group
  const group = await getGroup(leaveGroupRequest.groupId);

  // get/check group user that requested this action
  const groupUser = await getGroupUser(userGuid, leaveGroupRequest.groupId);
  let groupUserIdToBeRemoved = groupUser.id;
  let adminRemovesHimself = false;

  // case when admin removes group user
  if (leaveGroupRequest.userGuid) {
    // permissions check/only admins can remove user from group
    isAuthorized(groupUser.role);

    // get/check group user that admin wants to remove from group
    if (userGuid === leaveGroupRequest.userGuid) {
      adminRemovesHimself = true;
    } else {
      const groupUserRequest = await getGroupUser(
        leaveGroupRequest.userGuid,
        leaveGroupRequest.groupId
      );
      groupUserIdToBeRemoved = groupUserRequest.id;
    }
  }

  // check for last admin
  if (
    groupUser.role === GroupUserRoles.admin &&
    (!leaveGroupRequest.userGuid || adminRemovesHimself)
  ) {
    // count group users
    const groupUsersCount = await groupUsersRepository.count({
      groupId: group.id,
    });
    if (groupUsersCount > 1) {
      // count group users admins
      const groupUsersAdminCount = await groupUsersRepository.count({
        groupId: group.id,
        role: GroupUserRoles.admin,
      });
      if (groupUsersAdminCount === 1) {
        throw groupUserLastAdmin();
      }
    } else {
      // case when last admin is leaving the group
      // check if all devices are deactivated before auto-deleting the group
      const groupDevicesCount = await groupDevicesRepository.count({
        groupId: group.id,
      });
      if (groupDevicesCount) {
        throw groupUserLastAdminLeaveGroup();
      }
      // auto-delete group
      return removeGroup(userGuid, { groupId: group.id });
    }
  }

  // remove user from group (soft delete)
  await groupUsersRepository.remove({
    id: groupUserIdToBeRemoved,
  });
};

const findGroupDevices = async (
  userGuid: string,
  { groupId, skip, take }: IGetGroupDevicesRequestDto
): Promise<IGetGroupDevicesResponseDto> => {
  // check group
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const groupObj = await getGroup(groupId);

  // check permissions
  const groupUser = await groupUsersRepository.findFirst({
    userId,
    groupId,
  });
  if (!groupUser) {
    throw notAuthorized();
  }

  // retrieve active group devices
  const { count: total, groupDevices } =
    await deviceActivationRepository.findManyActivatedGroupDevices(groupId, {
      skip,
      take,
    });
  const devices: IGetGroupDevicesResponseDto['devices'] = await Promise.all(
    groupDevices.map(async (device) => {
      const newFirmwareVersion =
        await firmwareService.getDeviceNewFirmwareVersion(
          device.deviceId,
          device.deviceFirmware?.firmware?.id
        );
      return {
        deviceSerial: device.deviceInventory.deviceSerial,
        deviceName: device.deviceName,
        timeZoneId: device.timeZoneId,
        activatedOn: getDateWithFormat({
          date: device.activatedOn,
          format: DATE_FORMAT_ISO8601,
        }),
        batteryStatus: getBatteryStatus(device.batteryStatus),
        batteryPercentage: device.batteryStatus,
        wiFiSSID: device.wiFiSSID,
        connectionStatus: getConnectionStatus(device.rssi),
        bleMacAddress: device.deviceInventory.bleMacAddress,
        firmwareVersion: device.deviceFirmware
          ? device.deviceFirmware.firmware.virtualFirmware
          : null,
        newFirmwareVersion: newFirmwareVersion
          ? newFirmwareVersion.firmware.virtualFirmware
          : null,
        isFwUpdateRequired: newFirmwareVersion ? true : false,
      };
    })
  );
  return {
    total,
    groupId: groupObj.id,
    groupName: groupObj.groupName,
    devices: devices,
  } as IGetGroupDevicesResponseDto;
};

const findGroupMembers = async (
  userGuid: string,
  { groupId, skip, take }: IGetGroupMembersRequestDto
): Promise<IGetGroupMembersResponseDto> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  // get/check group
  const group = await getGroup(groupId);

  // get/check group user
  const groupUser = await getGroupUser(userGuid, groupId);
  const isAdmin = groupUser.role === GroupUserRoles.admin; // to determine if we have access to pending members

  // get group members
  const { count: total, groupUsers } =
    await groupUsersRepository.groupMembersFindMany(groupId, isAdmin, {
      skip,
      take,
    });

  return {
    total,
    groupName: group.groupName,
    groupMembers: groupUsers
      .filter((groupMember) => !groupMember.pending)
      .map((groupMember) => ({
        userGuid: groupMember.userGuid,
        memberName: groupMember.firstName,
        memberLastName: groupMember.lastName,
        memberAccess: groupMember.role,
        memberEmail: groupMember.email,
        addedOn: getDateWithFormat({
          date: groupMember.addedOn,
          format: DATE_FORMAT_ISO8601,
        }),
      })),
    pendingGroupMembers: groupUsers
      .filter((groupMemberPending) => groupMemberPending.pending)
      .map((groupMemberPending) => ({
        memberAccess: groupMemberPending.role,
        memberEmail: groupMemberPending.email,
      })),
  };
};

const updateGroupMemberAccess = async (
  userGuid: string,
  updateGroupMemberAccessRequest: IUpdateGroupMemberAccessRequestDto
): Promise<void> => {
  // get/check group
  const group = await getGroup(updateGroupMemberAccessRequest.groupId);

  // get/check group user admin
  const groupUser = await getGroupUser(
    userGuid,
    updateGroupMemberAccessRequest.groupId
  );

  // permissions check
  isAuthorized(groupUser.role);

  // get user from userGuid
  const user = await userService.findOne({
    userGuid: updateGroupMemberAccessRequest.userGuid,
  });

  // check when last admin tries to downgrade himself to member
  if (
    userGuid === user.userGuid &&
    updateGroupMemberAccessRequest.accessLevel === GroupUserRoles.member
  ) {
    // count group users admins
    const groupUsersAdminCount = await groupUsersRepository.count({
      groupId: updateGroupMemberAccessRequest.groupId,
      role: GroupUserRoles.admin,
    });
    if (groupUsersAdminCount === 1) {
      throw groupUserLastAdminDowngrade();
    }
  }

  // get/check group user member
  const groupUserMember = await getGroupUser(
    user.userGuid,
    updateGroupMemberAccessRequest.groupId
  );

  // check if group member access level needs update
  if (groupUserMember.role === updateGroupMemberAccessRequest.accessLevel) {
    return;
  }

  // get group user profile
  const profile = await profileService.findProfileByUserId(user.id);

  // update group member access level
  return prisma.$transaction(async (transaction) => {
    const prismaTr = transaction as PrismaClient;

    await groupUsersRepository.update(
      {
        id: groupUserMember.id,
      },
      {
        role: updateGroupMemberAccessRequest.accessLevel as GroupUserRoles,
      },
      prismaTr
    );
    await inviteService.sendGroupNotificationMessage(
      [
        {
          groupName: group.groupName,
          groupUserRole: updateGroupMemberAccessRequest.accessLevel,
        },
      ],
      'GroupUserPermissionChanged',
      profile.id
    );
  });
};

const getBatteryStatus = (
  batteryPercentage: number
): IDeviceActivationDeviceBatteryStatus => {
  return batteryPercentage <= config.iosNotificationLowBatteryThreshold
    ? IDeviceActivationDeviceBatteryStatus.LOW
    : IDeviceActivationDeviceBatteryStatus.OK;
};

const getConnectionStatus = (
  rssi: number | null
): IDeviceActivationDeviceConnectionStatus => {
  if (!rssi || rssi <= -90) {
    return IDeviceActivationDeviceConnectionStatus.NO_SIGNAL;
  }
  if (rssi <= -70) {
    return IDeviceActivationDeviceConnectionStatus.POOR;
  }
  return IDeviceActivationDeviceConnectionStatus.GOOD;
};

const getGroup = async (groupId: number): Promise<IGroup> => {
  // get/check group
  const group = await groupsRepository.findOne({
    id: groupId,
  });
  if (!group) {
    throw groupNotFound();
  }

  return group;
};

const getGroups = async (groupIds: number[]): Promise<IGroup[]> => {
  // get groups
  const groups = await groupsRepository.findMany({
    id: {
      in: groupIds,
    },
  });
  if (!groups?.length) {
    throw groupNotFound();
  }

  return groups;
};

const getGroupUser = async (
  userGuid: string,
  groupId: number
): Promise<IGroupUser> => {
  // get/check group user
  const user = await userRepository.findFirst({
    userGuid,
  });
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;

  const groupUser = await groupUsersRepository.findFirst({
    userId,
    groupId,
  });

  if (!groupUser) {
    throw groupUserNotFound();
  }

  return groupUser;
};

const isAuthorized = (role: GroupUserRoles) => {
  if (role !== GroupUserRoles.admin) {
    throw groupUserNotAuthorized();
  }
};

export {
  findGroups,
  findGroupsMe,
  findGroupsSummary,
  createGroup,
  updateGroup,
  removeGroup,
  leaveGroup,
  getGroupUser,
  findGroupDevices,
  findGroupMembers,
  updateGroupMemberAccess,
  getGroup,
  getGroups,
  isAuthorized,
  getBatteryStatus,
  getConnectionStatus,
};

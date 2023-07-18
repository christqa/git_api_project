import httpStatus from 'http-status';
import {
  AvailabilityType,
  DeviceStatus,
  GroupUserRoles,
  InvitationType,
  PrismaClient,
  Status,
} from '@prisma/client';
import ApiError from '@core/error-handling/api-error';
import prisma from '@core/prisma/prisma';
import { prismaMock } from '@core/prisma/singleton';
import {
  groupsService,
  profileService,
  userService,
} from '@modules/index/index.service';
import {
  IGroup,
  IGroupExtended,
  IGroupUser,
  IGroupUserExtended,
  IGroupUserExtendedWithDevicesUsersInvitations,
} from './groups.type';
import groupsRepository from '@repositories/groups.repository';
import groupUsersRepository from '@repositories/group-users.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import deviceActivationRepository from '@repositories/device-activation.repository';
import { getDateWithFormat } from '@utils/date.util';
import { IUser } from '@modules/user/user.type';
import inviteRepository from '@repositories/invite.repository';
import { IInvitations } from '@modules/invite/invite.type';
import { IProfile } from '@modules/profile/profile.type';
import * as sqsClient from '../../lib/sqs.client';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const userObject = generateUser({ id: 2 });
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

const groupUserObjectExtended = {
  ...groupUserObject,
  group: groupObject,
} as IGroupUserExtended;
const groupUsersFindManyObject = {
  count: 1,
  groupUsers: [groupUserObjectExtended],
};

const groupUserObjectWithUser = {
  ...groupUserObject,
  user: {
    userGuid: '6789cc39-8868-4b4f-b676-a3609bd53b58',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
  },
} as IGroupUser & { user: IUser };
const groupUsersFindManyWithUserObject = [groupUserObjectWithUser];

const groupObjectExtended = {
  id: 1,
  groupName: 'Home',
  createdOn: new Date(),
  deletedBy: null,
  deleted: null,
  groupUsers: [groupUserObject],
} as IGroupExtended;

const deviceFirmwareObject = {
  id: 1,
  deviceId: 1,
  firmwareId: 1,
  addedOn: new Date(),
  isCurrent: false,
  isNotified: false,
  status: Status.AWAITINGUSERAPPROVAL,
  failureLogs: '',
  updateOn: new Date(),
  approvedOn: new Date(),
  firmware: {
    id: 1,
    virtualFirmware: 'string',
    isCurrent: false,
    addedOn: new Date(),
    releaseDate: new Date(),
    deviceModelId: 1,
    fileName: 'string',
    locationMetaData: {},
    md5CheckSum: 'string',
    availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
  },
};

const deviceActivationObject = {
  id: 1,
  deviceId: 1,
  deviceFirmwareId: 1,
  activatedBy: 0,
  timeZoneId: 1,
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  deviceStatus: {},
  batteryStatus: 0,
  wiFiSSID: '',
  rssi: 0,
  deviceStatusUpdatedOn: new Date(),
  isNotified: false,
  activatedOn: new Date(),
  deactivatedBy: null,
  deleted: null,
  deviceInventory: {
    id: 1,
    deviceSerial: '73b-015-04-2f7',
    manufacturingDate: new Date(),
    manufacturedForRegion: 'North America',
    deviceModelId: 1,
    bleMacAddress: '48-68-28-13-A4-48',
    wiFiMacAddress: '3E-94-C9-43-2D-D7',
    deviceMetadata: {},
    calibrationFileLocations: {},
    deviceStatus: DeviceStatus.IN_SERVICE,
  },
  deviceFirmware: {
    id: 1,
    deviceId: 1,
    firmwareId: 1,
    addedOn: new Date(),
    isCurrent: true,
    isNotified: true,
    status: Status.AWAITINGUSERAPPROVAL, // newly added field in the device firmware table
    failureLogs: '', // newly added field in the device firmware table
    updateOn: new Date(), // newly added field in the device firmware table
    approvedOn: new Date(), // newly added field in the device firmware table
    firmware: {
      id: 1,
      virtualFirmware: '1.0.0',
      isCurrent: true,
      addedOn: new Date(),
      releaseDate: new Date(),
      deviceModelId: 1, // newly added field in the firmware table
      fileName: 'string', // newly added field in the firmware table
      locationMetaData: {}, // newly added field in the firmware table
      md5CheckSum: '', // newly added field in the firmware table
      availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
    },
  },
};

const inviteObject = {
  id: 1,
  invitationId: 'f1b825f4-7fe9-4dd0-b866-f7123a4e9d1a',
  fromUserId: 1,
  toUserId: 2,
  toUserEmail: null,
  sentAt: new Date(),
  expiresAt: new Date(),
  acceptedAt: null,
  rejectedAt: null,
  inviteType: InvitationType.joingroup,
  groupAccessLevel: GroupUserRoles.admin,
  toUser: {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@test.com',
  },
} as IInvitations & { toUser: IUser };

const groupUserObjectExtendedWithDevicesUsersInvitations = {
  ...groupUserObject,
  group: {
    ...groupObject,
    groupDevices: [
      {
        id: 1,
        groupId: 1,
        deviceId: 1,
        addedBy: 1,
        addedOn: new Date(),
        removedBy: null,
        deleted: null,
        deviceInventory: {
          ...deviceActivationObject.deviceInventory,
          deviceActivation: [
            {
              id: 1,
              deviceId: 1,
              deviceFirmwareId: 1,
              timeZoneId: 491,
              deviceName: 'Smart Toilet',
              deviceModelId: 1,
              deviceStatus: {},
              batteryStatus: 0,
              wiFiSSID: null,
              rssi: null,
              deviceStatusUpdatedOn: null,
              activatedOn: new Date(),
              activatedBy: 1,
              deactivatedBy: null,
              deleted: null,
              isNotified: false,
            },
          ],
        },
      },
    ],
    groupUsers: [groupUserObjectWithUser],
    invitations: [inviteObject],
  },
} as IGroupUserExtendedWithDevicesUsersInvitations;
const groupsSummaryFindManyObject = {
  count: 1,
  groupUsers: [groupUserObjectExtendedWithDevicesUsersInvitations],
};

const groupsMembersObject = {
  count: 1,
  groupUsers: [
    {
      addedOn: new Date(),
      role: GroupUserRoles.admin,
      userGuid: '6789cc39-8868-4b4f-b676-a3609bd53b58',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      pending: false,
    },
  ],
};

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest
    .spyOn(PrismaClient.prototype, '$use')
    .mockImplementation(() => undefined);
  prismaMock.$transaction.mockImplementation((cb) => cb(prisma));
  jest
    .spyOn(groupUsersRepository, 'groupUsersFindMany')
    .mockResolvedValue(groupUsersFindManyWithUserObject);
  jest
    .spyOn(groupUsersRepository, 'groupsFindMany')
    .mockResolvedValue(groupUsersFindManyObject);
  jest
    .spyOn(groupUsersRepository, 'groupsSummaryFindMany')
    .mockResolvedValue(groupsSummaryFindManyObject);
  jest
    .spyOn(groupsRepository, 'findMany')
    .mockResolvedValue([groupObjectExtended]);
  jest.spyOn(groupsRepository, 'findOne').mockResolvedValue(groupObject);
  jest.spyOn(groupsRepository, 'findFirst').mockResolvedValue(null);
  jest.spyOn(groupsRepository, 'create').mockResolvedValue(groupObject);
  jest.spyOn(groupsRepository, 'update').mockResolvedValue(groupObject);
  jest.spyOn(groupsRepository, 'remove').mockResolvedValue(groupObject);
  jest
    .spyOn(groupUsersRepository, 'findFirst')
    .mockResolvedValue(groupUserObject);
  jest.spyOn(groupUsersRepository, 'count').mockResolvedValue(2);
  jest.spyOn(groupUsersRepository, 'create').mockResolvedValue(groupUserObject);
  jest.spyOn(groupUsersRepository, 'update').mockResolvedValue(groupUserObject);
  jest.spyOn(groupUsersRepository, 'remove').mockResolvedValue(groupUserObject);
  jest
    .spyOn(groupUsersRepository, 'removeMany')
    .mockResolvedValue({ count: 1 });
  jest
    .spyOn(groupUsersRepository, 'groupsFindManyMe')
    .mockResolvedValue([groupUserObjectExtended]);
  jest
    .spyOn(groupUsersRepository, 'groupMembersFindMany')
    .mockResolvedValue(groupsMembersObject);
  jest.spyOn(groupDevicesRepository, 'count').mockResolvedValue(0);
  jest
    .spyOn(deviceActivationRepository, 'findManyActivatedGroupDevices')
    .mockResolvedValue({
      count: 1,
      groupDevices: [deviceActivationObject],
    });
  jest.spyOn(inviteRepository, 'findMany').mockResolvedValue([inviteObject]);
  jest.spyOn(userService, 'findOne').mockResolvedValue({ id: 2 } as IUser);
  jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(sqsClient, 'publishMessageSQS').mockResolvedValue({
    $metadata: 1,
    MessageId: '1',
  } as SendMessageCommandOutput);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Groups', () => {
  test('should test findGroups function', async () => {
    const groups = await groupsService.findGroups(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      { skip: 0, take: 10 }
    );
    expect(userService.findByUserGuid).toBeCalled();
    expect(groups.total).toBe(1);
  });

  test('should test findGroupsMe function', async () => {
    await groupsService.findGroupsMe(1);
    expect(groupUsersRepository.groupsFindManyMe).toBeCalled();
  });

  test('should test findGroupsSummary function', async () => {
    const groups = await groupsService.findGroupsSummary(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      { skip: 0, take: 10 }
    );
    expect(groups.total).toBe(1);
    expect(userService.findByUserGuid).toBeCalled();
    expect(groupUsersRepository.groupsSummaryFindMany).toBeCalled();
  });

  test('should test createGroup function', async () => {
    const group = await groupsService.createGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      { groupName: 'Home' }
    );
    expect(group.groupId).toBe(groupObject.id);
    expect(userService.findByUserGuid).toBeCalled();
    expect(groupsRepository.findFirst).toBeCalled();
    expect(groupUsersRepository.create).toBeCalled();
  });

  test('should test createGroup function (group name not unique)', async () => {
    jest.spyOn(groupsRepository, 'findFirst').mockResolvedValue(groupObject);

    try {
      await groupsService.createGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupName: 'Home',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'groups_this_group_name_already_exists'
      );
    }
  });

  test('should test updateGroup function', async () => {
    const group = await groupsService.updateGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        groupName: 'Home',
      }
    );
    expect(group).toBe(undefined);
  });

  test('should test updateGroup function (group not found)', async () => {
    jest.spyOn(groupsRepository, 'findOne').mockResolvedValue(null);

    try {
      await groupsService.updateGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        groupName: 'Home',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('groups_group_not_found');
    }
  });

  test('should test updateGroup function (group user not found)', async () => {
    jest.spyOn(groupUsersRepository, 'findFirst').mockResolvedValue(null);

    try {
      await groupsService.updateGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        groupName: 'Home',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('groups_group_user_not_found');
    }
  });

  test('should test updateGroup function (no permission)', async () => {
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue({ ...groupUserObject, role: GroupUserRoles.member });

    try {
      await groupsService.updateGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        groupName: 'Home',
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

  test('should test updateGroup function (group name not unique)', async () => {
    jest.spyOn(groupsRepository, 'findFirst').mockResolvedValue(groupObject);

    try {
      await groupsService.updateGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        groupName: 'Home',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'groups_this_group_name_already_exists'
      );
    }
  });

  test('should test removeGroup function', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValue(1);

    const group = await groupsService.removeGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
      }
    );
    expect(group).toBe(undefined);
  });

  test('should test removeGroup function (group with users)', async () => {
    try {
      await groupsService.removeGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_group_cannot_be_deleted_first_remove_all_group_users'
      );
    }
  });

  test('should test removeGroup function (group with devices)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValue(1);
    jest.spyOn(groupDevicesRepository, 'count').mockResolvedValue(1);

    try {
      await groupsService.removeGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_deactivate_all_devices_linked_to_this_group_before_deleting_it'
      );
    }
  });

  test('should test leaveGroup function', async () => {
    const group = await groupsService.leaveGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
      }
    );
    expect(group).toBe(undefined);
  });

  test('should test leaveGroup function (last admin)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(2);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);

    try {
      await groupsService.leaveGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_you_are_the_last_admin_assign_another_user_as_admin_before_leaving_the_group'
      );
    }
  });

  test('should test leaveGroup function (last admin auto-delete fail)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupDevicesRepository, 'count').mockResolvedValue(1);

    try {
      await groupsService.leaveGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_deactivate_all_devices_linked_to_this_group_group_will_be_auto_deleted'
      );
    }
  });

  test('should test leaveGroup function (last admin auto-delete)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);

    const group = await groupsService.leaveGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
      }
    );
    expect(group).toBe(undefined);
  });

  test('should test leaveGroup function (remove user)', async () => {
    const group = await groupsService.leaveGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        userGuid: groupUserObjectWithUser.user.userGuid,
      }
    );
    expect(group).toBe(undefined);
  });

  test('should test leaveGroup function (remove user without permissions)', async () => {
    jest
      .spyOn(groupUsersRepository, 'findFirst')
      .mockResolvedValue({ ...groupUserObject, role: GroupUserRoles.member });

    try {
      await groupsService.leaveGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        userGuid: groupUserObjectWithUser.user.userGuid,
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

  test('should test leaveGroup function (last admin) (self remove)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(2);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);

    try {
      await groupsService.leaveGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        userGuid: groupUserObjectWithUser.user.userGuid,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_you_are_the_last_admin_assign_another_user_as_admin_before_leaving_the_group'
      );
    }
  });

  test('should test leaveGroup function (last admin auto-delete fail) (self remove)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupDevicesRepository, 'count').mockResolvedValue(1);

    try {
      await groupsService.leaveGroup('397322cd-6405-464f-8fc6-4dc28971ef2f', {
        groupId: 1,
        userGuid: groupUserObjectWithUser.user.userGuid,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_deactivate_all_devices_linked_to_this_group_group_will_be_auto_deleted'
      );
    }
  });

  test('should test leaveGroup function (last admin auto-delete) (self remove)', async () => {
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);
    jest.spyOn(groupUsersRepository, 'count').mockResolvedValueOnce(1);

    const group = await groupsService.leaveGroup(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        userGuid: groupUserObjectWithUser.user.userGuid,
      }
    );
    expect(group).toEqual(undefined);
  });

  test('should test findGroupDevices function', async () => {
    const groupDevices = await groupsService.findGroupDevices(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        skip: 0,
        take: 10,
      }
    );
    expect(groupDevices).toEqual({
      devices: [
        {
          activatedOn: getDateWithFormat({
            date: deviceActivationObject.activatedOn,
            format: DATE_FORMAT_ISO8601,
          }),
          batteryPercentage: 0,
          batteryStatus: 'Low',
          wiFiSSID: '',
          connectionStatus: 'No signal',
          bleMacAddress: '48-68-28-13-A4-48',
          deviceName: 'Smart Toilet',
          deviceSerial: '73b-015-04-2f7',
          timeZoneId: 1,
          firmwareVersion: '1.0.0',
          newFirmwareVersion: null,
          isFwUpdateRequired: false,
        },
      ],
      groupId: 1,
      groupName: 'Home',
      total: 1,
    });
  });

  test('should test findGroupDevices function with poor connection status', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findManyActivatedGroupDevices')
      .mockResolvedValue({
        count: 1,
        groupDevices: [{ ...deviceActivationObject, rssi: -70 }],
      });
    jest
      .spyOn(deviceFirmwareRepository, 'findFirst')
      .mockResolvedValue(deviceFirmwareObject);
    await groupsService.findGroupDevices(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        skip: 0,
        take: 10,
      }
    );
    expect(userService.findByUserGuid).toBeCalled();
    expect(groupUsersRepository.findFirst).toBeCalled();
    expect(
      deviceActivationRepository.findManyActivatedGroupDevices
    ).toBeCalled();
    expect(deviceFirmwareRepository.findFirst).toBeCalled();
  });

  test('should test findGroupDevices function with good connection status', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findManyActivatedGroupDevices')
      .mockResolvedValue({
        count: 1,
        groupDevices: [{ ...deviceActivationObject, rssi: -68 }],
      });
    jest
      .spyOn(deviceFirmwareRepository, 'findFirst')
      .mockResolvedValue(deviceFirmwareObject);
    await groupsService.findGroupDevices(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        groupId: 1,
        skip: 0,
        take: 10,
      }
    );
    expect(userService.findByUserGuid).toBeCalled();
    expect(groupUsersRepository.findFirst).toBeCalled();
    expect(
      deviceActivationRepository.findManyActivatedGroupDevices
    ).toBeCalled();
    expect(deviceFirmwareRepository.findFirst).toBeCalled();
  });
  test('should test findGroupDevices function (unauthorized)', async () => {
    jest.spyOn(groupUsersRepository, 'findFirst').mockResolvedValue(null);

    try {
      await groupsService.findGroupDevices(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          groupId: 1,
          skip: 0,
          take: 10,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_you_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test findGroupMembers function', async () => {
    await groupsService.findGroupMembers(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      { groupId: 1, skip: 0, take: 10 }
    );
    expect(groupsRepository.findOne).toBeCalled();
    expect(userRepository.findFirst).toBeCalled();
    expect(groupUsersRepository.findFirst).toBeCalled();
    expect(groupUsersRepository.groupMembersFindMany).toBeCalled();
  });

  test('should test updateGroupMemberAccess function', async () => {
    const updateGroupMemberAccess = await groupsService.updateGroupMemberAccess(
      '1',
      {
        groupId: 1,
        userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
        accessLevel: 'admin',
      }
    );
    expect(updateGroupMemberAccess).toBe(undefined);
  });

  test('should test updateGroupMemberAccess function (downgrade when last admin)', async () => {
    jest.spyOn(userService, 'findOne').mockResolvedValue({ id: 1 } as IUser);

    try {
      await groupsService.updateGroupMemberAccess(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          groupId: 1,
          userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
          accessLevel: 'member',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'groups_you_are_the_last_admin_assign_another_user_as_admin_before_downgrading_yourself'
      );
    }
  });
});

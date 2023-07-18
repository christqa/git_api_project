import { IInvitations } from '@modules/invite/invite.type';
import { IUser } from '@modules/user/user.type';
import {
  DeviceActivation,
  DeviceInventory,
  GroupDevices,
  Groups,
  GroupUserRoles,
  GroupUsers,
  Prisma,
} from '@prisma/client';

export type IGroup = Groups;

export type IGroupExtended = Groups & { groupUsers: GroupUsers[] };

export type IGroupsUniqueInput = Prisma.GroupsWhereUniqueInput;

export type IGroupsWhereInput = Prisma.GroupsWhereInput;

export type IGroupsCreateInput = Prisma.GroupsUncheckedCreateInput;

export type IGroupsUpdateInput = Prisma.GroupsUncheckedUpdateInput;

export type IGroupUser = GroupUsers;

export type IGroupUserExtended = GroupUsers & { group: Groups };

export type IGroupMembers = {
  addedOn: Date;
  role: GroupUserRoles;
  userGuid: string;
  firstName: string;
  lastName: string;
  email: string;
  pending: boolean;
};

type IGroupDeviceInventoryAndActivation = GroupDevices & {
  deviceInventory: DeviceInventory & { deviceActivation: DeviceActivation[] };
};

export type IGroupUserExtendedWithDevicesUsersInvitations = GroupUsers & {
  group: Groups & {
    groupDevices: IGroupDeviceInventoryAndActivation[];
    groupUsers: (IGroupUser & { user: IUser })[];
    invitations: (IInvitations & { toUser: IUser | null })[];
  };
};

export type IGroupUsersUniqueInput = Prisma.GroupUsersWhereUniqueInput;

export type IGroupUsersWhereInput = Prisma.GroupUsersWhereInput;

export type IGroupUsersCreateInput = Prisma.GroupUsersUncheckedCreateInput;

export type IGroupUsersUpdateInput = Prisma.GroupUsersUpdateInput;

export type IGroupUsersBatchPayload = Prisma.BatchPayload;

export type IGroupDevice = GroupDevices;

export type IGroupDeviceExtended = GroupDevices & {
  deviceInventory?: DeviceInventory & { deviceActivation: DeviceActivation[] };
};

export type IGroupDevicesWhereInput = Prisma.GroupDevicesWhereInput;

export type IGroupDevicesCreateInput = Prisma.GroupDevicesUncheckedCreateInput;

export type IGroupDevicesUpdateInput = Prisma.GroupDevicesUncheckedUpdateInput;

export type IGroupDevicesBatchPayload = Prisma.BatchPayload;

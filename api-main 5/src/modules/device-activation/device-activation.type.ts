import {
  Account,
  DeviceActivation,
  DeviceInventory,
  Prisma,
  Profile,
} from '@prisma/client';
import { IDevicesInventory } from '@modules/device-inventory/device-inventory.type';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';

export type IDeviceActivation = DeviceActivation;
export type IDeviceActivationExtended = DeviceActivation & {
  deviceInventory: IDevicesInventory;
  deviceFirmware: (IDeviceFirmware & { firmware: IFirmware }) | null;
};
export type IDeviceActivationCreateInput =
  Prisma.DeviceActivationUncheckedCreateInput;
export type IDeviceActivationUpdateInput =
  Prisma.DeviceActivationUncheckedUpdateInput;
export type IDeviceActivationUniqueInput =
  Prisma.DeviceActivationWhereUniqueInput;
export type IDeviceActivationWhereInput = Prisma.DeviceActivationWhereInput;

export type IDeviceActivationWithGroupAdmins = Pick<
  DeviceActivation,
  'id' | 'deviceName' | 'deviceStatusUpdatedOn'
> & {
  deviceInventory: Pick<DeviceInventory, 'deviceSerial'> & {
    groupDevices: IGroupDevice[];
  };
};

export type IGroupDevice = {
  group: {
    groupUsers: IGroupUser[];
  };
};
export type IGroupUser = {
  user:
    | Pick<Account, 'userGuid' | 'email' | 'firstName' | 'lastName'>
    | Pick<Profile, 'id'>;
};

export enum IDeviceActivationStatusTypes {
  INVALID_DEVICE = 'invalid_device',
  AVAILABLE = 'available',
  ALREADY_IN_USED = 'already_in_use',
  NOT_ACTIVATED = 'not_activated',
}

export enum IDeviceActivationDeviceBatteryStatus {
  LOW = 'Low',
  OK = 'OK',
}

export enum IDeviceActivationDeviceConnectionStatus {
  GOOD = 'Good',
  POOR = 'Poor',
  NO_SIGNAL = 'No signal',
}

export enum IDeviceActivationFindAllDevicesSortBy {
  deviceId = 'deviceId',
  deviceName = 'deviceName',
  deviceSerial = 'deviceSerial',
  activatedOn = 'activatedOn',
  manufacturingDate = 'manufacturingDate',
  activatedBy = 'activatedBy',
  lastEventDate = 'lastEventDate',
}

export type IDeviceActivationDeviceIdSerial = {
  deviceId: number;
  deviceInventory: { deviceSerial: string };
};

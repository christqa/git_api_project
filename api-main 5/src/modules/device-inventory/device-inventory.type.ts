import {
  DeviceActivation,
  DeviceInventory,
  Prisma,
  TimeZone,
} from '@prisma/client';

export type IDevicesInventory = DeviceInventory;
export type IDevicesInventoryCreateInput =
  Prisma.DeviceInventoryUncheckedCreateInput;
export type IDevicesInventoryUniqueInput =
  Prisma.DeviceInventoryWhereUniqueInput;
export type IDevicesInventoryWhereInput = Prisma.DeviceInventoryWhereInput;
export type IDeviceInventoryUpdateInput = Prisma.DeviceInventoryUpdateInput;

export type IDeviceInventoryAndProfileId = {
  deviceSerial: string;
  userDevices?: {
    user: {
      id: number;
      userGuid: string;
      email: string;
      profile: {
        id: number;
      } | null;
    };
  }[];
};

export type IDeviceInventoryAndFirmware = {
  devcieSerial: string;
  timeZoneId: number;
  deviceName: string;
  deviceModelId: number;
  deviceStatus: Prisma.JsonValue;
  batteryStatus: number;
  wiFiSSID: string | null;
  rssi: number | null;
  deviceStatusUpdatedOn: Date | null;
  activatedOn: Date;
  activatedBy: number;
  isNotified: boolean;
  firmwareVersion: string | null;
};

export type IDeviceInventoryAndCount = {
  devices: IDeviceInventoryAndFirmware[];
  total: number;
};

export type IDeviceInventoryUserActiveDevice = {
  deviceSerial: string;
  deviceActivation: (DeviceActivation & { timeZone?: TimeZone })[];
};

export type IDeviceInventoryId = {
  id: number;
};

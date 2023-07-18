import { Prisma } from '@prisma/client';

export type IDeviceSettings = {
  id: number;
  deviceId: number;
  deviceSettingName: string;
  deviceSettingType: string;
  deviceSettingValue: string | number | Prisma.JsonObject;
  addedOn: Date;
  updatedOn: Date;
  removedBy?: number | null;
  deleted?: Date | null;
};
export type IDeviceSettingsBatchCount = Prisma.BatchPayload;

export type IDeviceSettingsWhereInput = Prisma.DeviceSettingsWhereInput;

export type IDeviceSettingsWhereUniqueInput =
  Prisma.DeviceSettingsWhereUniqueInput;

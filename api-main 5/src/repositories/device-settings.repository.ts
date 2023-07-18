import prisma from '@core/prisma/prisma';
import { DeviceSettings, PrismaClient } from '@prisma/client';
import {
  IDeviceSettings,
  IDeviceSettingsBatchCount,
  IDeviceSettingsWhereInput,
  IDeviceSettingsWhereUniqueInput,
} from '@modules/device-settings/device-settings.type';
import deviceSettingsGlobalSettingsRepositoryCommon from '@repositories/device-settings-global-settings.repository.common';

const { deviceSettings } = prisma;

const create = async (data: IDeviceSettings): Promise<IDeviceSettings> => {
  data.deviceSettingValue =
    deviceSettingsGlobalSettingsRepositoryCommon.createUpdateStub(
      data.deviceSettingValue
    );
  return deviceSettings.create({
    data: data as DeviceSettings,
  });
};

const createMany = async (
  dataArray: IDeviceSettings[],
  prismaTr?: PrismaClient
): Promise<IDeviceSettingsBatchCount> => {
  for (const data of dataArray) {
    data.deviceSettingValue =
      deviceSettingsGlobalSettingsRepositoryCommon.createUpdateStub(
        data.deviceSettingValue
      );
  }

  return (prismaTr || prisma).deviceSettings.createMany({
    data: dataArray as DeviceSettings[],
  });
};

const findManyByDeviceId = async (
  deviceId: number
): Promise<IDeviceSettings[] | null> => {
  const deviceSettingsRes: IDeviceSettings[] = await deviceSettings.findMany({
    where: {
      deviceId,
    },
  });
  if (!deviceSettingsRes) {
    return deviceSettingsRes;
  }
  const updatedSettings: IDeviceSettings[] = deviceSettingsRes.map((value) => {
    value.deviceSettingValue =
      deviceSettingsGlobalSettingsRepositoryCommon.findStub(
        value.deviceSettingValue
      );
    return value;
  });
  return updatedSettings;
};

const findManyByDeviceIdDeviceSettingName = async (
  deviceId: number,
  deviceSettingNames: string[],
  prismaTr?: PrismaClient
): Promise<IDeviceSettings[] | null> => {
  const deviceSettingsRes: IDeviceSettings[] = await (
    prismaTr || prisma
  ).deviceSettings.findMany({
    where: {
      deviceId: deviceId,
      deviceSettingName: { in: deviceSettingNames },
    },
  });
  if (!deviceSettingsRes) {
    return deviceSettingsRes;
  }
  const updatedSettings: IDeviceSettings[] = deviceSettingsRes.map((value) => {
    value.deviceSettingValue =
      deviceSettingsGlobalSettingsRepositoryCommon.findStub(
        value.deviceSettingValue
      );
    return value;
  });
  return updatedSettings;
};

const findFirst = async (
  where: IDeviceSettingsWhereInput
): Promise<IDeviceSettings | null> => {
  const settings: DeviceSettings | null | undefined =
    await deviceSettings.findFirst({
      where,
    });
  if (!settings) {
    return settings;
  }
  settings.deviceSettingValue =
    deviceSettingsGlobalSettingsRepositoryCommon.findStub(
      settings.deviceSettingValue
    );
  return settings;
};

const update = (
  where: IDeviceSettingsWhereUniqueInput,
  data: IDeviceSettings
): Promise<IDeviceSettings> => {
  data.deviceSettingValue =
    deviceSettingsGlobalSettingsRepositoryCommon.createUpdateStub(
      data.deviceSettingValue
    );

  return deviceSettings.update({
    where,
    data: data as DeviceSettings,
  });
};

const updateMany = (
  where: IDeviceSettingsWhereInput,
  data: IDeviceSettings,
  prismaTr?: PrismaClient
): Promise<IDeviceSettingsBatchCount> => {
  data.deviceSettingValue =
    deviceSettingsGlobalSettingsRepositoryCommon.createUpdateStub(
      data.deviceSettingValue
    );

  return (prismaTr || prisma).deviceSettings.updateMany({
    where,
    data: data as DeviceSettings,
  });
};

const removeManySoftDelete = (
  where: IDeviceSettingsWhereInput,
  prismaTr?: PrismaClient
): Promise<IDeviceSettingsBatchCount> => {
  return (prismaTr || prisma).deviceSettings.deleteMany({
    where,
  });
};

export default {
  create,
  createMany,
  findManyByDeviceId,
  findManyByDeviceIdDeviceSettingName,
  findFirst,
  update,
  updateMany,
  removeManySoftDelete,
};

import {
  IGlobalSettings,
  IGlobalSettingsWhere,
  IGlobalSettingsWhereUniqueInput,
} from '@modules/global-settings/global-settings.type';
import prisma from '@core/prisma/prisma';
import { GlobalSettings } from '@prisma/client';
import deviceSettingsGlobalSettingsRepositoryCommon from '@repositories/device-settings-global-settings.repository.common';

const { globalSettings } = prisma;

const findAll = async (): Promise<IGlobalSettings[]> => {
  const settingsRes: IGlobalSettings[] = await globalSettings.findMany();
  if (!settingsRes) {
    return settingsRes;
  }
  const updatedSettings: IGlobalSettings[] = settingsRes.map((value) => {
    value.settingValue = deviceSettingsGlobalSettingsRepositoryCommon.findStub(
      value.settingValue
    );
    return value;
  });
  return updatedSettings;
};
const findFirst = async (
  where: IGlobalSettingsWhere
): Promise<IGlobalSettings | null> => {
  const settings: IGlobalSettings | null | undefined =
    await globalSettings.findFirst({
      where,
    });
  if (!settings) {
    return settings;
  }
  settings.settingValue = deviceSettingsGlobalSettingsRepositoryCommon.findStub(
    settings.settingValue
  );
  return settings;
};

const update = async (
  where: IGlobalSettingsWhereUniqueInput,
  data: IGlobalSettings
): Promise<IGlobalSettings> => {
  data.settingValue =
    deviceSettingsGlobalSettingsRepositoryCommon.createUpdateStub(
      data.settingValue
    );
  return globalSettings.update({
    where,
    data: data as GlobalSettings,
  });
};

export default {
  findAll,
  findFirst,
  update,
};

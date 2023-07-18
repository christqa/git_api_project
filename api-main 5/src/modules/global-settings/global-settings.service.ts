import globalSettingsRepository from '@repositories/global-settings.repository';
import { IGlobalSettings } from '@modules/global-settings/global-settings.type';
import { IUpdateGlobalSettingRequestDto } from './dtos/update-global-settings.dto';
import {
  noGlobalSetting,
  noGlobalSettings,
  globalSettingNotFound,
} from './global-settings.error';

const getAllGlobalSettings = async (): Promise<IGlobalSettings[]> => {
  const globalSettings = await globalSettingsRepository.findAll();
  if (!globalSettings.length) {
    throw noGlobalSettings();
  }
  return globalSettings;
};
const getGlobalSetting = async (
  settingName: string
): Promise<IGlobalSettings> => {
  const globalSetting = await globalSettingsRepository.findFirst({
    settingName,
  });
  if (!globalSetting) {
    throw noGlobalSetting();
  }
  return globalSetting;
};

const updateGlobalSetting = async (
  globalSettingId: number,
  updateGlobalSettingRequestDto: IUpdateGlobalSettingRequestDto
): Promise<void> => {
  const foundGlobalSetting = await globalSettingsRepository.findFirst({
    id: globalSettingId,
  });

  if (!foundGlobalSetting) {
    throw globalSettingNotFound();
  }

  await globalSettingsRepository.update({ id: globalSettingId }, {
    settingName: updateGlobalSettingRequestDto.settingName,
    settingType: updateGlobalSettingRequestDto.settingType,
    settingValue: updateGlobalSettingRequestDto.settingValue,
  } as IGlobalSettings);
};

export { getAllGlobalSettings, getGlobalSetting, updateGlobalSetting };

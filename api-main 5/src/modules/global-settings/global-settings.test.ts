import {
  getAllGlobalSettings,
  getGlobalSetting,
  updateGlobalSetting,
} from './global-settings.service';
import { IUpdateGlobalSettingRequestDto } from './dtos/update-global-settings.dto';
import globalSettingsRepository from '@repositories/global-settings.repository';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';

const globalSettingsData1 = {
  id: 1,
  settingName: 'shootingRegime',
  settingType: 'DeviceSetting',
  settingValue:
    '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const globalSettingsData2 = {
  id: 2,
  settingName: 'DeviceStatusInterval',
  settingType: 'DeviceSetting',
  settingValue: '12h',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const globalSettingsData3 = {
  id: 3,
  settingName: 'DeviceSleepInterval',
  settingType: 'DeviceSetting',
  settingValue: '60s',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const globalSettingsData4 = {
  id: 4,
  settingName: 'LowPower',
  settingType: 'DeviceSetting',
  settingValue: '20',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const globalSettingsDataAll = [
  globalSettingsData1,
  globalSettingsData2,
  globalSettingsData3,
  globalSettingsData4,
];

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Global Settings', () => {
  test('should test getAllGlobalSettings function', async () => {
    jest
      .spyOn(globalSettingsRepository, 'findAll')
      .mockResolvedValue(globalSettingsDataAll);
    await getAllGlobalSettings();
    expect(globalSettingsRepository.findAll).toBeCalled();
  });

  test('should test getAllGlobalSettings function with error', async () => {
    jest.spyOn(globalSettingsRepository, 'findAll').mockResolvedValue([]);
    try {
      await getAllGlobalSettings();
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('global_settings_settings_not_found');
    }
  });

  test('should test getGlobalSetting function', async () => {
    jest
      .spyOn(globalSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(globalSettingsData1);
    await getGlobalSetting('shootingRegime');
    expect(globalSettingsRepository.findFirst).toBeCalled();
  });

  test('should test getGlobalSetting function (404)', async () => {
    jest
      .spyOn(globalSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(null);
    try {
      await getGlobalSetting('notExistedSettingName');
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('global_setting_not_found');
    }
  });

  test('should test updateGlobalSetting function', async () => {
    jest
      .spyOn(globalSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(globalSettingsData1);
    const updateGlobalSettingRequestDto = {
      settingName: 'updatedSettingName',
      settingType: 'updatedSettingType',
      settingValue: 'updatedSettingValue',
    } as IUpdateGlobalSettingRequestDto;
    await updateGlobalSetting(1, updateGlobalSettingRequestDto);
  });

  test('should test updateGlobalSetting function (404)', async () => {
    jest
      .spyOn(globalSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(null);
    try {
      const updateGlobalSettingRequestDto = {
        settingName: 'updatedSettingName',
        settingType: 'updatedSettingType',
        settingValue: 'updatedSettingValue',
      } as IUpdateGlobalSettingRequestDto;
      await updateGlobalSetting(1, updateGlobalSettingRequestDto);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('global_setting_find_by_id_not_found');
    }
  });
});

import {
  create,
  findDeviceSettingByIdAndName,
  getDeviceSettingsByDeviceSerial,
  updateDeviceSetting,
} from '@modules/device-settings/device-settings.service';
import {
  ICreateDeviceSettingsRequestDto,
  ICreateManyDeviceSettingsRequestDto,
} from './dtos/create-device-settings.dto';
import { IUpdateDeviceSettingRequestDto } from './dtos/update-device-settings.dto';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import deviceSettingsRepository from '@repositories/device-settings.repository';
import { deviceSettingsService } from '@modules/index/index.service';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import { DeviceStatus } from '@prisma/client';

const deviceInventoryObject = {
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
};

const deviceSettingsObject = {
  id: 1,
  deviceId: 1,
  deviceSettingName: 'DeviceStatusInterval',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '12h',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsData1 = {
  id: 1,
  deviceId: 1,
  deviceSettingName: 'shootingRegime',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue:
    '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous/once", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsData2 = {
  id: 2,
  deviceId: 1,
  deviceSettingName: 'DeviceStatusInterval',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '12h',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsData3 = {
  id: 3,
  deviceId: 1,
  deviceSettingName: 'DeviceSleepInterval',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '60s',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsData4 = {
  id: 4,
  deviceId: 1,
  deviceSettingName: 'LowPower',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '20',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsList = [
  deviceSettingsData1,
  deviceSettingsData2,
  deviceSettingsData3,
  deviceSettingsData4,
];

const deviceSettingsRequestData1 = {
  deviceSettingName: 'shootingRegime',
  deviceSettingType: 'DeviceSetting',
  DeviceSettingValue:
    '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous/once", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}',
};

const deviceSettingsRequestData2 = {
  deviceSettingName: 'DeviceStatusInterval',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '12h',
};

const deviceSettingsRequestData3 = {
  deviceSettingName: 'DeepSleepInterval',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '60s',
};

const deviceSettingsRequestData4 = {
  deviceSettingName: 'LowPower',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '20',
};

const deviceSettingsRequestDataAll = [
  deviceSettingsRequestData1,
  deviceSettingsRequestData2,
  deviceSettingsRequestData3,
  deviceSettingsRequestData4,
];

beforeEach(() => {
  jest
    .spyOn(deviceInventoryRepository, 'findFirst')
    .mockResolvedValue(deviceInventoryObject);
  jest
    .spyOn(deviceSettingsRepository, 'create')
    .mockResolvedValue(deviceSettingsObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('device settings', () => {
  test('should test create device settings', async () => {
    const createDeviceSettingsRequestDto = {
      deviceSerial: '73b-015-04-2f7',
      deviceSettingName: 'DeviceStatusInterval',
      deviceSettingType: 'DeviceSetting',
      deviceSettingValue: '12h',
    } as ICreateDeviceSettingsRequestDto;
    await create(createDeviceSettingsRequestDto);
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
    expect(deviceSettingsRepository.create).toHaveBeenCalled();
  });

  test('should test create default settings', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'createMany')
      .mockResolvedValueOnce({ count: 4 });
    const createManyDeviceSettingsRequestDto = {
      deviceSerial: '73b-015-04-2f7',
      deviceSettings: deviceSettingsRequestDataAll,
    } as ICreateManyDeviceSettingsRequestDto;
    const deviceSettingsBatchPayload = await deviceSettingsService.createMany(
      createManyDeviceSettingsRequestDto
    );
    expect(deviceSettingsBatchPayload.count).toBe(4);
  });

  test('should test create default settings and error with PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'createMany')
      .mockImplementation(() => {
        throw new Error(`Prisma error with code P2002`);
      });
    try {
      const createManyDeviceSettingsRequestDto = {
        deviceSerial: '73b-015-04-2f7',
        deviceSettings: deviceSettingsRequestDataAll,
      } as ICreateManyDeviceSettingsRequestDto;
      const deviceSettingsBatchPayload = await deviceSettingsService.createMany(
        createManyDeviceSettingsRequestDto
      );
      expect(deviceSettingsBatchPayload.count).toBe(4);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
      expect(error?.localised.key).toBe('device_settings_cannot_be_created');
    }
  });

  test('should test getDeviceSettingsByDeviceSerial function', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'findManyByDeviceId')
      .mockResolvedValueOnce(deviceSettingsList);
    await getDeviceSettingsByDeviceSerial('73b-015-04-2f7');
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
    expect(deviceSettingsRepository.findManyByDeviceId).toHaveBeenCalled();
  });

  test('should test getDeviceSettingsByDeviceSerial function (device not found)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValueOnce(null);
    try {
      await getDeviceSettingsByDeviceSerial('73b-015-04-2f7');
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test updateDeviceSetting function', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(deviceSettingsData1);
    const updateDeviceSettingRequestDto = {
      deviceSettingName: 'updatedDeviceSettingName',
      deviceSettingType: 'updatedDeviceSettingType',
      deviceSettingValue: 'updatedDeviceSettingValue',
    } as IUpdateDeviceSettingRequestDto;
    await updateDeviceSetting(1, updateDeviceSettingRequestDto);
  });

  test('should test updateDeviceSetting function (404)', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValueOnce(null);
    try {
      const updateDeviceSettingRequestDto = {
        deviceSettingName: 'updatedDeviceSettingName',
        deviceSettingType: 'updatedDeviceSettingType',
        deviceSettingValue: 'updatedDeviceSettingValue',
      } as IUpdateDeviceSettingRequestDto;
      await updateDeviceSetting(1, updateDeviceSettingRequestDto);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_setting_not_found');
    }
  });

  test('should test findDeviceSettingByIdAndName function', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsData1);
    await findDeviceSettingByIdAndName(
      deviceSettingsData1.deviceId,
      deviceSettingsData1.deviceSettingName
    );
    expect(deviceSettingsRepository.findFirst).toHaveBeenCalled();
  });

  test('should test findDeviceSettingByIdAndName function (device not found)', async () => {
    jest.spyOn(deviceSettingsRepository, 'findFirst').mockResolvedValue(null);
    try {
      await findDeviceSettingByIdAndName(1, 'LowPower');
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_setting_not_found');
    }
  });
});

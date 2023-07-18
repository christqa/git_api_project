import { Prisma } from '@prisma/client';
import deviceSettingsRepository from '@repositories/device-settings.repository';
import { deviceInventoryService } from '@modules/index/index.service';
import { IDeviceSettings } from './device-settings.type';
import { IGetDeviceSettingsByDeviceSerialResponseDto } from './dtos/internal.dto';
import {
  ICreateDeviceSettingsRequestDto,
  ICreateManyDeviceSettingsRequestDto,
} from './dtos/create-device-settings.dto';
import { IUpdateDeviceSettingRequestDto } from './dtos/update-device-settings.dto';
import {
  deviceSettingNotFound,
  deviceWithDeviceSettingName,
  createDeviceSettingDataError,
} from './device-settings.error';
import { PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT } from '@core/error-handling/error.middleware';

const create = async (request: ICreateDeviceSettingsRequestDto) => {
  const device = await deviceInventoryService.getDevice(request.deviceSerial);

  const data = {
    deviceId: device.id,
    deviceSettingName: request.deviceSettingName,
    deviceSettingType: request.deviceSettingType,
    deviceSettingValue: request.deviceSettingValue,
  } as IDeviceSettings;
  return await deviceSettingsRepository.create(data);
};

const createMany = async (request: ICreateManyDeviceSettingsRequestDto) => {
  const device = await deviceInventoryService.getDevice(request.deviceSerial);
  const data = request.deviceSettings.map((deviceSetting) => {
    return {
      deviceId: device.id,
      deviceSettingName: deviceSetting.deviceSettingName,
      deviceSettingType: deviceSetting.deviceSettingType,
      deviceSettingValue: deviceSetting.deviceSettingValue,
    } as IDeviceSettings;
  });
  try {
    return await deviceSettingsRepository.createMany(data);
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT
    ) {
      throw deviceWithDeviceSettingName();
    }
    throw createDeviceSettingDataError();
  }
};

// Get a list of device settings of the device
const getDeviceSettingsByDeviceSerial = async (
  deviceSerial: string
): Promise<IGetDeviceSettingsByDeviceSerialResponseDto[]> => {
  const device = await deviceInventoryService.getDevice(deviceSerial);
  const deviceSettings = await deviceSettingsRepository.findManyByDeviceId(
    device.id
  );
  return deviceSettings as IGetDeviceSettingsByDeviceSerialResponseDto[];
};

const updateDeviceSetting = async (
  deviceSettingId: number,
  updateDeviceSettingRequestDto: IUpdateDeviceSettingRequestDto
): Promise<void> => {
  const foundDeviceSetting = await deviceSettingsRepository.findFirst({
    id: deviceSettingId,
  });

  if (!foundDeviceSetting) {
    throw deviceSettingNotFound();
  }

  await deviceSettingsRepository.update({ id: deviceSettingId }, {
    deviceSettingName: updateDeviceSettingRequestDto.deviceSettingName,
    deviceSettingType: updateDeviceSettingRequestDto.deviceSettingType,
    deviceSettingValue: updateDeviceSettingRequestDto.deviceSettingValue,
  } as IDeviceSettings);
};

const findDeviceSettingByIdAndName = async (
  deviceId: number,
  deviceSettingName: string
): Promise<IDeviceSettings> => {
  const deviceSetting = await deviceSettingsRepository.findFirst({
    deviceId,
    deviceSettingName,
  });
  if (!deviceSetting) {
    throw deviceSettingNotFound();
  }
  return deviceSetting;
};

export {
  create,
  createMany,
  getDeviceSettingsByDeviceSerial,
  updateDeviceSetting,
  findDeviceSettingByIdAndName,
};

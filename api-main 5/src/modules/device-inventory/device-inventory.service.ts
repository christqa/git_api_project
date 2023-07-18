import deviceInventoryRepository from '@repositories/device-inventory.repository';
import {
  IDeviceInventoryAndCount,
  IDeviceInventoryAndFirmware,
  IDevicesInventory,
} from '@modules/device-inventory/device-inventory.type';
import { IDeviceInventoryRequestDto } from './dtos/devices-inventory.index.dto';
import {
  deviceIsAlreadyVoided,
  noDevice,
  noTimeZones,
} from './device-inventory.error';
import deviceActivationRepository from '@repositories/device-activation.repository';
import firmwareRepository from '@repositories/firmware.repository';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import {
  noFirmwareFound,
  noFirmwaresFound,
} from '@modules/firmware/firmware.error';
import { PrismaClient, Status, DeviceStatus } from '.prisma/client';
import prisma from '@core/prisma/prisma';
import { PatchDeviceInventoriesInternalRequestDto } from './dtos/internal.dto';

const seedDeviceInventory = async (request: IDeviceInventoryRequestDto[]) => {
  const devices = request.map((item) => ({
    deviceSerial: item.deviceSerial,
    manufacturingDate: new Date(item['manufacturingDate']),
    manufacturedForRegion: item.manufacturedForRegion,
    deviceModelId: item.deviceModelId,
    bleMacAddress: item.bleMacAddress,
    wiFiMacAddress: item.wiFiMacAddress,
    deviceMetadata: item.deviceMetadata,
    calibrationFileLocations: item.calibrationFileLocations,
  }));
  const deviceSerials = request.map((item) => item.deviceSerial);
  const firmwareVersions = request.map((item) => item.firmwareVersion);
  const firmwareIds: number[] = await checkFirmwareVersionIsExistAndGetArray(
    firmwareVersions,
    request
  );

  await prisma.$transaction(async (prismaClient) => {
    const prismaTr = prismaClient as PrismaClient;
    await deviceInventoryRepository.createMany(devices, prismaTr);
    const deviceIds =
      await deviceInventoryRepository.findManyDeviceIdsByDeviceSerials(
        deviceSerials,
        prismaTr
      );
    if (!deviceIds?.length) {
      throw noDevice();
    }

    const deviceFirmwares = deviceIds.map((deviceId, index) => ({
      deviceId: deviceId.id,
      firmwareId: firmwareIds[index],
      addedOn: new Date(),
      isCurrent: true,
      isNotified: false,
      approvedOn: new Date(),
      failureLogs: '',
      status: Status.INSTALLED,
    }));
    await deviceFirmwareRepository.createMany(deviceFirmwares, prismaTr);
  });
};

const getDevice = async (deviceSerial?: string): Promise<IDevicesInventory> => {
  if (!deviceSerial) {
    throw noDevice();
  }
  const device = await deviceInventoryRepository.findFirst({
    deviceSerial,
  });
  if (!device) {
    throw noDevice();
  }
  return device;
};

const getDeviceById = async (id: number): Promise<IDevicesInventory> => {
  const device = await deviceInventoryRepository.findFirst({
    id,
  });
  if (!device) {
    throw noDevice();
  }
  return device;
};

const getDeviceInventories = async (
  skip: number,
  take: number,
  deviceSerial?: string
): Promise<IDeviceInventoryAndCount> => {
  const { count, result } =
    await deviceInventoryRepository.findManyActiveDevices(
      skip,
      take,
      deviceSerial
    );
  const devices = result.map((item) => {
    const device = {
      deviceSerial: item.deviceSerial,
      firmwareVersion: item.deviceFirmware[0]?.firmware?.virtualFirmware
        ? item.deviceFirmware[0].firmware.virtualFirmware
        : null,
      timeZoneId: item.deviceActivation[0].timeZoneId,
      deviceName: item.deviceActivation[0].deviceName,
      deviceModelId: item.deviceActivation[0].deviceModelId,
      deviceStatus: item.deviceActivation[0].deviceStatus,
      batteryStatus: item.deviceActivation[0].batteryStatus,
      wiFiSSID: item.deviceActivation[0].wiFiSSID,
      rssi: item.deviceActivation[0].rssi,
      deviceStatusUpdatedOn: item.deviceActivation[0].deviceStatusUpdatedOn,
      activatedOn: item.deviceActivation[0].activatedOn,
      activatedBy: item.deviceActivation[0].activatedBy,
      isNotified: item.deviceActivation[0].isNotified,
    } as unknown as IDeviceInventoryAndFirmware;
    return device;
  });
  return { total: count, devices: devices };
};

const checkTimeZoneIsExistAndGetMap = async (timeZoneTexts: string[]) => {
  // get and check timezones if exists in db
  const timeZones = await deviceActivationRepository.findTimeZonesByText(
    timeZoneTexts
  );
  if (!timeZones?.length) {
    throw noTimeZones(timeZoneTexts);
  }

  // generate found timezones map
  const foundTimeZonesMap: { [key: string]: number } = {};
  timeZones.forEach((timeZone) => {
    foundTimeZonesMap[timeZone.text] = timeZone.id;
  });
  const foundTimeZonesMapKeys = Object.keys(foundTimeZonesMap);

  // check if we have unknown timezones
  const notFoundTimeZoneTexts = timeZoneTexts.filter(
    (timeZoneText) => !foundTimeZonesMapKeys.includes(timeZoneText)
  );
  if (notFoundTimeZoneTexts.length) {
    throw noTimeZones(notFoundTimeZoneTexts);
  }

  // get found timezones map
  return foundTimeZonesMap;
};

const checkFirmwareVersionIsExistAndGetArray = async (
  firmwareVersions: string[],
  request: IDeviceInventoryRequestDto[]
) => {
  const firmwares = await firmwareRepository.findManyWithFirmwareVersions(
    firmwareVersions
  );
  if (!firmwares?.length) {
    throw noFirmwareFound();
  }
  const foundFirmareVersionsKeys = firmwares.map(
    (firmware) => firmware.virtualFirmware
  );
  const notFoundVersions = firmwareVersions.filter(
    (firmwareVersion) => !foundFirmareVersionsKeys.includes(firmwareVersion)
  );
  if (notFoundVersions.length) {
    throw noFirmwaresFound(firmwareVersions);
  }
  const foundFirmwaresMap: number[] = [];
  request.forEach((item) => {
    firmwares.forEach((firmware) => {
      if (firmware.virtualFirmware === item.firmwareVersion) {
        foundFirmwaresMap.push(firmware.id);
      }
    });
  });
  return foundFirmwaresMap;
};

const voidDevice = async (deviceSerial: string) => {
  // check if the device is in device inventory
  const device = await getDevice(deviceSerial);

  // check if device is already voided
  if (device.deviceStatus === DeviceStatus.VOID) {
    throw deviceIsAlreadyVoided();
  }

  // update the device
  await deviceInventoryRepository.update(
    { deviceSerial: deviceSerial },
    { deviceStatus: DeviceStatus.VOID }
  );
};

const patchDevice = async (
  deviceSerial: string,
  patchDeviceInventoriesInternalRequestDto: PatchDeviceInventoriesInternalRequestDto
) => {
  // check if the device is in device inventory
  const device = await getDevice(deviceSerial);

  // update the device
  await deviceInventoryRepository.updatePixelRegistrationFile(
    device.id,
    patchDeviceInventoriesInternalRequestDto.pixelRegistrationFile
  );
};

export {
  seedDeviceInventory,
  getDevice,
  getDeviceInventories,
  getDeviceById,
  voidDevice,
  patchDevice,
};

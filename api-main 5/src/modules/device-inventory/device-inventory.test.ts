import {
  getDevice,
  getDeviceInventories,
  seedDeviceInventory,
  voidDevice,
  patchDevice,
} from '@modules/device-inventory/device-inventory.service';
import deviceActivationRepository from '@repositories/device-activation.repository';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import firmwareRepository from '@repositories/firmware.repository';
import { AvailabilityType, DeviceStatus } from '.prisma/client';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';

const deviceInventoryData = {
  id: 1,
  deviceSerial: 'test',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceModelId: 1,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
  deviceStatus: DeviceStatus.IN_SERVICE,
};

const deviceInventoryDataVoided = {
  id: 1,
  deviceSerial: 'test',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceModelId: 1,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
  deviceStatus: DeviceStatus.VOID,
};

const activeDeviceWithFirmwareUnprocessed = {
  deviceActivation: [
    {
      timeZoneId: 491,
      deviceName: 'Smart Toilet1',
      deviceModelId: 1,
      deviceStatus: {},
      batteryStatus: 0,
      wiFiSSID: null,
      rssi: null,
      deviceStatusUpdatedOn: null,
      activatedOn: new Date(),
      activatedBy: 1,
      deactivatedBy: null,
      deleted: null,
      isNotified: false,
    },
  ],
  deviceSerial: 'e4b0c506-e62a-4',
  deviceFirmware: [{ firmware: { virtualFirmware: '1.0.1' } }],
};

const firmware = {
  id: 1,
  virtualFirmware: '1.0.1',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {},
  md5CheckSum: '',
  availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
};

beforeEach(() => {
  jest
    .spyOn(deviceActivationRepository, 'findTimeZonesByText')
    .mockResolvedValue([
      {
        id: 1,
        text: 'test',
        gmt: '+01',
      },
    ]);
  jest
    .spyOn(deviceInventoryRepository, 'createMany')
    .mockResolvedValue({ count: 1 });
  jest
    .spyOn(deviceInventoryRepository, 'findFirst')
    .mockResolvedValue(deviceInventoryData);
  jest
    .spyOn(deviceInventoryRepository, 'findManyDeviceIdsByDeviceSerials')
    .mockResolvedValue([{ id: 1 }]);
  jest
    .spyOn(deviceInventoryRepository, 'findManyActiveDevices')
    .mockResolvedValue({
      count: 1,
      result: [activeDeviceWithFirmwareUnprocessed],
    });
  jest
    .spyOn(deviceInventoryRepository, 'updatePixelRegistrationFile')
    .mockResolvedValue(undefined);
});
jest
  .spyOn(deviceFirmwareRepository, 'createMany')
  .mockResolvedValue({ count: 1 });
jest
  .spyOn(firmwareRepository, 'findManyWithFirmwareVersions')
  .mockResolvedValue([firmware]);

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Device Inventory', () => {
  test('should test seedDeviceInventory function', async () => {
    await seedDeviceInventory([
      {
        deviceSerial: 'test',
        manufacturingDate: new Date(),
        manufacturedForRegion: 'North America',
        deviceModelId: 1,
        bleMacAddress: '48-68-28-13-A4-48',
        wiFiMacAddress: '3E-94-C9-43-2D-D7',
        firmwareVersion: '1.0.1',
        deviceMetadata: {},
        calibrationFileLocations: {},
      },
      {
        deviceSerial: 'test',
        manufacturingDate: new Date(),
        manufacturedForRegion: 'North America',
        deviceModelId: 1,
        bleMacAddress: '48-68-28-13-A4-48',
        wiFiMacAddress: '3E-94-C9-43-2D-D7',
        firmwareVersion: '1.0.1',
        deviceMetadata: {},
        calibrationFileLocations: {},
      },
    ]);
  });

  test('should test getDevice function', async () => {
    await getDevice('test');
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
  });

  test('should test getDevice function with error', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);
    try {
      await getDevice('test');
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test getDeviceInventories function', async () => {
    await getDeviceInventories(0, 1);
    expect(deviceInventoryRepository.findManyActiveDevices).toHaveBeenCalled();
  });

  test('should test voidDevice (success)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryData);
    const result = await voidDevice('test');
    expect(result).toBeUndefined();
  });

  test('should test voidDevice (error, device is already voided)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryDataVoided);
    try {
      await voidDevice('test');
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'device_inventory_device_already_voided'
      );
    }
  });

  test('should test patchDevice (success)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryData);
    const result = await patchDevice('e4b0c506-e62a-4', {
      pixelRegistrationFile: {},
    });
    expect(result).toBeUndefined();
  });

  test('should test patchDevice (error, device not found)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);
    try {
      await patchDevice('e4b0c506-e62a-4', {
        pixelRegistrationFile: {},
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });
});

import ApiError from '@core/error-handling/api-error';
import {
  deviceActivationService,
  profileService,
} from '@modules/index/index.service';
import { IProfile } from '@modules/profile/profile.type';
import { DeviceStatus } from '@prisma/client';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import bathroomActivitysRepository from '@repositories/bathroom-activity.repository';
import httpStatus from 'http-status';
import bathroomActivitysService from './bathroom-activity.service';
import { IBathroomActivityFile } from './bathroom-activity.type';
import moment from 'moment';
import profileRepository from '@repositories/profile.repository';
import { createBathroomActivityError } from './bathroom-activity.error';

const startedOn = new Date();
const endedOn = new Date();

const deviceInventoryObject = {
  id: 1,
  deviceSerial: '73b-015-04-2f7',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  activatedTimeZoneId: 491,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
  deviceStatus: DeviceStatus.IN_SERVICE,
};

const deviceActivationObject = {
  id: 1,
  deviceId: 1,
  deviceFirmwareId: 1,
  activatedBy: 1,
  timeZoneId: 1,
  deviceName: 'Smart Toilet',
  deviceModelId: 1,
  deviceStatus: {},
  batteryStatus: 0,
  wiFiSSID: '',
  rssi: 0,
  deviceStatusUpdatedOn: new Date(),
  isNotified: false,
  activatedOn: new Date(),
  deactivatedBy: null,
  deleted: null,
};

const bathroomActivityObject = {
  id: 1,
  deviceId: 1,
  profileId: 1,
  eventBody: {},
  startedOn,
  endedOn,
  isEventProcessed: false,
  eventUuid: '661e558e-1943-4bd7-9e56-7eefec810224',
  fileLocationMetadata: {
    region: 'us-east-2',
    filename: 'aa',
    bucket: 'bucket_name',
    platform: 'AWS_S3',
    keyPrefix: 'key/prefix',
  },
  metadata: null,
};

const bathroomActivityData = {
  id: 1,
  deviceId: 1,
  profileId: 1,
  eventBody: {},
  startedOn: new Date(),
  endedOn: moment().add(10, 'seconds').toDate(),
  isEventProcessed: false,
  eventUuid: 'string',
  fileLocationMetadata: {
    region: 'us-east-2',
    platform: 'AWS_S3',
    bucket: 'bucket_name',
    keyPrefix: 'key/prefix',
  },
  metadata: null,
  BathroomActivityFiles: [
    {
      filename: 'aa',
      fileMetadata: {},
      processedOn: new Date(),
      isFileProcessed: false,
    },
  ],
  deviceInventory: {
    deviceSerial: '73b-015-04-2f7',
    calibrationFileLocations: {},
  },
};

beforeEach(() => {
  jest.spyOn(profileService, 'findProfileById').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest
    .spyOn(deviceInventoryRepository, 'findFirst')
    .mockResolvedValue(deviceInventoryObject);
  jest
    .spyOn(deviceActivationService, 'checkIfDeviceIsActivated')
    .mockResolvedValue(deviceActivationObject);
  jest
    .spyOn(bathroomActivitysRepository, 'createBathroomActivity')
    .mockResolvedValue(bathroomActivityObject);
  jest
    .spyOn(bathroomActivitysRepository, 'updateBathroomActivity')
    .mockResolvedValue(bathroomActivityObject);
  jest
    .spyOn(bathroomActivitysRepository, 'findBathroomActivity')
    .mockResolvedValue(bathroomActivityObject);
  jest
    .spyOn(bathroomActivitysRepository, 'createBathroomActivityImages')
    .mockResolvedValue({ count: 2 });
  jest
    .spyOn(
      bathroomActivitysRepository,
      'findBathroomActivityWithBathroomActivityFiles'
    )
    .mockResolvedValue(bathroomActivityData);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('BathroomActivitys', () => {
  test('should test start function', async () => {
    jest
      .spyOn(bathroomActivitysRepository, 'findBathroomActivity')
      .mockResolvedValue(null);

    const result = await bathroomActivitysService.start({
      profileId: 1,
      deviceSerial: '73b-015-04-2f7',
      eventBody: {},
      startedOn: new Date(),
      bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
    });
    expect(deviceInventoryRepository.findFirst).toBeCalled();
    expect(bathroomActivitysRepository.findBathroomActivity).toBeCalled();
    expect(bathroomActivitysRepository.createBathroomActivity).toBeCalled();
  });

  test('should test start function (update)', async () => {
    const result = await bathroomActivitysService.start({
      profileId: 1,
      deviceSerial: '73b-015-04-2f7',
      eventBody: {},
      startedOn: new Date(),
      bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
    });
    expect(deviceInventoryRepository.findFirst).toBeCalled();
    expect(bathroomActivitysRepository.findBathroomActivity).toBeCalled();
    expect(bathroomActivitysRepository.updateBathroomActivity).toBeCalled();
  });

  test('should test start function (404 device not found)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      await bathroomActivitysService.start({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
        eventBody: {},
        startedOn: new Date(),
        bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test start function (404 device not active)', async () => {
    jest
      .spyOn(deviceActivationService, 'checkIfDeviceIsActivated')
      .mockResolvedValue({ ...deviceActivationObject, deactivatedBy: 1 });

    try {
      await bathroomActivitysService.start({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
        eventBody: {},
        startedOn: new Date(),
        bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test start function (400 device not match)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue({ ...deviceInventoryObject, id: 2 });

    try {
      await bathroomActivitysService.start({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
        eventBody: {},
        startedOn: new Date(),
        bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'bathroom _activity_device_serial_not_match_bathroom _activity'
      );
    }
  });

  test('should test saveImages function', async () => {
    const result = await bathroomActivitysService.saveImages({
      filename: 'aa',
      deviceSerial: '73b-015-04-2f7',
      bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
      images: [
        {
          imageMetadata: {
            temperatureCam: '31C',
            temperatureICP: '30C',
            otherFactors: 'otherFactor',
            timestamp: new Date(),
          },
        },
        {
          imageMetadata: {
            temperatureCam: '31C',
            temperatureICP: '30C',
            otherFactors: 'otherFactor',
            timestamp: new Date(),
          },
        },
      ],
    });
    expect(result.count).toBe(2);
  });

  test('should test saveImages function (404 unprocessed event not found)', async () => {
    jest
      .spyOn(bathroomActivitysRepository, 'findBathroomActivity')
      .mockResolvedValue(null);

    try {
      await bathroomActivitysService.saveImages({
        filename: 'aa',
        deviceSerial: '73b-015-04-2f7',
        bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
        images: [
          {
            imageMetadata: {
              temperatureCam: '31C',
              temperatureICP: '30C',
              otherFactors: 'otherFactor',
              timestamp: new Date(),
            },
          },
          {
            imageMetadata: {
              temperatureCam: '31C',
              temperatureICP: '30C',
              otherFactors: 'otherFactor',
              timestamp: new Date(),
            },
          },
        ],
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'bathroom _activity_bathroom _activity_not_found'
      );
    }
  });

  test('should test patchEvent function', async () => {
    const result = await bathroomActivitysService.patchEvent(
      '4125f59c-04b2-4144-80b7-66274ad43ab2',
      {
        bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
        deviceSerial: '73b-015-04-2f7',
        isEventProcessed: true,
      }
    );
    expect(bathroomActivitysRepository.findBathroomActivity).toBeCalled();
    expect(deviceInventoryRepository.findFirst).toBeCalled();
    expect(bathroomActivitysRepository.updateBathroomActivity).toBeCalled();
  });

  test('should test patchEvent function (404 unprocessed event not found)', async () => {
    jest
      .spyOn(bathroomActivitysRepository, 'findBathroomActivity')
      .mockResolvedValue(null);

    try {
      await bathroomActivitysService.patchEvent(
        '4125f59c-04b2-4144-80b7-66274ad43ab2',
        {
          bathroomActivityUuid: '4125f59c-04b2-4144-80b7-66274ad43ab2',
          isEventProcessed: true,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'bathroom _activity_bathroom _activity_not_found'
      );
    }
  });

  test('should test the getEvent function', async () => {
    const eventUuid = 'string';
    const data = await bathroomActivitysService.getEvent(eventUuid);
    const files: IBathroomActivityFile[] = [];
    bathroomActivityData.BathroomActivityFiles.forEach(
      (bathroomActivityFile) => {
        files.push({
          keyPrefix: `${deviceInventoryObject.deviceSerial}/${bathroomActivityData.eventUuid}`,
          region: 'us-east-2',
          filename: 'aa',
          bucket: 'bucket_name',
          fileMetadata: bathroomActivityFile.fileMetadata,
          isProcessed: bathroomActivityFile.isFileProcessed,
          processedAt: bathroomActivityFile.processedOn,
        });
      }
    );
    expect(
      bathroomActivitysRepository.findBathroomActivityWithBathroomActivityFiles
    ).toBeCalled();
  });

  test('should test the getEvent function with null value', async () => {
    jest
      .spyOn(
        bathroomActivitysRepository,
        'findBathroomActivityWithBathroomActivityFiles'
      )
      .mockResolvedValue(null);
    try {
      const eventUuid = 'string';
      await bathroomActivitysService.getEvent(eventUuid);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(httpStatus.NOT_FOUND);
      expect(error.localised.key).toBe(
        'bathroom _activity_bathroom _activity_not_found'
      );
    }
  });

  test('should test the getBathroomActivitySummary function', async () => {
    const eventUuid = 'string';
    await bathroomActivitysService.getBathroomActivitySummary(eventUuid);
    const images: IBathroomActivityFile[] = [];
    bathroomActivityData.BathroomActivityFiles.forEach(
      (bathroomActivityFile) => {
        images.push({
          filename: 'aa',
          keyPrefix: `${deviceInventoryObject.deviceSerial}/${bathroomActivityData.eventUuid}`,
          bucket: 'bucket_name',
          region: 'us-east-2',
          fileMetadata: bathroomActivityFile.fileMetadata,
          isProcessed: bathroomActivityFile.isFileProcessed,
          processedAt: bathroomActivityFile.processedOn,
        });
      }
    );
    expect(
      bathroomActivitysRepository.findBathroomActivityWithBathroomActivityFiles
    ).toBeCalled();
  });

  test('should test the getBathroomActivitySummary function with null value', async () => {
    jest
      .spyOn(
        bathroomActivitysRepository,
        'findBathroomActivityWithBathroomActivityFiles'
      )
      .mockResolvedValue(null);
    try {
      const eventUuid = 'string';
      await bathroomActivitysService.getBathroomActivitySummary(eventUuid);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(httpStatus.NOT_FOUND);
      expect(error.localised.key).toBe(
        'bathroom _activity_bathroom _activity_not_found'
      );
    }
  });
  test('should test createBathroomActivity function', async () => {
    await bathroomActivitysService.createBathroomActivity({
      profileId: 1,
      deviceSerial: '73b-015-04-2f7',
    });
    expect(bathroomActivitysRepository.createBathroomActivity).toBeCalled();
  });
  test('should test createBathroomActivity with null value for profile id', async () => {
    jest.spyOn(profileRepository, 'findById').mockResolvedValue(null);
    try {
      await bathroomActivitysService.createBathroomActivity({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
      });
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(httpStatus.NOT_FOUND);
      expect(error.localised.key).toBe('profile_user_has_no_profile_data');
    }
  });

  test('should test createBathroomActivity with null value for device id', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      await bathroomActivitysService.createBathroomActivity({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
      });
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(httpStatus.NOT_FOUND);
      expect(error.localised.key).toBe('device_inventory_device_not_found');
    }
  });
  test('should test createBathroomActivity with create UNPROCESSABLE_ENTITY error', async () => {
    jest
      .spyOn(bathroomActivitysRepository, 'createBathroomActivity')
      .mockImplementation(() => {
        throw createBathroomActivityError();
      });

    try {
      await bathroomActivitysService.createBathroomActivity({
        profileId: 1,
        deviceSerial: '73b-015-04-2f7',
      });
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
      expect(error.localised.key).toBe('bathroom _activity_cannot_be_created');
    }
  });
});

import {
  GroupUserRoles,
  PrismaClient,
  Status,
  AvailabilityType,
  DeviceStatus,
} from '@prisma/client';
import prisma from '@core/prisma/prisma';
import { prismaMock } from '@core/prisma/singleton';
import httpStatus from 'http-status';
import ApiError from '@core/error-handling/api-error';
import {
  deviceActivationService,
  groupsService,
  userService,
} from '@modules/index/index.service';
import deviceActivationRepository from '@repositories/device-activation.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import {
  IDeviceActivationExtended,
  IDeviceActivationStatusTypes,
} from './device-activation.type';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import groupUsersRepository from '@repositories/group-users.repository';
import { IUser } from '@modules/user/user.type';
import firmwareService from '@modules/firmware/firmware.service';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import { generateUser } from '@test/utils/generate';
import globalSettingsRepository from '@repositories/global-settings.repository';
import deviceSettingsRepository from '@repositories/device-settings.repository';
import { IDeviceFirmware, IFirmware } from '@modules/firmware/firmware.type';
import { IGroup } from '@modules/groups/groups.type';

const userObject = generateUser({ id: 2 });

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

const deviceInventoryObjectVoided = {
  id: 1,
  deviceSerial: '73b-015-04-2f7',
  manufacturingDate: new Date(),
  manufacturedForRegion: 'North America',
  deviceModelId: 1,
  bleMacAddress: '48-68-28-13-A4-48',
  wiFiMacAddress: '3E-94-C9-43-2D-D7',
  deviceMetadata: {},
  calibrationFileLocations: {},
  deviceStatus: DeviceStatus.VOID,
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

const deviceActivationExtendedObject = {
  ...deviceActivationObject,
  deviceInventory: {
    deviceSerial: '73b-015-04-2f7',
  },
  deviceFirmware: {
    id: 1,
    deviceId: 1,
    firmwareId: 1,
    addedOn: new Date(),
    isCurrent: true,
    isNotified: false,
    status: Status.AWAITINGUSERAPPROVAL, // newly added field in the device firmware table
    failureLogs: '', // newly added field in the device firmware table
    updateOn: new Date(), // newly added field in the device firmware table
    approvedOn: new Date(), // newly added field in the device firmware table
    firmware: {
      id: 1,
      virtualFirmware: 'string',
    } as IFirmware,
  } as IDeviceFirmware,
} as IDeviceActivationExtended;

const timeZoneObject = {
  id: 1,
  text: 'Africa/Abidjan',
  gmt: '+00:00',
};

const deviceInventoryExtendedObject = {
  ...deviceInventoryObject,
  deviceActivation: [deviceActivationObject],
};

const groupObject = {
  id: 1,
  groupName: 'Home',
  createdOn: new Date(),
  deletedBy: null,
  deleted: null,
} as IGroup;

const groupUserObject = {
  id: 1,
  userId: 1,
  groupId: 1,
  addedOn: new Date(),
  role: GroupUserRoles.admin,
  deleted: null,
};

const groupUser = {
  id: 1,
  userId: 1,
  groupId: 1,
  addedOn: new Date(),
  role: GroupUserRoles.admin,
  deleted: null,
  user: {
    firstName: 'name',
    lastName: 'last',
    email: 'user@us.ca',
    userGuid: '12323123',
    profile: {
      id: 1,
    },
  } as unknown as IUser,
};

const groupUserNotAdmin = {
  id: 1,
  userId: 1,
  groupId: 1,
  addedOn: new Date(),
  role: GroupUserRoles.member,
  deleted: null,
  user: {
    firstName: 'name',
    lastName: 'last',
    email: 'user@us.ca',
    userGuid: '12323123',
    profile: { id: 1 },
  } as unknown as IUser,
};

const groupDeviceObject = {
  id: 1,
  groupId: 0,
  deviceId: 1,
  addedBy: 1,
  addedOn: new Date(),
  removedBy: null,
  deleted: null,
  deviceInventory: deviceInventoryExtendedObject,
};

const deviceFirmwareObject = {
  id: 1,
  deviceId: 1,
  firmwareId: 1,
  addedOn: new Date(),
  isCurrent: true,
  isNotified: false,
  status: Status.AWAITINGUSERAPPROVAL, // newly added field in the device firmware table
  failureLogs: '', // newly added field in the device firmware table
  updateOn: new Date(), // newly added field in the device firmware table
  approvedOn: new Date(), // newly added field in the device firmware table
};

const firmwareObject = {
  id: 1,
  virtualFirmware: '1.0.0',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1, // newly added field in the firmware table
  fileName: 'string', // newly added field in the firmware table
  locationMetaData: {}, // newly added field in the firmware table
  md5CheckSum: '', // newly added field in the firmware table
  availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
};

const deviceFirmwareExtendedObject = {
  ...deviceFirmwareObject,
  firmware: firmwareObject,
};

const mockDisconnectedDevice = {
  id: 1,
  deviceName: 'Toilet',
  deviceStatusUpdatedOn: new Date(),
  deviceInventory: {
    groupDevices: [
      {
        group: {
          groupUsers: [
            {
              user: {
                userGuid: '992c137d-27eb-454b-93ce-8671bd80f682',
                email: 'dev1@projectspectra.dev',
                firstName: 'string',
                lastName: 'string',
                profile: { id: 1 },
              },
            },
            {
              user: {
                userGuid: '700bf3f1-0ecc-47cb-b070-7cc563554f44',
                email: 'dev2@projectspectra.dev',
                firstName: 'name',
                lastName: 'name2',
                profile: { id: 2 },
              },
            },
          ],
        },
      },
    ],
    deviceSerial: 'e4b0c506-e56a-5',
  },
};

const globalSettings = [
  {
    id: 1,
    settingName: 'shootingRegime',
    settingType: 'DeviceSetting',
    settingValue:
      '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous/once", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}',
    addedOn: new Date(),
    updatedOn: new Date(),
  },
  {
    id: 2,
    settingName: 'DeviceStatusInterval',
    settingType: 'DeviceSetting',
    settingValue: '12h',
    addedOn: new Date(),
    updatedOn: new Date(),
  },
  {
    id: 3,
    settingName: 'DeviceSleepInterval',
    settingType: 'DeviceSetting',
    settingValue: '60s',
    addedOn: new Date(),
    updatedOn: new Date(),
  },
  {
    id: 4,
    settingName: 'LowPower',
    settingType: 'DeviceSetting',
    settingValue: '20',
    addedOn: new Date(),
    updatedOn: new Date(),
  },
];

const globalSettingsObject = {
  id: 1,
  settingName: 'NFUBattPercent',
  settingType: '',
  settingValue: '100',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsObject = {
  id: 1,
  deviceId: 1,
  deviceSettingName: 'NFUBattPercent',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '50',
  addedOn: new Date(),
  updatedOn: new Date(),
};

const deviceSettingsObjectLowBattery = {
  id: 1,
  deviceId: 1,
  deviceSettingName: 'NFUBattPercent',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '49',
  addedOn: new Date(),
  updatedOn: new Date(),
};

beforeEach(() => {
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  prismaMock.$transaction.mockImplementation((cb) => cb(prisma));
  jest.spyOn(PrismaClient.prototype, '$transaction').mockResolvedValue(null);
  jest
    .spyOn(deviceActivationRepository, 'findFirst')
    .mockResolvedValue(deviceActivationObject);
  jest
    .spyOn(deviceActivationRepository, 'findActivatedDevice')
    .mockResolvedValue(deviceActivationExtendedObject);
  jest
    .spyOn(deviceActivationRepository, 'create')
    .mockResolvedValue(deviceActivationObject);
  jest
    .spyOn(deviceActivationRepository, 'update')
    .mockResolvedValue(deviceActivationObject);
  jest
    .spyOn(deviceActivationRepository, 'removeSoftDelete')
    .mockResolvedValue(deviceActivationObject);
  jest
    .spyOn(deviceActivationRepository, 'findTimeZone')
    .mockResolvedValue(timeZoneObject);
  jest
    .spyOn(deviceInventoryRepository, 'findFirst')
    .mockResolvedValue(deviceInventoryObject);
  jest
    .spyOn(deviceInventoryRepository, 'findManyUserActiveDevices')
    .mockResolvedValue([deviceInventoryExtendedObject]);
  jest
    .spyOn(deviceInventoryRepository, 'findOneUserActiveDevice')
    .mockResolvedValue(deviceInventoryExtendedObject);
  jest
    .spyOn(groupDevicesRepository, 'create')
    .mockResolvedValue(groupDeviceObject);
  jest.spyOn(groupDevicesRepository, 'update').mockResolvedValue({ count: 1 });
  jest.spyOn(groupDevicesRepository, 'remove').mockResolvedValue({ count: 1 });
  jest.spyOn(groupsService, 'getGroup').mockResolvedValue(groupObject);
  jest.spyOn(groupsService, 'getGroupUser').mockResolvedValue(groupUserObject);
  jest
    .spyOn(firmwareService, 'getDeviceNewFirmwareVersion')
    .mockResolvedValue(null);
  jest
    .spyOn(firmwareService, 'getCurrentFirmwareVersion')
    .mockResolvedValue({ ...firmwareObject, id: 2 });
  jest
    .spyOn(firmwareService, 'getDevicePendingFirmwareVersions')
    .mockResolvedValue([]);
  jest
    .spyOn(deviceFirmwareRepository, 'findFirst')
    .mockResolvedValue(deviceFirmwareExtendedObject);
  jest
    .spyOn(deviceFirmwareRepository, 'create')
    .mockResolvedValue(deviceFirmwareObject);
  jest
    .spyOn(deviceFirmwareRepository, 'update')
    .mockResolvedValue(deviceFirmwareObject);
  jest
    .spyOn(deviceFirmwareRepository, 'updateMany')
    .mockResolvedValue(undefined);
  jest
    .spyOn(globalSettingsRepository, 'findAll')
    .mockResolvedValue(globalSettings);
  jest
    .spyOn(deviceSettingsRepository, 'createMany')
    .mockResolvedValue({ count: 4 });
  jest
    .spyOn(globalSettingsRepository, 'findFirst')
    .mockResolvedValue(globalSettingsObject);
  jest
    .spyOn(deviceSettingsRepository, 'updateMany')
    .mockResolvedValue({ count: 1 });
  jest
    .spyOn(deviceSettingsRepository, 'removeManySoftDelete')
    .mockResolvedValue({ count: 1 });
  jest
    .spyOn(firmwareService, 'sendDeviceNewFirmwareMessageToGroupAdmins')
    .mockResolvedValue(undefined);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('DeviceActivation', () => {
  test('should test activateDevice function', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest.spyOn(deviceSettingsRepository, 'findFirst').mockResolvedValue(null);
    const addedDevice = await deviceActivationService.activateDevice(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        timeZoneId: 1,
        deviceSerial: '73b-015-04-2f7',
        deviceName: 'Smart Toilet',
        groupId: 1,
      }
    );
    expect(addedDevice).toBeUndefined();
  });

  test('should test activateDevice function (device is void)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryObjectVoided);
    try {
      await deviceActivationService.activateDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
          groupId: 1,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'device_activation_device_inventory_status_must_be_in_service'
      );
    }
  });

  test('should test activateDevice function (check if device is already activated)', async () => {
    try {
      await deviceActivationService.activateDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
          groupId: 1,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'device_activation_device_already_activated'
      );
    }
  });

  test('should test activateDevice function (check if device name is unique)', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    try {
      await deviceActivationService.activateDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
          groupId: 1,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('device_activation_name_already_used');
    }
  });

  test('should test updateActivatedDevice function', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValueOnce(groupDeviceObject);
    jest.spyOn(groupDevicesRepository, 'findFirst').mockResolvedValueOnce(null);
    const updateDevice = await deviceActivationService.updateActivatedDevice(
      '1',
      {
        timeZoneId: 1,
        deviceSerial: '73b-015-04-2f7',
        deviceName: 'Smart Toilet',
      }
    );
    expect(updateDevice).toBeUndefined();
  });

  test('should test updateActivatedDevice function (check if device is activated)', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.updateActivatedDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test updateActivatedDevice function (check permission)', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValueOnce(groupDeviceObject);
    jest
      .spyOn(groupsService, 'getGroupUser')
      .mockResolvedValue({ ...groupUserObject, role: GroupUserRoles.member });

    try {
      await deviceActivationService.updateActivatedDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_group_user_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test updateActivatedDevice function (check if device name is unique)', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValueOnce(groupDeviceObject);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValueOnce(groupDeviceObject);

    try {
      await deviceActivationService.updateActivatedDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          timeZoneId: 1,
          deviceSerial: '73b-015-04-2f7',
          deviceName: 'Smart Toilet',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe('device_activation_name_already_used');
    }
  });

  test('should test deactivateDevice function', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);

    const deviceActivation = await deviceActivationService.deactivateDevice(
      '1',
      {
        deviceSerial: '73b-015-04-2f7',
      }
    );
    expect(deviceActivation).toBeUndefined();
  });

  test('should test deactivateDevice function (check if device is activated)', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.deactivateDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          deviceSerial: '73b-015-04-2f7',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test deactivateDevice function (check user permissions)', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);

    try {
      await deviceActivationService.deactivateDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        {
          deviceSerial: '73b-015-04-2f7',
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_you_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test checkIfDeviceIsActivated function', async () => {
    const data = await deviceActivationService.checkIfDeviceIsActivated(1);
    expect(data).toEqual(deviceActivationObject);
  });

  test('should test checkIfDeviceIsActivated function with error', async () => {
    try {
      jest
        .spyOn(deviceActivationRepository, 'findFirst')
        .mockResolvedValue(null);
      await deviceActivationService.checkIfDeviceIsActivated(1);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test findDevices function', async () => {
    await deviceActivationService.findDevices(1);
    expect(
      deviceInventoryRepository.findManyUserActiveDevices
    ).toHaveBeenCalled();
  });

  test('should test getDevice function', async () => {
    await deviceActivationService.getDevice('1', '73b01504-2f7');
    expect(userService.findByUserGuid).toHaveBeenCalled();
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
    expect(
      deviceInventoryRepository.findOneUserActiveDevice
    ).toHaveBeenCalled();
  });

  test('should test getDevice function (404 user device not found)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findOneUserActiveDevice')
      .mockResolvedValue(null);

    try {
      await deviceActivationService.getDevice(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        '73b01504-2f7'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_user_device_not_found'
      );
    }
  });

  test('should test getDeviceStatus function (invalid device)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);
    const addedDevice = await deviceActivationService.getDeviceStatus({
      deviceSerial: '73b-015-04-2f7',
    });
    expect(addedDevice.status).toBe(
      IDeviceActivationStatusTypes.INVALID_DEVICE
    );
    expect(addedDevice.deviceName).toBe('');
  });

  test('should test getDeviceStatus function (device not activated)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryObject);
    jest
      .spyOn(deviceActivationRepository, 'findActivatedDevice')
      .mockResolvedValue(null);
    const addedDevice = await deviceActivationService.getDeviceStatus({
      deviceSerial: '73b-015-04-2f7',
    });
    expect(addedDevice.status).toBe(IDeviceActivationStatusTypes.NOT_ACTIVATED);
    expect(addedDevice.deviceName).toBe('');
  });

  test('should test getDeviceStatus function (already in use)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryObject);
    jest
      .spyOn(deviceActivationRepository, 'findActivatedDevice')
      .mockResolvedValue(deviceActivationExtendedObject);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValueOnce(groupDeviceObject);
    const addedDevice = await deviceActivationService.getDeviceStatus({
      deviceSerial: '73b-015-04-2f7',
    });
    expect(addedDevice.status).toBe(
      IDeviceActivationStatusTypes.ALREADY_IN_USED
    );
    expect(addedDevice.deviceName).toBe(
      deviceActivationExtendedObject.deviceName
    );
  });

  test('should test getDeviceStatus function (available)', async () => {
    jest
      .spyOn(deviceInventoryRepository, 'findFirst')
      .mockResolvedValue(deviceInventoryObject);
    jest
      .spyOn(deviceActivationRepository, 'findActivatedDevice')
      .mockResolvedValue(deviceActivationExtendedObject);
    jest.spyOn(groupDevicesRepository, 'findFirst').mockResolvedValue(null);
    const addedDevice = await deviceActivationService.getDeviceStatus({
      deviceSerial: '73b-015-04-2f7',
    });
    expect(addedDevice.status).toBe(IDeviceActivationStatusTypes.AVAILABLE);
    expect(addedDevice.deviceName).toBe(
      deviceActivationExtendedObject.deviceName
    );
  });

  test('should test acceptDeviceFirmwareUpdate function', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findFirst')
      .mockResolvedValue({ ...deviceActivationObject, batteryStatus: 100 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);

    const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
    const acceptDeviceFirmwareUpdate =
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
    expect(acceptDeviceFirmwareUpdate).toBe(undefined);
  });

  test('should test acceptDeviceFirmwareUpdate function (no device in inventory)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test acceptDeviceFirmwareUpdate function (device not activated)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test acceptDeviceFirmwareUpdate function (user has no access to the device)', async () => {
    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_you_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test acceptDeviceFirmwareUpdate function (battery level not enough)', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findFirst')
      .mockResolvedValue({ ...deviceActivationObject, batteryStatus: 49 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObjectLowBattery);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.FAILED_DEPENDENCY);
      expect(error?.localised.key).toBe('battery_level_not_enough');
    }
  });

  test('should test acceptDeviceFirmwareUpdate function (device firmware not found)', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findFirst')
      .mockResolvedValue({ ...deviceActivationObject, batteryStatus: 100 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue(null);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('firmware_device_firmware_not_found');
    }
  });

  test('should test acceptDeviceFirmwareUpdate function (device firmware already accepted)', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findFirst')
      .mockResolvedValue({ ...deviceActivationObject, batteryStatus: 100 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue({
      ...deviceFirmwareExtendedObject,
      status: 'PENDINGINSTALL',
    });

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      await deviceActivationService.acceptDeviceFirmwareUpdate(userGuid, {
        deviceSerial: '73b-015-04-2f7',
        virtualFirmware: '1.0.0',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_user_already_accepted_device_firmware'
      );
    }
  });

  test('should test getActivatedDevice function', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);

    const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
    const deviceSerial = '73b-015-04-2f7';
    const getActivatedDevice = await deviceActivationService.getActivatedDevice(
      userGuid,
      deviceSerial
    );
    expect(userService.findByUserGuid).toHaveBeenCalled();
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
    expect(deviceActivationRepository.findActivatedDevice).toHaveBeenCalled();
    expect(getActivatedDevice.deviceName).toBe('Smart Toilet');
    expect(getActivatedDevice.deviceSerial).toBe('73b-015-04-2f7');
  });

  test('should test getActivatedDevice function (no device in inventory)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      const deviceSerial = '73b-015-04-2f7';
      await deviceActivationService.getActivatedDevice(userGuid, deviceSerial);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test getActivatedDevice function (user has no access to the device)', async () => {
    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      const deviceSerial = '73b-015-04-2f7';
      await deviceActivationService.getActivatedDevice(userGuid, deviceSerial);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.UNAUTHORIZED);
      expect(error?.localised.key).toBe(
        'groups_you_dont_have_permissions_for_this_operation'
      );
    }
  });

  test('should test getActivatedDevice function (activated device not found)', async () => {
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      // eslint-disable-next-line
      .mockResolvedValue({ id: 1 } as any);
    jest
      .spyOn(deviceActivationRepository, 'findActivatedDevice')
      .mockResolvedValue(null);

    try {
      const userGuid = '3cc48360-8fac-4995-bcb8-ceeced7d8e0e';
      const deviceSerial = '73b-015-04-2f7';
      await deviceActivationService.getActivatedDevice(userGuid, deviceSerial);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test updateDeviceBatteryStatus function', async () => {
    const updateDevice =
      await deviceActivationService.updateDeviceBatteryStatus({
        deviceSerial: '73b-015-04-2f7',
        batteryStatus: 100,
        firmwareVersion: '1.0.0',
        wiFiSSID: 'Home',
        signalStrength: -50,
      });
    expect(updateDevice).toBeUndefined();
  });

  test('should test updateDeviceBatteryStatus function (check if device is activated)', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.updateDeviceBatteryStatus({
        deviceSerial: '73b-015-04-2f7',
        batteryStatus: 100,
        firmwareVersion: '1.0.0',
        wiFiSSID: 'Home',
        signalStrength: -50,
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

  test('should test getDeviceFirmwareUpdate function', async () => {
    const deviceFirmwareUpdate =
      await deviceActivationService.getDeviceFirmwareUpdate({
        deviceSerial: '73b-015-04-2f7',
      });
    expect(deviceInventoryRepository.findFirst).toHaveBeenCalled();
    expect(deviceFirmwareRepository.findFirst).toHaveBeenCalled();
    expect(deviceFirmwareUpdate?.deviceSerial).toBe('73b-015-04-2f7');
  });

  test('should test getDeviceFirmwareUpdate function (no device in inventory)', async () => {
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.getDeviceFirmwareUpdate({
        deviceSerial: '73b-015-04-2f7',
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test getDeviceFirmwareUpdate function (check if device is activated)', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.getDeviceFirmwareUpdate({
        deviceSerial: '73b-015-04-2f7',
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

  test('should test getDeviceFirmwareUpdate function (no device firmware)', async () => {
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue(null);

    const deviceFirmwareUpdate =
      await deviceActivationService.getDeviceFirmwareUpdate({
        deviceSerial: '73b-015-04-2f7',
      });
    expect(deviceFirmwareUpdate).toBe(undefined);
  });

  test('should test updateDeviceFirmwareUpdateStatus function', async () => {
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue({
      ...deviceFirmwareExtendedObject,
      status: 'PENDINGINSTALL',
    });

    const deviceSerial = '73b-015-04-2f7';
    const firmwareVersion = '1.0.0';
    const deviceFirmwareUpdate =
      await deviceActivationService.updateDeviceFirmwareUpdateStatus(
        deviceSerial,
        firmwareVersion,
        {
          status: Status.INSTALLED,
        }
      );
    expect(deviceFirmwareUpdate).toBe(undefined);
  });

  test('should test updateDeviceFirmwareUpdateStatus function (no device in inventory)', async () => {
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue({
      ...deviceFirmwareExtendedObject,
      status: 'PENDINGINSTALL',
    });
    jest.spyOn(deviceInventoryRepository, 'findFirst').mockResolvedValue(null);

    try {
      const deviceSerial = '73b-015-04-2f7';
      const firmwareVersion = '1.0.0';
      await deviceActivationService.updateDeviceFirmwareUpdateStatus(
        deviceSerial,
        firmwareVersion,
        {
          status: Status.INSTALLED,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('device_inventory_device_not_found');
    }
  });

  test('should test updateDeviceFirmwareUpdateStatus function (check if device is activated)', async () => {
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue({
      ...deviceFirmwareExtendedObject,
      status: 'PENDINGINSTALL',
    });
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      const deviceSerial = '73b-015-04-2f7';
      const firmwareVersion = '1.0.0';
      await deviceActivationService.updateDeviceFirmwareUpdateStatus(
        deviceSerial,
        firmwareVersion,
        {
          status: Status.INSTALLED,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test updateDeviceFirmwareUpdateStatus function (no device firmware)', async () => {
    jest.spyOn(deviceFirmwareRepository, 'findFirst').mockResolvedValue(null);

    try {
      const deviceSerial = '73b-015-04-2f7';
      const firmwareVersion = '1.0.0';
      await deviceActivationService.updateDeviceFirmwareUpdateStatus(
        deviceSerial,
        firmwareVersion,
        {
          status: Status.INSTALLED,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('firmware_device_firmware_not_found');
    }
  });

  test('should test updateDeviceFirmwareUpdateStatus function (firmware not in pending install status)', async () => {
    try {
      const deviceSerial = '73b-015-04-2f7';
      const firmwareVersion = '1.0.0';
      await deviceActivationService.updateDeviceFirmwareUpdateStatus(
        deviceSerial,
        firmwareVersion,
        {
          status: Status.INSTALLED,
        }
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_device_firmware_is_not_in_pending_status'
      );
    }
  });

  test('find group admin by device serial', async () => {
    await deviceActivationService.getDevice(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '73b01504-2f7'
    );
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const admin = await deviceActivationService.getGroupAdmin(
      '00886a04-7d9b-0'
    );
    expect(admin).toBeDefined();
  });

  test('group device not fount in find group admin by ', async () => {
    await deviceActivationService.getDevice(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '73b01504-2f7'
    );
    try {
      await deviceActivationService.getGroupAdmin('00886a04-7d9b-0');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });
  test('group device admin not found', async () => {
    await deviceActivationService.getDevice(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '73b01504-2f7'
    );
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUserNotAdmin]);
    try {
      await deviceActivationService.getGroupAdmin('00886a04-7d9b-0');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });
  test('group device admins list is empty', async () => {
    await deviceActivationService.getDevice(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '73b01504-2f7'
    );
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([]);
    try {
      await deviceActivationService.getGroupAdmin('00886a04-7d9b-0');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });
});

describe('Internal device by status update date', () => {
  test('successfully find disconnected devices', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(1);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDevicesByStatusUpdate'
      )
      .mockResolvedValue([mockDisconnectedDevice]);
    const devicesDto = await deviceActivationService.getDisconnectedDevices(
      new Date(),
      new Date()
    );
    expect(devicesDto.count).toBe(1);
    expect(devicesDto.devices.length).toBe(1);
  });
  test('device not found', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(0);
    try {
      const devicesDto = await deviceActivationService.getDisconnectedDevices(
        new Date(),
        new Date()
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      // @ts-ignore
      expect(error.status).toBe(404);
    }
  });
  test('too many devices found', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(1001);
    try {
      await deviceActivationService.getDisconnectedDevices(
        new Date(),
        new Date()
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      // @ts-ignore
      expect(error.status).toBe(413);
    }
  });
});
describe('Internal device by status update date', () => {
  test('successfully find disconnected devices', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(1);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDevicesByStatusUpdate'
      )
      .mockResolvedValue([mockDisconnectedDevice]);
    const devicesDto = await deviceActivationService.getDisconnectedDevices(
      new Date(),
      new Date()
    );
    expect(devicesDto.count).toBe(1);
    expect(devicesDto.devices.length).toBe(1);
  });
  test('device not found', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(0);
    try {
      await deviceActivationService.getDisconnectedDevices(
        new Date(),
        new Date()
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      // @ts-ignore
      expect(error.status).toBe(404);
    }
  });
  test('too many devices found', async () => {
    jest
      .spyOn(deviceActivationRepository, 'countDevicesByStatusUpdate')
      .mockResolvedValue(1001);
    try {
      const devicesDto = await deviceActivationService.getDisconnectedDevices(
        new Date(),
        new Date()
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      // @ts-ignore
      expect(error.status).toBe(413);
    }
  });
  test('wrong date range for get disconnected Devices', async () => {
    try {
      const now = new Date();
      await deviceActivationService.getDisconnectedDevices(
        new Date(),
        new Date(now.setHours(now.getHours() + 12))
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      // @ts-ignore
      expect(error.status).toBe(400);
    }
  });
  test('set batch is notified', async () => {
    jest
      .spyOn(deviceActivationRepository, 'updateManyIsNotified')
      .mockResolvedValue({ count: 1 });
    const updated = await deviceActivationService.setIsNotifiedBatch({
      devices: [{ deviceActivationId: 1 }],
    });
    expect(updated).toBeDefined();
    expect(updated.updatedDeviceCount).toBe(1);
  });
  test('set batch is notified with 0 devices', async () => {
    const updated = await deviceActivationService.setIsNotifiedBatch({
      devices: [],
    });
    expect(updated).toBeDefined();
    expect(updated.updatedDeviceCount).toBe(0);
  });
  test('update deviceStatusUpdatedOn by qa', async () => {
    jest
      .spyOn(deviceActivationRepository, 'updateStatusUpdateDate')
      .mockResolvedValueOnce(deviceActivationObject);
    const resp = await deviceActivationService.changeDeviceStatusUpdatedDate(
      1,
      new Date()
    );
    expect(resp.deviceName).toBe('Smart Toilet');
  });
});

describe('Get device time zone offset', () => {
  test('should test successfully getDeviceTimeZoneOffset function', async () => {
    const deviceTimeZoneOffset =
      await deviceActivationService.getDeviceTimeZoneOffset(1);
    expect(deviceTimeZoneOffset).toBe('+00:00');
  });

  test('should test getDeviceTimeZoneOffset function (no activated device)', async () => {
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);

    try {
      await deviceActivationService.getDeviceTimeZoneOffset(1);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found'
      );
    }
  });

  test('should test getDeviceTimeZoneOffset function (no time zone)', async () => {
    jest
      .spyOn(deviceActivationRepository, 'findTimeZone')
      .mockResolvedValue(null);

    try {
      await deviceActivationService.getDeviceTimeZoneOffset(1);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_time_zone_not_found'
      );
    }
  });

  test('should test successfully getDeviceToOffset function', async () => {
    const deviceToOffset = await deviceActivationService.getDeviceToOffset([1]);
    expect(deviceToOffset[1]).toBe('+00:00');
  });
});

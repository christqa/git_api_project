import prisma from '@core/prisma/prisma';
import { prismaMock } from '@core/prisma/singleton';
import firmwareRepository from '@repositories/firmware.repository';
import { IFirmware, ReleaseType, ResponseMetaData } from './firmware.type';
import firmwareService from './firmware.service';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';
import deviceActivationRepository from '@repositories/device-activation.repository';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import deviceSettingsRepository from '@repositories/device-settings.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import groupUsersRepository from '@repositories/group-users.repository';
import {
  AvailabilityType,
  GroupUserRoles,
  Status,
  Prisma,
} from '@prisma/client';
import { IUser } from '@modules/user/user.type';
import * as sqsClient from '../../lib/sqs.client';
import { SendMessageCommandOutput } from '@aws-sdk/client-sqs';

const firmwaresInternalRequest = {
  virtualFirmware: 'string',
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {
    keyPrefix: 'string',
    bucket: 'string',
    platform: 'string',
  },
  md5CheckSum: 'string',
  releaseDate: new Date(),
  availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
};

const createNewFirmwareObject = {
  id: 1,
  virtualFirmware: 'string',
  isCurrent: true,
  addedOn: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {
    keyPrefix: 'string',
    bucket: 'string',
    platform: 'string',
  },
  md5CheckSum: 'string',
  availabilityType: AvailabilityType.GRADUAL_ROLLOUT_AVAILABILITY,
  releaseDate: new Date(),
} as IFirmware;

const deviceSettingsObject = {
  id: 1,
  deviceId: 1,
  deviceSettingName: 'NFUBattPercent',
  deviceSettingType: 'DeviceSetting',
  deviceSettingValue: '50',
  addedOn: new Date(),
  updatedOn: new Date(),
};

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

const deviceInventoryExtendedObject = {
  ...deviceInventoryObject,
  deviceActivation: [deviceActivationObject],
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

const deviceFirmwareObject = {
  id: 1,
  deviceId: 1,
  firmwareId: 1,
  addedOn: new Date(),
  isCurrent: true,
  isNotified: false,
  status: Status.AWAITINGUSERAPPROVAL,
  failureLogs: '',
  updateOn: new Date(),
  approvedOn: new Date(),
};

const firmwareObject = {
  id: 1,
  virtualFirmware: '1.0.0',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {},
  md5CheckSum: '',
  availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
};

const deviceFirmwareExtendedObject = {
  ...deviceFirmwareObject,
  firmware: firmwareObject,
};

const releaseFirmwareRequestGeneral = {
  releaseType: ReleaseType.GENERAL_PUBLIC,
};

const releaseFirmwareRequestInternal = {
  releaseType: ReleaseType.INTERNAL,
  deviceSerials: ['e4b0c506-e62a-4', '8ee5d3c6-8c52-4'],
};

const releaseFirmwareRequestGradual = {
  releaseType: ReleaseType.GRADUAL,
  deviceSerials: ['e4b0c506-e62a-4', '8ee5d3c6-8c52-4'],
};

const releaseFirmwareRequestInvalidGeneral = {
  releaseType: ReleaseType.GENERAL_PUBLIC,
  deviceSerials: ['e4b0c506-e62a-4', '8ee5d3c6-8c52-4'],
};

const releaseFirmwareRequestSkipUserApprovalTrueInternal = {
  releaseType: ReleaseType.INTERNAL,
  skipUserApproval: true,
  deviceSerials: ['e4b0c506-e62a-4', '8ee5d3c6-8c52-4'],
};

const releaseFirmwareReuestSkipUserApprovalFalseGeneral = {
  releaseType: ReleaseType.GENERAL_PUBLIC,
  skipUserApproval: false,
};

const releaseFirmwareRequsetSkipUserApprovalInvalid = {
  releaseType: ReleaseType.GRADUAL,
  skipUserApproval: true,
  deviceSerials: ['e4b0c506-e62a-4', '8ee5d3c6-8c52-4'],
};

const deviceIdSerials = [
  {
    deviceId: 1,
    deviceInventory: {
      deviceSerial: 'e4b0c506-e62a-4',
    },
  },
  {
    deviceId: 2,
    deviceInventory: {
      deviceSerial: '8ee5d3c6-8c52-4',
    },
  },
];

const firmwareObjectGeneral = {
  id: 1,
  virtualFirmware: '1.0.0',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {},
  md5CheckSum: '',
  availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
};

const firmwareObjectGradual = {
  id: 1,
  virtualFirmware: '1.0.0',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {},
  md5CheckSum: '',
  availabilityType: AvailabilityType.GRADUAL_ROLLOUT_AVAILABILITY,
};

const firmwareObjectInternal = {
  id: 1,
  virtualFirmware: '1.0.0',
  isCurrent: true,
  addedOn: new Date(),
  releaseDate: new Date(),
  deviceModelId: 1,
  fileName: 'string',
  locationMetaData: {},
  md5CheckSum: '',
  availabilityType: AvailabilityType.INTERNAL_AVAILABILITY,
};

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((cb) => cb(prisma));

  jest
    .spyOn(firmwareRepository, 'findFirst')
    .mockResolvedValue(createNewFirmwareObject);
  jest
    .spyOn(firmwareRepository, 'update')
    .mockResolvedValue(createNewFirmwareObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('firmware test suit', () => {
  test('should test create firmware function', async () => {
    jest
      .spyOn(firmwareRepository, 'create')
      .mockResolvedValue(createNewFirmwareObject);
    const spiedOn = jest.spyOn(firmwareService, 'createNewFirmware');
    const request = Object.assign({}, firmwaresInternalRequest);
    await firmwareService.createNewFirmware(request);
    expect(spiedOn).toBeCalled();
  });

  test('should test create firmware function (device model not found)', async () => {
    jest.spyOn(firmwareRepository, 'create').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('test', {
        code: 'P2003',
        clientVersion: '1',
      })
    );
    try {
      const request = Object.assign({}, firmwaresInternalRequest);
      await firmwareService.createNewFirmware(request);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('firmware_device_model_not_found');
    }
  });

  test('should test create firmware function (firmware already exists)', async () => {
    jest.spyOn(firmwareRepository, 'create').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('test', {
        code: 'P2002',
        clientVersion: '1',
      })
    );
    try {
      const request = Object.assign({}, firmwaresInternalRequest);
      await firmwareService.createNewFirmware(request);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe('firmware_firmware_already_exists');
    }
  });

  test('should test update firmware availability function', async () => {
    const result = await firmwareService.updateFirmwareAvailability('1.0.0', {
      availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
    });
    expect(result).toBeUndefined();
  });

  test('should test update firmware availability function (error no firmware found)', async () => {
    jest.spyOn(firmwareRepository, 'findFirst').mockResolvedValue(null);

    try {
      await firmwareService.updateFirmwareAvailability('1.0.0', {
        availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('firmware_not_found');
    }
  });

  test('should test update firmware availability function (error invalid current availability type)', async () => {
    jest.spyOn(firmwareRepository, 'findFirst').mockResolvedValue({
      ...createNewFirmwareObject,
      availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
    });

    try {
      await firmwareService.updateFirmwareAvailability('1.0.0', {
        availabilityType: AvailabilityType.GENERAL_AVAILABILITY,
      });
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_firmware_availability_is_not_gradual_rollout_availability'
      );
    }
  });

  test('should test sendDeviceNewFirmwareMessageToGroupAdmins function', async () => {
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const apiSQSResp = {
      $metadata: {
        newFirmwareVersion: 1,
        batteryLevel: deviceSettingsObject.deviceSettingValue,
      } as ResponseMetaData,
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);

    const resp =
      await firmwareService.sendDeviceNewFirmwareMessageToGroupAdmins({
        deviceId: deviceInventoryObject.id,
        deviceSerial: deviceInventoryObject.deviceSerial,
        firmwareId: deviceFirmwareExtendedObject.firmware.id,
        virtualFirmware: deviceFirmwareExtendedObject.firmware.virtualFirmware,
      });
    if (resp) {
      expect(resp[0].MessageId).toBe('1');
      const extenedResp = resp[0].$metadata as ResponseMetaData;
      expect(extenedResp.newFirmwareVersion).toBe(1);
      expect(extenedResp.batteryLevel).toBe(
        deviceSettingsObject.deviceSettingValue
      );
    }
  });

  test('should test releaseFirmare function (successful general release)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectGeneral);
    jest
      .spyOn(
        deviceActivationRepository,
        'findAllActivatedDeviceIdSerialsByDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    jest
      .spyOn(deviceFirmwareRepository, 'createMany')
      .mockResolvedValue({ count: 2 });
    jest
      .spyOn(firmwareRepository, 'updateMany')
      .mockResolvedValue({ count: 1 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const apiSQSResp = {
      $metadata: {
        newFirmwareVersion: 1,
        batteryLevel: deviceSettingsObject.deviceSettingValue,
      },
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
    const spiedOn = jest.spyOn(firmwareService, 'releaseFirmware');
    await firmwareService.releaseFirmware(
      '1.0.0',
      releaseFirmwareRequestGeneral
    );
    expect(spiedOn).toBeCalled();
  });

  test('should test releaseFirmare function (successful gradual release)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectGradual);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    jest
      .spyOn(deviceFirmwareRepository, 'createMany')
      .mockResolvedValue({ count: 2 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const apiSQSResp = {
      $metadata: {
        newFirmwareVersion: 1,
        batteryLevel: deviceSettingsObject.deviceSettingValue,
      },
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
    const spiedOn = jest.spyOn(firmwareService, 'releaseFirmware');
    await firmwareService.releaseFirmware(
      '1.0.0',
      releaseFirmwareRequestGradual
    );
    expect(spiedOn).toBeCalled();
  });

  test('should test releaseFirmare function (successful internal release)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectInternal);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    jest
      .spyOn(deviceFirmwareRepository, 'createMany')
      .mockResolvedValue({ count: 2 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const apiSQSResp = {
      $metadata: {
        newFirmwareVersion: 1,
        batteryLevel: deviceSettingsObject.deviceSettingValue,
      },
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
    const spiedOn = jest.spyOn(firmwareService, 'releaseFirmware');
    await firmwareService.releaseFirmware(
      '1.0.0',
      releaseFirmwareRequestInternal
    );
    expect(spiedOn).toBeCalled();
  });

  test('should test releaseFirmware function (error, release type device serial bad request)', async () => {
    try {
      await firmwareService.releaseFirmware(
        '1.0.0',
        releaseFirmwareRequestInvalidGeneral
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_release_type_device_serials_not_matched'
      );
    }
  });

  test('shoudl test releaseFirmware function (error, firmware not found)', async () => {
    jest.spyOn(firmwareRepository, 'findFirst').mockResolvedValue(null);
    try {
      await firmwareService.releaseFirmware(
        '1.0.1',
        releaseFirmwareRequestGeneral
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('firmware_not_found');
    }
  });

  test('should test releaseFirmware function (error, release type does not match firmware availability type)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectInternal);
    try {
      await firmwareService.releaseFirmware(
        '1.0.1',
        releaseFirmwareRequestGeneral
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_release_type_firmware_availability_type_not_matched'
      );
    }
  });

  test('should test releaseFirmware function (error, general release, no activated device)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectGeneral);
    jest
      .spyOn(
        deviceActivationRepository,
        'findAllActivatedDeviceIdSerialsByDeviceModelId'
      )
      .mockResolvedValue([]);
    try {
      await firmwareService.releaseFirmware(
        '1.0.0',
        releaseFirmwareRequestGeneral
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

  test('should test releaseFirmware function (error, no activated device with invalid serials displayed)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectInternal);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue([
        { deviceId: 11, deviceInventory: { deviceSerial: '8ee5d3c6-8c52-4' } },
      ]);
    try {
      await firmwareService.releaseFirmware(
        '1.0.0',
        releaseFirmwareRequestInternal
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found_with_invalid_serials'
      );
    }
  });

  test('should test releaseFirmware function (error, internal release, no activated device)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectInternal);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue([]);
    try {
      await firmwareService.releaseFirmware(
        '1.0.0',
        releaseFirmwareRequestInternal
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe(
        'device_activation_activated_device_not_found_with_invalid_serials'
      );
    }
  });

  test('should test releaseFirmare function (successful internal release, skip user approval = true)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectInternal);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    jest
      .spyOn(deviceFirmwareRepository, 'createMany')
      .mockResolvedValue({ count: 2 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    const spiedOn = jest.spyOn(firmwareService, 'releaseFirmware');
    await firmwareService.releaseFirmware(
      '1.0.0',
      releaseFirmwareRequestSkipUserApprovalTrueInternal
    );
    expect(spiedOn).toBeCalled();
  });

  test('should test releaseFirmare function (successful general release with skipUserApproval set to false)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectGeneral);
    jest
      .spyOn(
        deviceActivationRepository,
        'findAllActivatedDeviceIdSerialsByDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    jest
      .spyOn(deviceFirmwareRepository, 'createMany')
      .mockResolvedValue({ count: 2 });
    jest
      .spyOn(firmwareRepository, 'updateMany')
      .mockResolvedValue({ count: 1 });
    jest
      .spyOn(deviceSettingsRepository, 'findFirst')
      .mockResolvedValue(deviceSettingsObject);
    jest.spyOn(deviceActivationRepository, 'findFirst').mockResolvedValue(null);
    jest
      .spyOn(groupDevicesRepository, 'findFirst')
      .mockResolvedValue(groupDeviceObject);
    jest
      .spyOn(groupUsersRepository, 'groupUsersFindMany')
      .mockResolvedValue([groupUser]);
    const apiSQSResp = {
      $metadata: {
        newFirmwareVersion: 1,
        batteryLevel: deviceSettingsObject.deviceSettingValue,
      },
      MessageId: '1',
    };
    jest
      .spyOn(sqsClient, 'publishMessageSQS')
      .mockResolvedValue(apiSQSResp as SendMessageCommandOutput);
    const spiedOn = jest.spyOn(firmwareService, 'releaseFirmware');
    await firmwareService.releaseFirmware(
      '1.0.0',
      releaseFirmwareReuestSkipUserApprovalFalseGeneral
    );
    expect(spiedOn).toBeCalled();
  });

  test('should test releaseFirmware function (error, cannot skipUserApproval)', async () => {
    jest
      .spyOn(firmwareRepository, 'findFirst')
      .mockResolvedValue(firmwareObjectGradual);
    jest
      .spyOn(
        deviceActivationRepository,
        'findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId'
      )
      .mockResolvedValue(deviceIdSerials);
    try {
      await firmwareService.releaseFirmware(
        '1.0.0',
        releaseFirmwareRequsetSkipUserApprovalInvalid
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.BAD_REQUEST);
      expect(error?.localised.key).toBe(
        'firmware_can_only_skip_user_approval_for_internal_firmware'
      );
    }
  });
});

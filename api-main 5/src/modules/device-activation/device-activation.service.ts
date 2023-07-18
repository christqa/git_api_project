import {
  DeviceStatus,
  EventSource,
  GroupUserRoles,
  Groups,
  PrismaClient,
  Status,
} from '@prisma/client';
import prisma from '@core/prisma/prisma';
import httpStatus from 'http-status';
import {
  deviceInventoryService,
  groupsService,
  userService,
  deviceSettingsService,
} from '@modules/index/index.service';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import deviceActivationRepository from '@repositories/device-activation.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import {
  deviceAlreadyActivated,
  noActivatedDevice,
  noUserDevice,
  noTimeZone,
  deviceNameNotUnique,
  noGroupAdmin,
  noDisconnectedDevice,
  tooManyDisconnectedDevices,
  wrongDateRange,
  batteryLevelNotEnough,
  deviceInventoryIsVoid,
} from './device-activation.error';
import {
  IDeviceActivation,
  IDeviceActivationStatusTypes,
  IDeviceActivationWithGroupAdmins,
  IGroupDevice,
  IGroupUser,
} from './device-activation.type';
import {
  IActivateDeviceRequestDto,
  IDeactivateDeviceRequestDto,
  IGetDeviceStatusRequestDto,
  IGetDeviceStatusResponseDto,
  IGetUserDevicesInternalResponseDto,
  IUpdateActivatedDeviceRequestDto,
  IUpdateDeviceBatteryStatusInternalRequestDto,
  IDisconnectedDevicesDto,
  DisconnectedDevice,
  ISetIsNotifiedBatchRequestDto,
  ISetIsNotifiedBatchResponseDto,
  IAcceptDeviceFirmwareUpdateRequestDto,
  IGetDeviceFirmwareUpdateRequestDto,
  IGetDeviceFirmwareUpdateResponseDto,
  IUpdateDeviceFirmwareUpdateStatusRequestDto,
  IDeactivateDeviceInternalRequestDto,
} from './dtos/device-activation.index.dto';
import ApiError from '@core/error-handling/api-error';
import { IDeviceInventoryUserActiveDevice } from '@modules/device-inventory/device-inventory.type';
import { getDateWithFormat } from '@utils/date.util';
import { v4 as uuidv4 } from 'uuid';
import groupUsersRepository from '@repositories/group-users.repository';
import {
  IGetGroupAdminByDeviceSerialResponseDto,
  IGroupAdmin,
} from '@modules/device-activation/dtos/get-group-admin-by-device-serial.response.dto';
import { getAllGlobalSettings } from '@modules/global-settings/global-settings.service';
import {
  ICreateManyDeviceSettingsRequestDto,
  ICreateDeviceSettingsRequestType,
} from '@modules/device-settings/dtos/create-device-settings.dto';
import firmwareService from '@modules/firmware/firmware.service';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import * as sqsClient from '../../lib/sqs.client';
import logger from '@core/logger/logger';
import moment from 'moment';
import momentTz from 'moment-timezone';
import { userNotFound } from '@modules/user/user.error';
import {
  groupUserNotAuthorizedPreconditionFailed,
  notAuthorized,
} from '@modules/groups/groups.error';
import { noDevice } from '@modules/device-inventory/device-inventory.error';
import {
  deviceFirmwareNotInPendingStatus,
  noDeviceFirmware,
  userAlreadyAcceptedDeviceFirmware,
} from '@modules/firmware/firmware.error';
import { findDeviceSettingByIdAndName } from '@modules/device-settings/device-settings.service';
import deviceSettingsRepository from '@repositories/device-settings.repository';
import { IDeviceSettings } from '@modules/device-settings/device-settings.type';
import { IDeviceFirmware } from '@modules/firmware/firmware.type';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const validateGroupUserNotAuthorized = async (
  groups: Groups[],
  userGuid: string
) => {
  for (const group of groups) {
    const groupUser = await groupsService.getGroupUser(userGuid, group.id!);
    if (groupUser.role !== GroupUserRoles.admin) {
      throw groupUserNotAuthorizedPreconditionFailed();
    }
  }
};

const activateDevice = async (
  userGuid: string,
  activateDeviceRequestDto: IActivateDeviceRequestDto
): Promise<void> => {
  // mock device activation (this part will be removed in January)
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  let deviceFirmware: IDeviceFirmware | null = null;
  if (activateDeviceRequestDto.deviceSerial === '000-000-000') {
    const deviceFromInventory = await deviceInventoryRepository.create({
      deviceSerial: uuidv4().substring(0, 15),
      manufacturingDate: new Date(),
      deviceModelId: 1, // Device model changed from a string form to a table in the database thus the usage of deviceModelId.
    });
    activateDeviceRequestDto.deviceSerial = deviceFromInventory.deviceSerial;
    deviceFirmware = await deviceFirmwareRepository.create({
      firmwareId: 1,
      isCurrent: true,
      deviceId: deviceFromInventory.id,
      status: Status.INSTALLED,
    });
  }

  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(
    activateDeviceRequestDto.deviceSerial
  );
  if (device.deviceStatus === DeviceStatus.VOID) {
    throw deviceInventoryIsVoid();
  }

  // get/check group
  const group = await groupsService.getGroup(activateDeviceRequestDto.groupId);

  // check if device is already activated
  const deviceActivated = await deviceActivationRepository.findFirst({
    deviceId: device.id,
  });
  if (deviceActivated) {
    throw deviceAlreadyActivated();
  }
  // validate if user is admin of the groups
  await validateGroupUserNotAuthorized([group], user.userGuid);

  // check uniqueness of the device name within selected group
  await checkDeviceNameUnique(activateDeviceRequestDto.deviceName, group.id);

  // check tz
  await checkTimeZoneIsExist(activateDeviceRequestDto.timeZoneId);

  // get current device firmware id if not present
  if (!deviceFirmware) {
    const getDeviceCurrentFirmware =
      await firmwareService.getDeviceCurrentFirmwareVersion(device.id);
    deviceFirmware = getDeviceCurrentFirmware;
  }

  // get current firmware by device model id
  const getDevicePendingFirmwares =
    await firmwareService.getDevicePendingFirmwareVersions(device.id);
  const devicePendingFirmwareIds = getDevicePendingFirmwares.map(
    (item) => item.firmwareId
  );
  const getCurrentFirmware = await firmwareService.getCurrentFirmwareVersion(
    device.deviceModelId
  );
  const isNewFirmwareAvailable =
    getCurrentFirmware &&
    deviceFirmware &&
    getCurrentFirmware.id > deviceFirmware.firmwareId &&
    !devicePendingFirmwareIds.includes(getCurrentFirmware.id);

  // activate device
  await prisma.$transaction(async (prismaClient) => {
    const prismaTr = prismaClient as PrismaClient;

    // activate device
    await deviceActivationRepository.create(
      {
        deviceId: device.id,
        activatedBy: userId,
        timeZoneId: activateDeviceRequestDto.timeZoneId,
        deviceName: activateDeviceRequestDto.deviceName,
        deviceModelId: device.deviceModelId,
        deviceStatus: {}, //this field is not used anymore
        deviceFirmwareId: deviceFirmware?.id,
      },
      prismaTr
    );

    // add activated device to group devices
    await groupDevicesRepository.create(
      {
        groupId: group.id,
        deviceId: device.id,
        addedBy: userId,
      },
      prismaTr
    );

    // add new firmware to device firmware
    if (isNewFirmwareAvailable) {
      await deviceFirmwareRepository.create({
        firmwareId: getCurrentFirmware.id,
        deviceId: device.id,
      });
    }
  });

  // copy global settings to device settings
  await createDefaultDeviceSettings(activateDeviceRequestDto.deviceSerial);

  // trigger group admin notification
  if (isNewFirmwareAvailable) {
    firmwareService.sendDeviceNewFirmwareMessageToGroupAdmins({
      deviceId: device.id,
      deviceSerial: device.deviceSerial,
      firmwareId: getCurrentFirmware.id,
      virtualFirmware: getCurrentFirmware.virtualFirmware,
    });
  }
};

const updateActivatedDevice = async (
  userGuid: string,
  updateActivatedDeviceRequestDto: IUpdateActivatedDeviceRequestDto
): Promise<void> => {
  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(
    updateActivatedDeviceRequestDto.deviceSerial
  );

  // check if device is activated
  const activatedDevice = await checkIfDeviceIsActivated(device.id);

  // get group
  const groupDevice = await groupDevicesRepository.findFirst({
    deviceId: device.id,
  });
  if (!groupDevice) {
    throw noActivatedDevice();
  }

  // get/check group user
  const groupUser = await groupsService.getGroupUser(
    userGuid,
    groupDevice.groupId
  );

  // permissions check
  groupsService.isAuthorized(groupUser.role);

  // check uniqueness of the device name within selected group
  await checkDeviceNameUnique(
    updateActivatedDeviceRequestDto.deviceName,
    groupDevice.groupId,
    device.id
  );

  // updated activated device
  await checkTimeZoneIsExist(updateActivatedDeviceRequestDto.timeZoneId);
  await deviceActivationRepository.update(
    { id: activatedDevice.id },
    {
      timeZoneId: updateActivatedDeviceRequestDto.timeZoneId,
      deviceName: updateActivatedDeviceRequestDto.deviceName,
    }
  );
};

const deactivateDevice = async (
  userGuid: string,
  deactivateDeviceRequestDto: IDeactivateDeviceRequestDto
): Promise<void> => {
  // retrieve device from the inventory
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const device = await deviceInventoryService.getDevice(
    deactivateDeviceRequestDto.deviceSerial
  );

  // check if device is activated
  const activatedDevice = await checkIfDeviceIsActivated(device.id);

  // check if device is in use and user has access to the device
  await checkDeviceUseByUser(device.id, user.id, GroupUserRoles.admin);

  // deactivate device (soft-delete)
  await prisma.$transaction(async (prismaClient) => {
    const prismaTr = prismaClient as PrismaClient;

    // remove activated device
    await deviceActivationRepository.update(
      { id: activatedDevice.id },
      {
        deactivatedBy: userId,
      },
      prismaTr
    );
    await deviceActivationRepository.removeSoftDelete(
      {
        id: activatedDevice.id,
      },
      prismaTr
    );

    // remove device from group devices
    await groupDevicesRepository.update(
      {
        deviceId: activatedDevice.deviceId,
      },
      { removedBy: userId },
      prismaTr
    );
    await groupDevicesRepository.remove(
      {
        deviceId: activatedDevice.deviceId,
      },
      prismaTr
    );

    // remove device settings
    await deviceSettingsRepository.updateMany(
      { deviceId: activatedDevice.deviceId },
      {
        removedBy: userId,
      } as IDeviceSettings,
      prismaTr
    );
    await deviceSettingsRepository.removeManySoftDelete(
      {
        deviceId: activatedDevice.deviceId,
      },
      prismaTr
    );
  });
};

const deactivateDeviceInternal = async (
  deviceSerial: string,
  deactivateDeviceInternalRequestDto: IDeactivateDeviceInternalRequestDto
): Promise<void> => {
  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(deviceSerial);

  // check if device is activated
  const activatedDevice = await checkIfDeviceIsActivated(device.id);

  // deactivate device (soft-delete)
  await prisma.$transaction(async (prismaClient) => {
    const prismaTr = prismaClient as PrismaClient;

    // remove activated device
    await deviceActivationRepository.removeSoftDelete(
      {
        id: activatedDevice.id,
      },
      prismaTr
    );
    await deviceActivationRepository.update(
      { id: activatedDevice.id },
      {
        deleted: moment
          .unix(deactivateDeviceInternalRequestDto.timestamp)
          .toDate(),
      },
      prismaTr
    );

    // remove device from group devices
    await groupDevicesRepository.remove(
      {
        deviceId: activatedDevice.deviceId,
      },
      prismaTr
    );

    // remove device settings
    await deviceSettingsRepository.removeManySoftDelete(
      {
        deviceId: activatedDevice.deviceId,
      },
      prismaTr
    );
  });
};

const checkDeviceNameUnique = async (
  deviceName: string,
  groupId: number,
  deviceId?: number
): Promise<void> => {
  // check uniqueness of the device name within selected group
  const groupDeviceNameUniqueness = await groupDevicesRepository.findFirst({
    groupId,
    deviceId: deviceId ? { not: deviceId } : undefined,
    deleted: null,
    deviceInventory: {
      deviceActivation: {
        some: {
          deviceName: {
            equals: deviceName,
            mode: 'insensitive',
          },
          deleted: null,
        },
      },
    },
  });
  if (groupDeviceNameUniqueness) {
    throw deviceNameNotUnique();
  }
};

const checkTimeZoneIsExist = async (timeZoneId: number): Promise<void> => {
  const timeZone = await deviceActivationRepository.findTimeZone(timeZoneId);
  if (!timeZone) {
    throw noTimeZone();
  }
};

const checkIfDeviceIsActivated = async (
  deviceId: number
): Promise<IDeviceActivation> => {
  const activatedDevice = await deviceActivationRepository.findFirst({
    deviceId,
  });
  if (!activatedDevice) {
    throw noActivatedDevice();
  }

  return activatedDevice;
};

const findDevices = async (
  userId: number
): Promise<IGetUserDevicesInternalResponseDto[]> => {
  const userDevices = await deviceInventoryRepository.findManyUserActiveDevices(
    userId
  );
  return userDevices.map(formatDeviceResponse);
};

const getDevice = async (
  userGuid: string,
  deviceSerial: string
): Promise<IGetUserDevicesInternalResponseDto> => {
  // retrieve device from the inventory
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const device = await deviceInventoryService.getDevice(deviceSerial);
  const userDevice = await deviceInventoryRepository.findOneUserActiveDevice(
    userId,
    device.id
  );
  if (!userDevice) {
    throw noUserDevice();
  }

  return formatDeviceResponse(userDevice);
};

const formatDeviceResponse = (
  device: IDeviceInventoryUserActiveDevice
): IGetUserDevicesInternalResponseDto => {
  const activatedDevice = device?.deviceActivation[0];

  return {
    deviceSerial: device.deviceSerial,
    deviceName: activatedDevice.deviceName,
    timeZoneId: activatedDevice.timeZoneId,
    activatedOn: getDateWithFormat({
      date: activatedDevice.activatedOn,
      format: DATE_FORMAT_ISO8601,
    }),
    timeZoneOffset: momentTz()
      .utc()
      .tz(activatedDevice.timeZone?.text || 'GMT')
      .format('Z'),
  } as IGetUserDevicesInternalResponseDto;
};

const getDeviceStatus = async (
  getDeviceStatusRequestDto: IGetDeviceStatusRequestDto
): Promise<IGetDeviceStatusResponseDto> => {
  try {
    // retrieve device from the inventory
    const device = await deviceInventoryService.getDevice(
      getDeviceStatusRequestDto.deviceSerial
    );

    // check if device is activated
    const deviceActivation =
      await deviceActivationRepository.findActivatedDevice(device.id);

    if (!deviceActivation) {
      return {
        status: IDeviceActivationStatusTypes.NOT_ACTIVATED,
        deviceName: '',
      };
    }

    // check if device is in use
    const deviceInUse = await groupDevicesRepository.findFirst({
      deviceId: device.id,
    });
    if (deviceInUse) {
      return {
        status: IDeviceActivationStatusTypes.ALREADY_IN_USED,
        deviceName: deviceActivation.deviceName,
      };
    }

    // device is available
    return {
      status: IDeviceActivationStatusTypes.AVAILABLE,
      deviceName: deviceActivation.deviceName,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === httpStatus.NOT_FOUND) {
      return {
        status: IDeviceActivationStatusTypes.INVALID_DEVICE,
        deviceName: '',
      };
    }
    throw error;
  }
};

const acceptDeviceFirmwareUpdate = async (
  userGuid: string,
  acceptDeviceFirmwareUpdateRequestDto: IAcceptDeviceFirmwareUpdateRequestDto
): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(
    acceptDeviceFirmwareUpdateRequestDto.deviceSerial
  );

  // check if device is activated
  const deviceActivated = await checkIfDeviceIsActivated(device.id);

  // check if device is in use and user has access to the device
  await checkDeviceUseByUser(device.id, user.id, GroupUserRoles.admin);

  const deviceSetting = await findDeviceSettingByIdAndName(
    device.id,
    'NFUBattPercent'
  );
  const NFUBattPercent = deviceSetting.deviceSettingValue as number;

  if (deviceActivated.batteryStatus < NFUBattPercent) {
    throw batteryLevelNotEnough(`${NFUBattPercent}`);
  }

  // get/check firmware
  const deviceFirmware = await deviceFirmwareRepository.findFirst({
    deviceId: device.id,
    isCurrent: false,
    firmware: {
      virtualFirmware: acceptDeviceFirmwareUpdateRequestDto.virtualFirmware,
    },
  });
  if (!deviceFirmware) {
    throw noDeviceFirmware();
  }
  if (deviceFirmware.status !== Status.AWAITINGUSERAPPROVAL) {
    throw userAlreadyAcceptedDeviceFirmware();
  }

  // accept firmware update
  await deviceFirmwareRepository.update(
    { id: deviceFirmware.id },
    { status: Status.PENDINGINSTALL }
  );
};

const getActivatedDevice = async (userGuid: string, deviceSerial: string) => {
  // retrieve device from the inventory
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const device = await deviceInventoryService.getDevice(deviceSerial);

  // check if device is in use and user has access to the device
  await checkDeviceUseByUser(device.id, user.id);

  // retrieve device
  const activatedDevice = await deviceActivationRepository.findActivatedDevice(
    device.id
  );
  if (!activatedDevice) {
    throw noDevice();
  }

  const newFirmwareVersion = await firmwareService.getDeviceNewFirmwareVersion(
    device.id,
    activatedDevice.deviceFirmware?.firmware?.id
  );
  return {
    deviceSerial: activatedDevice.deviceInventory.deviceSerial,
    deviceName: activatedDevice.deviceName,
    timeZoneId: activatedDevice.timeZoneId,
    activatedOn: getDateWithFormat({
      date: activatedDevice.activatedOn,
      format: 'YYYY-MM-DDTHH:mm:ssZ',
    }),
    batteryStatus: groupsService.getBatteryStatus(
      activatedDevice.batteryStatus
    ),
    batteryPercentage: activatedDevice.batteryStatus,
    wiFiSSID: activatedDevice.wiFiSSID,
    connectionStatus: groupsService.getConnectionStatus(activatedDevice.rssi),
    bleMacAddress: activatedDevice.deviceInventory.bleMacAddress,
    firmwareVersion: activatedDevice.deviceFirmware
      ? activatedDevice.deviceFirmware.firmware.virtualFirmware
      : null,
    newFirmwareVersion: newFirmwareVersion
      ? newFirmwareVersion.firmware.virtualFirmware
      : null,
    isFwUpdateRequired: newFirmwareVersion ? true : false,
  };
};

const updateDeviceBatteryStatus = async (
  updateDeviceBatteryStatusRequestDto: IUpdateDeviceBatteryStatusInternalRequestDto
): Promise<void> => {
  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(
    updateDeviceBatteryStatusRequestDto.deviceSerial
  );

  // check if device is activated
  const activatedDevice = await checkIfDeviceIsActivated(device.id);

  // updated activated device battery status
  await deviceActivationRepository.update(
    { id: activatedDevice.id },
    {
      batteryStatus: updateDeviceBatteryStatusRequestDto.batteryStatus,
      wiFiSSID: updateDeviceBatteryStatusRequestDto.wiFiSSID,
      rssi: updateDeviceBatteryStatusRequestDto.signalStrength,
      deviceStatusUpdatedOn: new Date(),
      isNotified: false,
    }
  );
};

const getGroupAdmin = async (
  deviceSerial: string
): Promise<IGetGroupAdminByDeviceSerialResponseDto> => {
  const device = await deviceInventoryService.getDevice(deviceSerial);
  const groupDevice = await groupDevicesRepository.findFirst({
    deviceId: device.id,
  });
  if (!groupDevice) {
    throw noActivatedDevice();
  }
  const groupUsers = await groupUsersRepository.groupUsersFindMany({
    groupId: groupDevice.groupId,
    deleted: null,
    role: GroupUserRoles.admin,
  });
  if (!groupUsers || groupUsers.length === 0) {
    throw noGroupAdmin();
  }
  return {
    admins: groupUsers.map((admin) => ({
      id: admin.user.id,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      email: admin.user.email,
      userGuid: admin.user.userGuid,
      profileId: admin.user.profile.id,
    })),
  };
};

const getDisconnectedDevices = async (
  to: Date,
  from?: Date
): Promise<IDisconnectedDevicesDto> => {
  if (from && moment(from).isAfter(to)) {
    throw wrongDateRange();
  }
  const count = await deviceActivationRepository.countDevicesByStatusUpdate(
    to,
    from
  );
  if (count === 0) {
    throw noDisconnectedDevice();
  }
  if (count >= 1000) {
    throw tooManyDisconnectedDevices();
  }
  const disconnectedDevices: IDeviceActivationWithGroupAdmins[] =
    await deviceActivationRepository.findManyActivatedDevicesByStatusUpdate(
      to,
      from
    );
  const devices: DisconnectedDevice[] = disconnectedDevices.map(
    (deviceItem: IDeviceActivationWithGroupAdmins) => ({
      id: deviceItem.id,
      deviceSerial: deviceItem.deviceInventory.deviceSerial,
      deviceName: deviceItem.deviceName,
      deviceStatusUpdatedOn: deviceItem.deviceStatusUpdatedOn,
      deviceAdmins: deviceItem.deviceInventory.groupDevices.flatMap(
        (device: IGroupDevice) => {
          const returnValue: IGroupAdmin[] = [];
          device.group.groupUsers.forEach((item: IGroupUser) => {
            // The Prisma types are not recognized properly
            returnValue.push({
              // @ts-ignore
              firstName: item.user.firstName, // @ts-ignore
              lastName: item.user.lastName, // @ts-ignore
              email: item.user.email, // @ts-ignore
              userGuid: item.user.userGuid, // @ts-ignore
              profileId: item.user.profile?.id, // profile can be null!
            });
          });
          return returnValue;
        }
      ),
    })
  );
  return {
    count,
    devices,
  };
};

const sendDeviceNoConnectivityMessageToAdmins = async (
  disconnectedDevice: DisconnectedDevice[]
) => {
  try {
    disconnectedDevice.forEach(async (device: DisconnectedDevice) => {
      const groupAdminsWithProfile: IGroupAdmin[] = [];
      device.deviceAdmins.forEach((admin: IGroupAdmin) => {
        if (admin.profileId) {
          groupAdminsWithProfile.push(admin);
        }
      });

      if (!groupAdminsWithProfile.length) {
        return;
      }
      // send sqs messages
      await Promise.all(
        groupAdminsWithProfile.map((groupAdmin) => {
          sqsClient.publishMessageSQS({
            default: `deviceSerial:${device.deviceSerial}|group:Device|type:DeviceNoConnection12hrs`,
            deviceSerial: device.deviceSerial,
            profileId: groupAdmin.profileId,
            eventSource: EventSource.SystemGenerated,
            group: 'Device',
            type: 'DeviceNoConnection12hrs',
            data: [
              {
                deviceName: device.deviceName,
                deviceSerial: device.deviceSerial,
                emailRecipient: groupAdmin.email,
                firstName: groupAdmin.firstName,
              },
            ],
          });
        })
      );
    });
  } catch (error) {
    logger.error(`Failed to send device no connection sqs message, ${error}`);
  }
};

const setIsNotifiedBatch = async (
  requestBody: ISetIsNotifiedBatchRequestDto
): Promise<ISetIsNotifiedBatchResponseDto> => {
  if (requestBody.devices.length === 0) {
    return { updatedDeviceCount: 0 };
  }
  const { count } = await deviceActivationRepository.updateManyIsNotified(
    requestBody.devices.map((device) => device.deviceActivationId)
  );
  return { updatedDeviceCount: count };
};

const changeDeviceStatusUpdatedDate = async (
  deviceActivationId: number,
  date: Date
) => {
  return deviceActivationRepository.updateStatusUpdateDate(
    deviceActivationId,
    date
  );
};

const createDefaultDeviceSettings = async (deviceSerial: string) => {
  // get all global settings
  try {
    const globalSettings = await getAllGlobalSettings();
    const deviceSettingsData = globalSettings.map((globalSetting) => {
      return {
        deviceSettingName: globalSetting.settingName,
        deviceSettingType: globalSetting.settingType,
        deviceSettingValue: globalSetting.settingValue,
      } as ICreateDeviceSettingsRequestType;
    });

    const data = {
      deviceSerial: deviceSerial,
      deviceSettings: deviceSettingsData,
    } as ICreateManyDeviceSettingsRequestDto;

    await deviceSettingsService.createMany(data);
  } catch (error) {
    logger.error(`Failed to create default device settings, ${error}`);
  }
};

const checkDeviceUseByUser = async (
  deviceId: number,
  userId: number,
  role?: GroupUserRoles
) => {
  const deviceInUse = await groupDevicesRepository.findFirst({
    deviceId,
    group: {
      deleted: null,
      groupUsers: {
        some: {
          userId,
          deleted: null,
          role,
        },
      },
    },
  });
  if (!deviceInUse) {
    throw notAuthorized();
  }
};

const getDeviceFirmwareUpdate = async (
  getDeviceFirmwareUpdateRequestDto: IGetDeviceFirmwareUpdateRequestDto
): Promise<IGetDeviceFirmwareUpdateResponseDto | undefined> => {
  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(
    getDeviceFirmwareUpdateRequestDto.deviceSerial
  );

  // check if device is activated
  await checkIfDeviceIsActivated(device.id);

  // retrieve firmware update available for the device serial number which have the status PENDING_INSTALL
  const deviceFirmwareUpdate = await deviceFirmwareRepository.findFirst({
    deviceId: device.id,
    status: Status.PENDINGINSTALL,
  });

  if (!deviceFirmwareUpdate) {
    return;
  }

  return {
    deviceSerial: device.deviceSerial,
    virtualFwVersion: deviceFirmwareUpdate.firmware.virtualFirmware,
    filename: deviceFirmwareUpdate.firmware.fileName,
    locationMetadata: deviceFirmwareUpdate.firmware.locationMetaData,
    md5Checksum: deviceFirmwareUpdate.firmware.md5CheckSum,
  };
};

const updateDeviceFirmwareUpdateStatus = async (
  deviceSerial: string,
  firmwareVersion: string,
  updateDeviceFirmwareUpdateStatusRequestDto: IUpdateDeviceFirmwareUpdateStatusRequestDto
) => {
  // retrieve device from the inventory
  const device = await deviceInventoryService.getDevice(deviceSerial);

  // check if device is activated
  const activatedDevice = await checkIfDeviceIsActivated(device.id);

  // retrieve firmware update available for the device serial number which have the status PENDING_INSTALL
  const deviceFirmwareUpdate = await deviceFirmwareRepository.findFirst({
    deviceId: device.id,
    firmware: {
      virtualFirmware: firmwareVersion,
    },
  });

  // checks
  if (!deviceFirmwareUpdate) {
    throw noDeviceFirmware();
  }

  if (deviceFirmwareUpdate.status !== Status.PENDINGINSTALL) {
    throw deviceFirmwareNotInPendingStatus();
  }

  // update device firmware update status
  // FAILED case
  if (updateDeviceFirmwareUpdateStatusRequestDto.status === Status.FAILED) {
    await deviceFirmwareRepository.update(
      { id: deviceFirmwareUpdate.id },
      {
        status: Status.FAILED,
        failureLogs: updateDeviceFirmwareUpdateStatusRequestDto.failureLogs,
      }
    );
    return;
  }

  // INSTALLED case
  await prisma.$transaction(async (prismaClient) => {
    const prismaTr = prismaClient as PrismaClient;
    await deviceFirmwareRepository.updateMany(
      { deviceId: device.id },
      { isCurrent: false },
      prismaTr
    );
    await deviceFirmwareRepository.update(
      { id: deviceFirmwareUpdate.id },
      {
        status: Status.INSTALLED,
        isCurrent: true,
      },
      prismaTr
    );
    await deviceActivationRepository.update(
      { id: activatedDevice.id },
      {
        deviceFirmwareId: deviceFirmwareUpdate.id,
      },
      prismaTr
    );
  });
};

const getDeviceToOffset = async (
  deviceIds: number[]
): Promise<{ [deviceId: number]: string }> => {
  const uniqueDeviceIds = deviceIds.filter(
    (value, index, self) => self.indexOf(value) === index
  );

  const devicesTimeZoneOffsets = await Promise.all(
    uniqueDeviceIds.map(async (deviceId) => ({
      deviceId,
      offset: await getDeviceTimeZoneOffset(deviceId),
    }))
  );

  const deviceToOffsetMap: { [deviceId: number]: string } = {};
  devicesTimeZoneOffsets.forEach((item) => {
    deviceToOffsetMap[item.deviceId] = item.offset;
  });

  return deviceToOffsetMap;
};

const getDeviceTimeZoneOffset = async (deviceId: number): Promise<string> => {
  // get activated device
  const device = await deviceActivationRepository.findFirst({
    deviceId,
  });
  if (!device) {
    throw noActivatedDevice();
  }

  // get time zone
  const timeZone = await deviceActivationRepository.findTimeZone(
    device.timeZoneId
  );
  if (!timeZone) {
    throw noTimeZone();
  }

  return momentTz().utc().tz(timeZone.text).format('Z'); // e.g. +03:00 / -05:00
};

export {
  activateDevice,
  updateActivatedDevice,
  deactivateDevice,
  deactivateDeviceInternal,
  checkIfDeviceIsActivated,
  findDevices,
  getDevice,
  getDeviceStatus,
  acceptDeviceFirmwareUpdate,
  getActivatedDevice,
  updateDeviceBatteryStatus,
  getGroupAdmin,
  sendDeviceNoConnectivityMessageToAdmins,
  getDisconnectedDevices,
  setIsNotifiedBatch,
  changeDeviceStatusUpdatedDate,
  getDeviceFirmwareUpdate,
  updateDeviceFirmwareUpdateStatus,
  getDeviceToOffset,
  getDeviceTimeZoneOffset,
};

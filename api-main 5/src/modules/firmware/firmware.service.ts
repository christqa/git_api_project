import {
  AvailabilityType,
  EventSource,
  GroupUserRoles,
  Prisma,
  PrismaClient,
  Status,
} from '@prisma/client';
import prisma from '@core/prisma/prisma';
import deviceFirmwareRepository from '@repositories/device-firmware.repository';
import firmwareRepository from '@repositories/firmware.repository';
import { IPostFirmwaresInternalRequestDto } from './dtos/post-firmware-internal.dto';
import { IReleaseFirmwareInternalRequestDto } from './dtos/release-firmware-internal.dto';
import {
  IDeviceFirmwareCreateInput,
  IDeviceFirmwareExtended,
  IFirmware,
  ReleaseType,
} from './firmware.type';
import {
  createFirmwareError,
  firmwareAvailabilityNotGradualRolloutAvailability,
  firmwareDeviceModelNotFound,
  firmwareVersionAlreadyExists,
  noFirmwareFound,
  releaseFirmwareError,
  releaseFirmwareReleaseTypeDeviceSerialsBadRequest,
  releaseFirmwareReleaseTypeNotMatchedBadRequest,
  releaseFirmwareSkipUserApprovalError,
} from './firmware.error';
import logger from '@core/logger/logger';
import groupDevicesRepository from '@repositories/group-devices.repository';
import { findDeviceSettingByIdAndName } from '@modules/device-settings/device-settings.service';
import groupUsersRepository from '@repositories/group-users.repository';
import * as sqsClient from '../../lib/sqs.client';
import { IUpdateFirmwareAvailabilityRequestDto } from './dtos/update-firmware-availability-internal.dto';
import { IDeviceActivationDeviceIdSerial } from '@modules/device-activation/device-activation.type';
import deviceActivationRepository from '@repositories/device-activation.repository';
import {
  noActivatedDevice,
  noActivatedDeviceWithInvalidSerials,
} from '@modules/device-activation/device-activation.error';
import { PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT } from '@core/error-handling/error.middleware';
import { PRISMA_ERROR_CODE_FOREIGN_KEY_CONSTRAINT } from '@core/error-handling/error.middleware';
import { IGetFirmwareResponseDto } from './dtos/get-firmware-internal.dto';

const getDeviceCurrentFirmwareVersion = async (
  deviceId: number
): Promise<IDeviceFirmwareExtended | null> => {
  const currentFirmwareVersion = await deviceFirmwareRepository.findFirst({
    deviceId,
    isCurrent: true,
  });
  if (!currentFirmwareVersion) {
    return null; // no current firmware for this device
  }

  // return current firmware version
  return currentFirmwareVersion;
};

const getDevicePendingFirmwareVersions = (
  deviceId: number
): Promise<IDeviceFirmwareExtended[]> => {
  return deviceFirmwareRepository.findMany({
    deviceId,
    isCurrent: false,
    status: { not: Status.INSTALLED },
  });
};

const getDeviceNewFirmwareVersion = async (
  deviceId: number,
  currentFirmwareId?: number
): Promise<IDeviceFirmwareExtended | null> => {
  const newFirmwareVersion = await deviceFirmwareRepository.findFirst({
    deviceId,
    isCurrent: false,
    status: { not: Status.INSTALLED },
    firmwareId: { gt: currentFirmwareId },
  });
  if (!newFirmwareVersion) {
    return null; // no pending firmware for this device
  }

  // firmware is out of date, return new firmware version
  return newFirmwareVersion;
};

const getCurrentFirmwareVersion = async (
  deviceModelId: number
): Promise<IFirmware | null> => {
  const currentFirmwareVersion = await firmwareRepository.findFirst({
    deviceModelId,
    isCurrent: true,
  });
  if (!currentFirmwareVersion) {
    return null; // no current firmware for this device model
  }

  // return current firmware version
  return currentFirmwareVersion;
};

const createNewFirmware = async (
  postFirmwaresInternalRequestDto: IPostFirmwaresInternalRequestDto
) => {
  try {
    await firmwareRepository.create(postFirmwaresInternalRequestDto);
    // eslint-disable-next-line
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === PRISMA_ERROR_CODE_UNIQUE_CONSTRAINT) {
        throw firmwareVersionAlreadyExists();
      } else if (error.code === PRISMA_ERROR_CODE_FOREIGN_KEY_CONSTRAINT) {
        throw firmwareDeviceModelNotFound();
      }
    }
    throw createFirmwareError();
  }
};

const updateFirmwareAvailability = async (
  firmwareVersion: string,
  updateFirmwareAvailabilityRequestDto: IUpdateFirmwareAvailabilityRequestDto
) => {
  // check firmware version
  const firmware = await firmwareRepository.findFirst({
    virtualFirmware: firmwareVersion,
  });
  if (!firmware) {
    throw noFirmwareFound();
  }

  // check firmware availability type
  if (
    firmware.availabilityType !== AvailabilityType.GRADUAL_ROLLOUT_AVAILABILITY
  ) {
    throw firmwareAvailabilityNotGradualRolloutAvailability();
  }

  // update firmware availability type
  await firmwareRepository.update(
    { id: firmware.id },
    { availabilityType: updateFirmwareAvailabilityRequestDto.availabilityType }
  );
};

const sendDeviceNewFirmwareMessageToGroupAdmins = async ({
  deviceId,
  deviceSerial,
  firmwareId,
  virtualFirmware,
}: {
  deviceId: number;
  deviceSerial: string;
  firmwareId: number;
  virtualFirmware: string;
}) => {
  try {
    // get group admins profile ids
    const groupDevice = await groupDevicesRepository.findFirst({
      deviceId,
    });
    if (!groupDevice) {
      return;
    }
    const deviceSetting = await findDeviceSettingByIdAndName(
      deviceId,
      'NFUBattPercent'
    );
    const groupAdminProfileIds: number[] = (
      await groupUsersRepository.groupUsersFindMany({
        groupId: groupDevice.groupId,
        role: GroupUserRoles.admin,
        deleted: null,
      })
    )
      .filter((groupAdminUser) => groupAdminUser.user.profile)
      .map((groupAdminUser) => groupAdminUser.user.profile.id);
    if (!groupAdminProfileIds?.length) {
      return;
    }
    const NFUBattPercent = deviceSetting.deviceSettingValue.toString();

    // notify group admins
    return await prisma.$transaction(async (prismaClient) => {
      const prismaTr = prismaClient as PrismaClient;

      // mark this new firmware as notified
      await deviceFirmwareRepository.updateMany(
        { deviceId, firmwareId },
        { isNotified: true },
        prismaTr
      );

      // send sqs messages
      return Promise.all(
        groupAdminProfileIds.map((profileId) =>
          sqsClient.publishMessageSQS({
            default: `deviceSerial:${deviceSerial}|group:Device|type:DeviceNewFirmware`,
            deviceSerial,
            profileId,
            eventSource: EventSource.SystemGenerated,
            group: 'Device',
            type: 'DeviceNewFirmware',
            data: [
              {
                newFirmwareVersion: virtualFirmware,
                batteryLevel: NFUBattPercent,
              },
            ],
          })
        )
      );
    });
  } catch (error) {
    logger.error(
      `Failed to send device new firmware sqs message for deviceSerial: ${deviceSerial}, virtualFirmware: ${virtualFirmware}, ${error}`
    );
  }
};

const releaseFirmware = async (
  firmwareVersion: string,
  releaseFirmwareRequest: IReleaseFirmwareInternalRequestDto
) => {
  // GENERAL_PUBLIC doesn't take deviceSerials. GRADUAL/INTERNAL require deviceSerials
  const releaseType = releaseFirmwareRequest.releaseType;
  if (
    (releaseType === ReleaseType.GENERAL_PUBLIC &&
      releaseFirmwareRequest.deviceSerials) ||
    ([ReleaseType.GRADUAL, ReleaseType.INTERNAL].includes(releaseType) &&
      !releaseFirmwareRequest.deviceSerials)
  ) {
    throw releaseFirmwareReleaseTypeDeviceSerialsBadRequest();
  }
  // Check if firmware exists
  const firmware = await firmwareRepository.findFirst({
    virtualFirmware: firmwareVersion,
  });
  if (!firmware) {
    throw noFirmwareFound();
  }
  // Check if the releaseType matches availabilityType
  if (
    (releaseType === ReleaseType.GENERAL_PUBLIC &&
      firmware.availabilityType !== AvailabilityType.GENERAL_AVAILABILITY) ||
    (releaseType === ReleaseType.GRADUAL &&
      firmware.availabilityType !==
        AvailabilityType.GRADUAL_ROLLOUT_AVAILABILITY) ||
    (releaseType === ReleaseType.INTERNAL &&
      firmware.availabilityType !== AvailabilityType.INTERNAL_AVAILABILITY)
  ) {
    throw releaseFirmwareReleaseTypeNotMatchedBadRequest();
  }

  const deviceIdSerials: IDeviceActivationDeviceIdSerial[] =
    await getActivatedDeviceIdSerialsByDeviceModelId(
      firmware.deviceModelId,
      releaseFirmwareRequest.deviceSerials
    );

  let deviceFirmwareCreateInputs: IDeviceFirmwareCreateInput[] = [];
  if (!releaseFirmwareRequest.skipUserApproval) {
    // default: AWAITING_USER_APPROVAL
    deviceFirmwareCreateInputs = deviceIdSerials.map(
      (deviceIdSerial: IDeviceActivationDeviceIdSerial) => {
        return {
          deviceId: deviceIdSerial.deviceId,
          firmwareId: firmware.id,
        };
      }
    );
  } else {
    if (firmware.availabilityType === AvailabilityType.INTERNAL_AVAILABILITY) {
      deviceFirmwareCreateInputs = deviceIdSerials.map(
        (deviceIdSerial: IDeviceActivationDeviceIdSerial) => {
          return {
            deviceId: deviceIdSerial.deviceId,
            firmwareId: firmware.id,
            status: Status.PENDINGINSTALL,
          };
        }
      );
    } else {
      throw releaseFirmwareSkipUserApprovalError();
    }
  }

  try {
    await prisma.$transaction(async (prismaClient) => {
      const prismaTr = prismaClient as PrismaClient;
      await deviceFirmwareRepository.createMany(
        deviceFirmwareCreateInputs,
        prismaTr
      );

      if (releaseFirmwareRequest.releaseType === ReleaseType.GENERAL_PUBLIC) {
        const updatedFirmwares = await firmwareRepository.updateMany(
          {
            deviceModelId: firmware.deviceModelId,
          },
          {
            isCurrent: false,
          },
          prismaTr
        );
        if (updatedFirmwares.count === 0) {
          throw noFirmwareFound();
        }
        await firmwareRepository.updateMany(
          { virtualFirmware: firmwareVersion },
          { isCurrent: true },
          prismaTr
        );
      }
    });

    // trigger group admin notification
    if (!releaseFirmwareRequest.skipUserApproval && deviceIdSerials.length) {
      for (const deviceIdSerial of deviceIdSerials) {
        sendDeviceNewFirmwareMessageToGroupAdmins({
          deviceId: deviceIdSerial.deviceId,
          deviceSerial: deviceIdSerial.deviceInventory.deviceSerial,
          firmwareId: firmware.id,
          virtualFirmware: firmware.virtualFirmware,
        });
      }
    }
  } catch (error) {
    throw releaseFirmwareError();
  }
};

const getActivatedDeviceIdSerialsByDeviceModelId = async (
  deviceModelId: number,
  deviceSerials?: string[]
): Promise<IDeviceActivationDeviceIdSerial[]> => {
  let deviceIdSerials: IDeviceActivationDeviceIdSerial[] = [];
  if (!deviceSerials) {
    deviceIdSerials =
      await deviceActivationRepository.findAllActivatedDeviceIdSerialsByDeviceModelId(
        deviceModelId
      );
    if (deviceIdSerials.length === 0) {
      throw noActivatedDevice();
    }
  } else {
    deviceIdSerials =
      await deviceActivationRepository.findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId(
        deviceModelId,
        deviceSerials
      );
    if (deviceIdSerials.length !== deviceSerials.length) {
      const validDeviceSerials: string[] = deviceIdSerials.map(
        (deviceIdSerials) => {
          return deviceIdSerials.deviceInventory.deviceSerial;
        }
      );
      const invalidDeviceSerials: string[] = deviceSerials.filter(
        (deviceSerial) => !validDeviceSerials.includes(deviceSerial)
      );
      throw noActivatedDeviceWithInvalidSerials(invalidDeviceSerials);
    }
  }
  return deviceIdSerials;
};

const listOfAllFirmwares = async (): Promise<IGetFirmwareResponseDto[]> => {
  const firmwares = await firmwareRepository.findMany({});
  return firmwares.map((firmware) => ({
    virtualFirmware: firmware.virtualFirmware,
    isCurrent: firmware.isCurrent,
    addedOn: firmware.addedOn,
    releaseDate: firmware.releaseDate,
    deviceModelId: firmware.deviceModelId,
    fileName: firmware.fileName,
    locationMetaData: firmware.locationMetaData,
    md5CheckSum: firmware.md5CheckSum,
    availabilityType: firmware.availabilityType,
  }));
};

export default {
  getDeviceCurrentFirmwareVersion,
  getDevicePendingFirmwareVersions,
  getDeviceNewFirmwareVersion,
  getCurrentFirmwareVersion,
  createNewFirmware,
  updateFirmwareAvailability,
  sendDeviceNewFirmwareMessageToGroupAdmins,
  releaseFirmware,
  listOfAllFirmwares,
};

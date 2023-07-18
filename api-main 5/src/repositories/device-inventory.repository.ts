import {
  IDeviceInventoryUpdateInput,
  IDeviceInventoryUserActiveDevice,
  IDevicesInventory,
  IDevicesInventoryCreateInput,
  IDevicesInventoryUniqueInput,
} from '@modules/device-inventory/device-inventory.type';
import prisma from '@core/prisma/prisma';
import { PrismaClient } from '@prisma/client';

const { deviceInventory } = prisma;

const create = async (
  data: IDevicesInventoryCreateInput
): Promise<IDevicesInventory> => {
  return deviceInventory.create({
    data,
  });
};

const findFirst = (
  where: IDevicesInventoryUniqueInput
): Promise<IDevicesInventory | null> => {
  return deviceInventory.findFirst({
    where,
  });
};

const findManyActiveDevices = async (
  skip: number,
  take: number,
  deviceSerial?: string
) => {
  const [count, result] = await Promise.all([
    deviceInventory.count({
      where: {
        deviceSerial: { contains: deviceSerial },
        deviceActivation: {
          some: {
            deactivatedBy: null,
            deleted: null,
          },
        },
      },
    }),
    deviceInventory.findMany({
      where: {
        deviceSerial: { contains: deviceSerial },
        deviceActivation: {
          some: {
            deactivatedBy: null,
            deleted: null,
          },
        },
      },
      skip,
      take,
      select: {
        deviceActivation: {
          select: {
            timeZoneId: true,
            deviceName: true,
            deviceModelId: true,
            deviceStatus: true,
            batteryStatus: true,
            wiFiSSID: true,
            rssi: true,
            deviceStatusUpdatedOn: true,
            activatedOn: true,
            activatedBy: true,
            deactivatedBy: true,
            deleted: true,
            isNotified: true,
          },
        },
        deviceSerial: true,
        deviceFirmware: {
          where: {
            isCurrent: true,
          },
          select: {
            firmware: {
              select: {
                virtualFirmware: true,
              },
            },
          },
        },
      },
    }),
  ]);
  return { count, result };
};

const findOneUserActiveDevice = (
  userId: number,
  deviceId: number
): Promise<IDeviceInventoryUserActiveDevice | null> => {
  return deviceInventory.findFirst({
    where: {
      id: deviceId,
      deviceActivation: {
        some: {
          deactivatedBy: null,
          deleted: null,
        },
      },
      groupDevices: {
        some: {
          deleted: null,
          group: {
            deleted: null,
            groupUsers: {
              some: {
                userId,
                deleted: null,
              },
            },
          },
        },
      },
    },
    select: {
      deviceSerial: true,
      deviceActivation: {
        where: { deleted: null },
        include: { timeZone: true },
      },
    },
  });
};

const findManyUserActiveDevices = (
  userId: number
): Promise<IDeviceInventoryUserActiveDevice[]> => {
  return deviceInventory.findMany({
    where: {
      deviceActivation: {
        some: {
          deactivatedBy: null,
          deleted: null,
        },
      },
      groupDevices: {
        some: {
          deleted: null,
          group: {
            deleted: null,
            groupUsers: {
              some: {
                userId,
                deleted: null,
              },
            },
          },
        },
      },
    },
    select: {
      deviceSerial: true,
      deviceActivation: true,
    },
  });
};

const findManyDeviceIdsByDeviceSerials = async (
  deviceSerials: string[],
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceInventory.findMany({
    where: {
      deviceSerial: { in: deviceSerials },
    },
    select: {
      id: true,
    },
  });
};

const createMany = async (
  data: IDevicesInventoryCreateInput[],
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceInventory.createMany({
    data,
  });
};

const update = async (
  where: IDevicesInventoryUniqueInput,
  data: IDeviceInventoryUpdateInput,
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceInventory.update({
    where,
    data,
  });
};

const updatePixelRegistrationFile = async (
  deviceId: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pixelRegistrationFile: { [key: string]: any }
) => {
  await prisma.$queryRawUnsafe(
    `UPDATE "DeviceInventory" SET calibration_file_locations = jsonb_set(calibration_file_locations::jsonb, '{pixelRegistrationFile}', '${JSON.stringify(
      pixelRegistrationFile
    )}') WHERE id = ${deviceId}`
  );
};

export default {
  create,
  findManyActiveDevices,
  findFirst,
  findOneUserActiveDevice,
  findManyUserActiveDevices,
  findManyDeviceIdsByDeviceSerials,
  createMany,
  update,
  updatePixelRegistrationFile,
};

import { Prisma, PrismaClient } from '@prisma/client';
import {
  IDeviceActivation,
  IDeviceActivationExtended,
  IDeviceActivationCreateInput,
  IDeviceActivationUniqueInput,
  IDeviceActivationUpdateInput,
  IDeviceActivationWhereInput,
  IDeviceActivationWithGroupAdmins,
  IDeviceActivationFindAllDevicesSortBy,
} from '@modules/device-activation/device-activation.type';
import prisma from '@repositories/prisma.use.repository';
import { ITimeZone } from '@core/time-zone/time-zone.type';

const { deviceActivation, timeZone, groupDevices } = prisma;

const create = (
  data: IDeviceActivationCreateInput,
  prismaTr?: PrismaClient
): Promise<IDeviceActivation> => {
  return (prismaTr || prisma).deviceActivation.create({
    data,
  });
};

const findTimeZone = (id: number): Promise<ITimeZone | null> => {
  return timeZone.findFirst({
    where: { id },
  });
};

const findTimeZonesByText = (timeZoneTexts: string[]): Promise<ITimeZone[]> => {
  return timeZone.findMany({
    where: {
      text: {
        in: timeZoneTexts,
      },
    },
  });
};

const update = (
  where: IDeviceActivationUniqueInput,
  data: IDeviceActivationUpdateInput,
  prismaTr?: PrismaClient
): Promise<IDeviceActivation> => {
  return (prismaTr || prisma).deviceActivation.update({
    where,
    data,
  });
};

const removeSoftDelete = (
  where: IDeviceActivationUniqueInput,
  prismaTr?: PrismaClient
): Promise<IDeviceActivation> => {
  return (prismaTr || prisma).deviceActivation.delete({
    where,
  });
};

const findFirst = (
  where: IDeviceActivationWhereInput
): Promise<IDeviceActivation | null> => {
  return deviceActivation.findFirst({
    where,
  });
};

const findActivatedDevice = async (
  deviceId: number
): Promise<IDeviceActivationExtended | null> => {
  return deviceActivation.findFirst({
    where: {
      deviceId,
      deactivatedBy: null,
      deleted: null,
    },
    select: {
      id: true,
      deviceId: true,
      deviceFirmwareId: true,
      timeZoneId: true,
      deviceName: true,
      deviceModelId: true,
      deviceStatus: true,
      batteryStatus: true,
      wiFiSSID: true,
      rssi: true,
      deviceStatusUpdatedOn: true,
      isNotified: true,
      activatedOn: true,
      activatedBy: true,
      deactivatedBy: true,
      deleted: true,
      deviceModel: true,
      deviceInventory: true,
      deviceFirmware: {
        include: {
          firmware: true,
        },
      },
    },
  });
};

const findManyActivatedGroupDevices = async (
  groupId: number,
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }
): Promise<{ count: number; groupDevices: IDeviceActivationExtended[] }> => {
  const where = {
    deleted: null,
    group: { deleted: null, id: groupId },
  };

  const [count, result] = await Promise.all([
    groupDevices.count({ where }),
    groupDevices.findMany({
      where,
      skip,
      take,
      include: {
        deviceInventory: {
          include: {
            deviceActivation: {
              where: {
                deleted: null,
              },
              include: {
                deviceFirmware: {
                  include: {
                    firmware: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        addedOn: Prisma.SortOrder.asc,
      },
    }),
  ]);

  return {
    count,
    groupDevices: result.map((item) => {
      const { deviceActivation, ...deviceInventoryItems } =
        item.deviceInventory;
      return { ...deviceActivation[0], deviceInventory: deviceInventoryItems };
    }),
  };
};

const findManyActivatedDevicesByStatusUpdate = (
  to: Date,
  from?: Date
): Promise<IDeviceActivationWithGroupAdmins[]> => {
  const where: IDeviceActivationWhereInput = {
    deviceStatusUpdatedOn: {
      lte: to,
    },
    deleted: null,
    deactivatedBy: null,
    isNotified: false,
  };
  if (from) {
    // @ts-ignore: Object is possibly 'null'.
    where.deviceStatusUpdatedOn.gte = from;
  }
  return deviceActivation.findMany({
    where,
    select: {
      id: true,
      deviceName: true,
      deviceStatusUpdatedOn: true,
      deviceInventory: {
        select: {
          groupDevices: {
            where: { deleted: null },
            select: {
              group: {
                select: {
                  groupUsers: {
                    where: { role: 'admin', deleted: null },
                    select: {
                      user: {
                        select: {
                          profile: { select: { id: true } },
                          userGuid: true,
                          email: true,
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          deviceSerial: true,
        },
      },
    },
  });
};

const countDevicesByStatusUpdate = (to: Date, from?: Date): Promise<number> => {
  const where: IDeviceActivationWhereInput = {
    deviceStatusUpdatedOn: {
      lte: to,
    },
    deleted: null,
    deactivatedBy: null,
    isNotified: false,
  };
  if (from) {
    // @ts-ignore: Object is possibly 'null'.
    where.deviceStatusUpdatedOn.gte = from;
  }
  return deviceActivation.count({
    where,
  });
};

const updateManyIsNotified = async (
  deviceActivationIds: number[]
): Promise<{ count: number }> => {
  return deviceActivation.updateMany({
    where: { id: { in: deviceActivationIds } },
    data: { isNotified: true },
  });
};

const updateStatusUpdateDate = async (id: number, date: Date) => {
  return deviceActivation.update({
    where: { id },
    data: { deviceStatusUpdatedOn: date },
  });
};

const findAllDevices = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
) => {
  let sortByField: string | undefined;
  if (sortBy) {
    switch (sortBy) {
      case IDeviceActivationFindAllDevicesSortBy.deviceId:
        sortByField = '"DeviceInventory_id"';
        break;
      case IDeviceActivationFindAllDevicesSortBy.deviceName:
        sortByField = 'device_name';
        break;
      case IDeviceActivationFindAllDevicesSortBy.deviceSerial:
        sortByField = 'device_serial';
        break;
      case IDeviceActivationFindAllDevicesSortBy.activatedOn:
        sortByField = 'activated_on';
        break;
      case IDeviceActivationFindAllDevicesSortBy.manufacturingDate:
        sortByField = 'manufacturing_date';
        break;
      case IDeviceActivationFindAllDevicesSortBy.activatedBy:
        sortByField = 'first_name';
        break;
      case IDeviceActivationFindAllDevicesSortBy.lastEventDate:
        sortByField = 'generated_on';
        break;
      default:
        break;
    }
  }

  const query = `
    WITH activated_device_table AS (
      SELECT
        "DeviceInventory".id AS "DeviceInventory_id",
        "DeviceInventory".manufacturing_date,
        "DeviceInventory".device_serial,
        "DeviceActivation".device_name,
        "DeviceActivation".battery_status,
        "DeviceActivation".wifi_ssid,
        "DeviceActivation".rssi,
        "DeviceActivation".device_status_updated_on,
        "DeviceActivation".activated_on
      FROM "DeviceActivation", "DeviceInventory"
      WHERE
        "DeviceActivation".device_id = "DeviceInventory".id AND
        "DeviceActivation".deleted IS NULL AND
        "DeviceActivation".deactivated_by IS NULL
    ), account_device_activation_table AS (
      SELECT
        "Account".id AS "Account_id",
        "Account".first_name,
        "Account".last_name,
        "Account".email,
        "Account".user_guid,
        "DeviceActivation".device_id AS "Device_id"
      FROM
        "Account", "DeviceActivation"
      WHERE
        "Account".id = "DeviceActivation".activated_by AND
        "DeviceActivation".deleted IS NULL AND "DeviceActivation".deactivated_by IS NULL
    ), device_activation_device_firmware_table AS (
      SELECT
        "DeviceActivation".device_id AS "Device_id",
        "DeviceFirmware".firmware_id AS "Firmware_id"
      FROM
        "DeviceActivation"
        LEFT JOIN "DeviceFirmware"
        ON "DeviceActivation".device_firmware_id = "DeviceFirmware".id
      WHERE
        "DeviceActivation".deleted IS NULL AND "DeviceActivation".deactivated_by IS NULL
    ), activated_device_firmware_table AS (
      SELECT
        device_activation_device_firmware_table."Device_id",
        "Firmware".id AS "Firmware_id",
        "Firmware".virtual_firmware
      FROM
        device_activation_device_firmware_table
      LEFT JOIN "Firmware"
      ON device_activation_device_firmware_table."Firmware_id" = "Firmware".id
    ),
    last_event_id AS (
      SELECT
        "DeviceInventory".id AS "Device_id",
        MAX("Events".id) AS "Latest_event_id"
      FROM "Events"
      LEFT JOIN "DeviceInventory"
      ON "Events".device_id = "DeviceInventory".id
      GROUP BY "DeviceInventory".id
    ), last_event AS (
      SELECT
        last_event_id."Device_id",
        last_event_id."Latest_event_id" AS "Events_id",
        "Events".generated_on,
        "Events".event_source
      FROM "Events", last_event_id
      WHERE "Events".id = last_event_id."Latest_event_id"
    )
    SELECT *
    FROM
      activated_device_table,
      activated_device_firmware_table,
      account_device_activation_table
      LEFT JOIN last_event
      ON account_device_activation_table."Device_id" = last_event."Device_id"
    WHERE
      activated_device_table."DeviceInventory_id" = account_device_activation_table."Device_id" AND
      activated_device_table."DeviceInventory_id" = activated_device_firmware_table."Device_id"
    ${sortByField ? `ORDER BY ${sortByField} ${orderBy}` : ''}
    OFFSET ${skip} LIMIT ${take};
  `;

  const result = (await prisma.$queryRawUnsafe(query)) as any[];
  return result.map((item) => ({
    deviceName: item.deviceName,
    batteryStatus: item.batteryStatus,
    wiFiSSID: item.wifiSsid,
    rssi: item.rssi,
    deviceStatusUpdatedOn: item.deviceStatusUpdatedOn,
    activatedOn: item.activatedOn,
    deviceFirmware: item.firmwareId
      ? {
          firmware: {
            id: item.firmwareId,
            virtualFirmware: item.virtualFirmware,
          },
        }
      : null,
    userActivated: {
      id: item.accountId,
      email: item.email,
      firstName: item.firstName,
      lastName: item.lastName,
      userGuid: item.userGuid,
    },
    deviceInventory: {
      id: item.deviceinventoryId,
      deviceSerial: item.deviceSerial,
      manufacturingDate: item.manufacturingDate,
      events: item.eventsId
        ? [
            {
              id: item.eventsId,
              eventSource: item.eventSource,
              generatedOn: item.generatedOn,
            },
          ]
        : [],
    },
  }));
};

const count = (): Promise<number> => {
  return deviceActivation.count();
};

const findAllActivatedDeviceIdSerialsByDeviceModelId = async (
  deviceModelId: number,
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceActivation.findMany({
    where: {
      deleted: null,
      deviceInventory: {
        deviceModelId: deviceModelId,
      },
    },
    select: {
      deviceId: true,
      deviceInventory: {
        select: {
          deviceSerial: true,
        },
      },
    },
  });
};

const findAllActivatedDeviceIds = async (prismaTr?: PrismaClient) => {
  return (prismaTr || prisma).deviceActivation.findMany({
    where: {
      deleted: null,
    },
    select: {
      deviceId: true,
    },
  });
};

const findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId = async (
  deviceModelId: number,
  deviceSerials: string[],
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceActivation.findMany({
    where: {
      deleted: null,
      deviceInventory: {
        deviceSerial: {
          in: deviceSerials,
        },
        deviceModelId: deviceModelId,
      },
    },
    select: {
      deviceId: true,
      deviceInventory: {
        select: {
          deviceSerial: true,
        },
      },
    },
  });
};

const findManyActivatedDeviceIdSerialsByDeviceIds = async (
  deviceIds: number[],
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).deviceActivation.findMany({
    where: {
      deviceId: { in: deviceIds },
      deleted: null,
    },
    select: {
      deviceId: true,
      deviceInventory: {
        select: {
          deviceSerial: true,
        },
      },
    },
  });
};

export default {
  create,
  update,
  removeSoftDelete,
  findFirst,
  findTimeZone,
  findTimeZonesByText,
  findActivatedDevice,
  findManyActivatedGroupDevices,
  findManyActivatedDevicesByStatusUpdate,
  countDevicesByStatusUpdate,
  updateManyIsNotified,
  updateStatusUpdateDate,
  findAllDevices,
  count,
  findAllActivatedDeviceIdSerialsByDeviceModelId,
  findAllActivatedDeviceIds,
  findManyActivatedDeviceIdSerialsByDeviceSerialsDeviceModelId,
  findManyActivatedDeviceIdSerialsByDeviceIds,
};

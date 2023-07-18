import { PrismaClient } from '@prisma/client';
import {
  IGroupDevice,
  IGroupDevicesBatchPayload,
  IGroupDevicesCreateInput,
  IGroupDevicesUpdateInput,
  IGroupDevicesWhereInput,
} from '@modules/groups/groups.type';

import prisma from '@repositories/prisma.use.repository';
const { groupDevices } = prisma;

const create = (
  data: IGroupDevicesCreateInput,
  prismaTr?: PrismaClient
): Promise<IGroupDevice> => {
  return (prismaTr || prisma).groupDevices.create({
    data,
  });
};

const update = (
  where: IGroupDevicesWhereInput,
  data: IGroupDevicesUpdateInput,
  prismaTr?: PrismaClient
): Promise<IGroupDevicesBatchPayload> => {
  return (prismaTr || prisma).groupDevices.updateMany({
    data,
    where,
  });
};

const remove = (
  where: IGroupDevicesWhereInput,
  prismaTr?: PrismaClient
): Promise<IGroupDevicesBatchPayload> => {
  return (prismaTr || prisma).groupDevices.deleteMany({
    where,
  });
};

const findFirst = (where: IGroupDevicesWhereInput) => {
  return groupDevices.findFirst({
    select: {
      id: true,
      groupId: true,
      deviceId: true,
      deviceInventory: {
        select: {
          id: true,
          deviceSerial: true,
          deviceActivation: true,
        },
      },
    },
    where,
  });
};

const count = (where: IGroupDevicesWhereInput): Promise<number> => {
  return groupDevices.count({
    where,
  });
};

export default {
  create,
  update,
  remove,
  findFirst,
  count,
};

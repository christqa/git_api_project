import { PrismaClient } from '@prisma/client';
import {
  IDeviceFirmware,
  IDeviceFirmwareCreateInput,
  IDeviceFirmwareExtended,
  IDeviceFirmwareUncheckedUpdateInput,
  IDeviceFirmwareUncheckedUpdateManyInput,
  IDeviceFirmwareUniqueInput,
  IDeviceFirmwareWhereInput,
  IDeviceFirmwareBatchCount,
} from '@modules/firmware/firmware.type';
import prisma from '@core/prisma/prisma';

const { deviceFirmware } = prisma;

const create = (
  data: IDeviceFirmwareCreateInput,
  prismaTr?: PrismaClient
): Promise<IDeviceFirmware> => {
  return (prismaTr || prisma).deviceFirmware.create({
    data,
  });
};

const findFirst = async (
  where: IDeviceFirmwareWhereInput
): Promise<IDeviceFirmwareExtended | null> => {
  return deviceFirmware.findFirst({
    include: {
      firmware: true,
    },
    where,
    orderBy: {
      addedOn: 'desc',
    },
  });
};

const findMany = async (
  where: IDeviceFirmwareWhereInput
): Promise<IDeviceFirmwareExtended[]> => {
  return deviceFirmware.findMany({
    include: {
      firmware: true,
    },
    where,
  });
};

const update = (
  where: IDeviceFirmwareUniqueInput,
  data: IDeviceFirmwareUncheckedUpdateInput,
  prismaTr?: PrismaClient
): Promise<IDeviceFirmware> => {
  return (prismaTr || prisma).deviceFirmware.update({
    where,
    data,
  });
};

const updateMany = async (
  where: IDeviceFirmwareWhereInput,
  data: IDeviceFirmwareUncheckedUpdateManyInput,
  prismaTr?: PrismaClient
): Promise<void> => {
  await (prismaTr || prisma).deviceFirmware.updateMany({
    where,
    data,
  });
};

const createMany = async (
  data: IDeviceFirmwareCreateInput[],
  prismaTr?: PrismaClient
): Promise<IDeviceFirmwareBatchCount> => {
  return await (prismaTr || prisma).deviceFirmware.createMany({
    data,
  });
};

export default { create, findFirst, findMany, update, updateMany, createMany };

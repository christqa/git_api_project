import {
  IFirmware,
  IFirmwareCreateInput,
  IFirmwareUncheckedUpdateInput,
  IFirmwareWhereInput,
  IFirmwareWhereUniqueInput,
} from '@modules/firmware/firmware.type';
import prisma from '@core/prisma/prisma';
import { PrismaClient } from '@prisma/client';

const { firmware } = prisma;

const findFirst = async (
  where: IFirmwareWhereInput
): Promise<IFirmware | null> => {
  return firmware.findFirst({
    where,
  });
};
const updateMany = async (
  where: IFirmwareWhereInput,
  data: IFirmwareUncheckedUpdateInput,
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).firmware.updateMany({
    where,
    data,
  });
};
const create = async (
  data: IFirmwareCreateInput,
  prismaTr?: PrismaClient
): Promise<IFirmware> => {
  return (prismaTr || prisma).firmware.create({
    data,
  });
};

const findMany = async (
  where: IFirmwareWhereUniqueInput,
  prismaTr?: PrismaClient
): Promise<IFirmware[]> => {
  return (prismaTr || prisma).firmware.findMany({
    where,
  });
};

const update = async (
  where: IFirmwareWhereUniqueInput,
  data: IFirmwareUncheckedUpdateInput,
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).firmware.update({
    where,
    data,
  });
};
const findManyWithFirmwareVersions = async (
  firmwareVersions: string[],
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).firmware.findMany({
    where: {
      virtualFirmware: {
        in: firmwareVersions,
      },
    },
  });
};
export default {
  findFirst,
  create,
  updateMany,
  update,
  findManyWithFirmwareVersions,
  findMany,
};

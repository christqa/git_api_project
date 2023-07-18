import { PrismaClient } from '@prisma/client';
import {
  IGroup,
  IGroupsCreateInput,
  IGroupsUpdateInput,
  IGroupsUniqueInput,
  IGroupsWhereInput,
} from '@modules/groups/groups.type';

import prisma from '@repositories/prisma.use.repository';

const { groups } = prisma;

const create = (
  data: IGroupsCreateInput,
  prismaTr?: PrismaClient
): Promise<IGroup> => {
  return (prismaTr || prisma).groups.create({
    data,
  });
};

const findFirst = (where: IGroupsWhereInput): Promise<IGroup | null> => {
  return groups.findFirst({ where });
};

const findOne = (where: IGroupsUniqueInput): Promise<IGroup | null> => {
  return groups.findUnique({ where });
};

const findMany = (where: IGroupsWhereInput): Promise<IGroup[]> => {
  return groups.findMany({
    where,
  });
};

const update = (
  where: IGroupsUniqueInput,
  data: IGroupsUpdateInput,
  prismaTr?: PrismaClient
): Promise<IGroup> => {
  return (prismaTr || prisma).groups.update({
    data,
    where,
  });
};

const remove = (
  where: IGroupsUniqueInput,
  prismaTr?: PrismaClient
): Promise<IGroup> => {
  return (prismaTr || prisma).groups.delete({
    where,
  });
};

export default {
  create,
  findFirst,
  findOne,
  findMany,
  update,
  remove,
};

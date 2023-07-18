import {
  IAgreements,
  IAgreementsWhereInput,
} from '@modules/agreements/agreements.type';
import prisma from '@core/prisma/prisma';
import { Prisma, PrismaClient } from '@prisma/client';

const { agreements } = prisma;

const create = async (data: IAgreements): Promise<IAgreements> => {
  return agreements.create({
    data,
  });
};

const findFirst = async (
  where: IAgreementsWhereInput
): Promise<IAgreements | null> => {
  return agreements.findFirst({
    where,
  });
};

const find = (agreement: IAgreementsWhereInput) => {
  return agreements.findMany({
    where: agreement,
  });
};

const findAll = () => {
  return agreements.findMany();
};

const findLastAgreementVersion = ({ agreementType }: IAgreementsWhereInput) => {
  return agreements.aggregate({
    where: {
      agreementType,
    },
    _max: {
      version: true,
    },
  });
};

const createMany = async (
  data: {
    data: Prisma.Enumerable<Prisma.AgreementsCreateManyInput>;
    skipDuplicates?: boolean | undefined;
  },
  prismaTr?: PrismaClient
) => {
  return (prismaTr || prisma).agreements.createMany({
    ...data,
    skipDuplicates: true,
  });
};

export default {
  create,
  find,
  findAll,
  findFirst,
  findLastAgreementVersion,
  createMany,
};

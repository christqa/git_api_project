import prisma from '@core/prisma/prisma';

import {
  CumulativeScoreTypes,
  ICumulativeBaselineValue,
  ICumulativeBaselineValueUniqueInput,
  ICumulativeBaselineValueWhereInput,
  ICumulativeScore,
  ICumulativeScoreBatchCount,
  ICumulativeScoreCreate,
  ICumulativeScoreDelete,
  ICumulativeScoreUniqueInput,
  ICumulativeScoreUpdate,
  ICumulativeScoreWhereInput,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import { Prisma, PrismaClient } from '@prisma/client';

const { cumulativeScore, cumulativeBaselineValue } = prisma;

const createBaseLineValue = async (
  data: ICumulativeBaselineValue
): Promise<ICumulativeBaselineValue> => {
  data.value = Math.round(data.value);
  return cumulativeBaselineValue.create({
    data,
  });
};

const updateBaseLineValue = (
  where: ICumulativeBaselineValueUniqueInput,
  data: ICumulativeBaselineValue
): Promise<ICumulativeBaselineValue> => {
  if (data.value) {
    data.value = Math.round(data.value);
  }
  return cumulativeBaselineValue.update({
    where,
    data,
  });
};

const findFirstBaseLineValue = (
  where: ICumulativeBaselineValueWhereInput
): Promise<ICumulativeBaselineValue | null> => {
  return cumulativeBaselineValue.findFirst({
    where,
  });
};

const removeBaseLineValue = (
  where: ICumulativeBaselineValueWhereInput
): Promise<ICumulativeScoreBatchCount> => {
  return cumulativeBaselineValue.deleteMany({
    where,
  });
};

const findManyBaseLineValue = (
  where: ICumulativeBaselineValueWhereInput
): Promise<ICumulativeBaselineValue[]> => {
  return cumulativeBaselineValue.findMany({
    where,
    orderBy: [
      {
        type: 'asc',
      },
    ],
  });
};

const create = async (
  data: ICumulativeScoreCreate,
  prismaTr?: PrismaClient
): Promise<ICumulativeScore> => {
  data.value = data.value ? Math.round(data.value) : null;
  return (prismaTr || prisma).cumulativeScore.create({
    data,
  });
};

const createMany = async (
  data: ICumulativeScore[]
): Promise<ICumulativeScoreBatchCount> => {
  for (const objData of data) {
    objData.value = objData.value ? Math.round(objData.value) : null;
  }
  return cumulativeScore.createMany({
    data,
  });
};

const update = (
  where: ICumulativeScoreUniqueInput,
  data: ICumulativeScoreUpdate,
  prismaTr?: PrismaClient
): Promise<ICumulativeScore> => {
  if (data.value) {
    data.value = Math.round(data.value);
  }
  return (prismaTr || prisma).cumulativeScore.update({
    where,
    data,
  });
};

const remove = (
  where: ICumulativeScoreDelete
): Promise<ICumulativeScoreBatchCount> => {
  return cumulativeScore.deleteMany({
    where,
  });
};

const findFirst = (
  where: ICumulativeScoreWhereInput
): Promise<ICumulativeScore | null> => {
  return cumulativeScore.findFirst({
    where,
    orderBy: {
      date: Prisma.SortOrder.desc,
    },
  });
};

const findMany = (
  profileId: number,
  scoreOfRecord: boolean,
  timeOfDay?: TimeOfDayEnum | null,
  startDate?: Date,
  endDate?: Date,
  type?: CumulativeScoreTypes,
  sortOrder?: string
): Promise<ICumulativeScore[] | null> => {
  const order = sortOrder || 'desc';
  const where: ICumulativeScoreWhereInput = {
    profileId,
    type,
    scoreOfRecord,
    date: {
      gte: startDate,
      lt: endDate,
    },
  };
  if (timeOfDay && type && type === CumulativeScoreTypes.hydration) {
    where.timeOfDay = timeOfDay;
  }
  return cumulativeScore.findMany({
    orderBy: [
      {
        date: order === 'asc' ? 'asc' : 'desc',
      },
    ],
    where,
  });
};

const count = (
  profileId: number,
  type: CumulativeScoreTypes | undefined = undefined
): Promise<number> => {
  if (type == undefined) {
    return cumulativeScore.count({
      where: {
        profileId,
        scoreOfRecord: true,
      },
    });
  }
  return cumulativeScore.count({
    where: {
      type,
      profileId,
      scoreOfRecord: true,
    },
  });
};

export default {
  create,
  createMany,
  update,
  remove,
  findFirst,
  findMany,
  count,
  createBaseLineValue,
  updateBaseLineValue,
  findFirstBaseLineValue,
  findManyBaseLineValue,
  removeBaseLineValue,
};

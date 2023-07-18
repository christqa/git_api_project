import prisma from '@core/prisma/prisma';

import {
  AnalyteTypes,
  IAnalyteManualEntryBatchCount,
  IAnalyteManualEntryDelete,
  IAnalyteManualEntryUniqueInput,
  IAnalyteManualEntryUpdate,
  IAnalyteManualEntryWhereInput,
  IAnalytesManualEntry,
} from '@modules/analytes/analytes.type';

const { analytesManualEntry } = prisma;

const remove = (
  where: IAnalyteManualEntryDelete
): Promise<IAnalyteManualEntryBatchCount> => {
  return analytesManualEntry.deleteMany({
    where,
  });
};

const createMany = async (
  data: IAnalytesManualEntry[]
): Promise<IAnalyteManualEntryBatchCount> => {
  return analytesManualEntry.createMany({
    data,
  });
};

const update = (
  where: IAnalyteManualEntryUniqueInput,
  data: IAnalyteManualEntryUpdate
): Promise<IAnalytesManualEntry> => {
  return analytesManualEntry.update({
    where,
    data,
  });
};

const findFirst = (
  where: IAnalyteManualEntryWhereInput
): Promise<IAnalytesManualEntry | null> => {
  return analytesManualEntry.findFirst({
    where,
    orderBy: [
      {
        date: 'asc',
      },
    ],
  });
};

const findMaxValue = (
  where: IAnalyteManualEntryWhereInput,
  field: string
): Promise<{ [key: string]: number } | null> => {
  return analytesManualEntry.findFirst({
    select: {
      [field]: true,
    },
    where,
    orderBy: [{ [field]: 'desc' }],
  });
};

const findMany = (
  profileId: number,
  startDate: Date,
  endDate?: Date,
  sortOrder?: 'asc' | 'desc',
  type?: AnalyteTypes
): Promise<IAnalytesManualEntry[]> => {
  const order = sortOrder || 'desc';
  const whereInput: {
    profileId: number;
    date: {
      gte: Date;
      lt?: Date;
    };
    isStool?: boolean;
    isUrine?: boolean;
  } = {
    profileId,
    date: {
      gte: startDate,
      lt: endDate,
    },
  };

  if (type) {
    if (type == AnalyteTypes.stool) {
      whereInput['isStool'] = true;
    } else {
      whereInput['isUrine'] = true;
    }
  }

  return analytesManualEntry.findMany({
    orderBy: [
      {
        date: order,
      },
    ],
    where: whereInput,
  });
};

export default {
  remove,
  createMany,
  update,
  findFirst,
  findMany,
  findMaxValue,
};

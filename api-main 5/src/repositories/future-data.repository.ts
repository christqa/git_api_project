import prisma from '@core/prisma/prisma';
import {
  IBatchCount,
  IStoolFutureData,
  IStoolFutureDataDelete,
  IUrineFutureData,
  IUrineFutureDataDelete,
} from '@modules/analytes-future-data/analytes-future-data.type';

const { stoolFutureData, urineFutureData } = prisma;

const findStoolFutureData = async ({
  email,
  startDate,
  endDate,
}: {
  email: string;
  startDate: Date;
  endDate?: Date;
}): Promise<[number, IStoolFutureData[]]> => {
  return Promise.all([
    stoolFutureData.count({
      where: {
        email,
      },
    }),
    stoolFutureData.findMany({
      where: {
        email,
        used: false,
        startDate: {
          gte: startDate,
        },
        endDate: {
          lte: endDate,
        },
      },
    }),
  ]);
};

const updateStoolFutureData = async ({
  email,
  startDate,
  endDate,
}: {
  email: string;
  startDate: Date;
  endDate?: Date;
}): Promise<IBatchCount> => {
  return stoolFutureData.updateMany({
    where: {
      email,
      used: false,
      startDate: {
        gte: startDate,
      },
      endDate: {
        lte: endDate,
      },
    },
    data: {
      used: true,
    },
  });
};

const updateUrineFutureData = async ({
  email,
  startDate,
  endDate,
}: {
  email: string;
  startDate: Date;
  endDate?: Date;
}): Promise<IBatchCount> => {
  return urineFutureData.updateMany({
    where: {
      email,
      used: false,
      startDate: {
        gte: startDate,
      },
      endDate: {
        lte: endDate,
      },
    },
    data: {
      used: true,
    },
  });
};

const findUrineFutureData = async ({
  email,
  startDate,
  endDate,
}: {
  email: string;
  startDate: Date;
  endDate?: Date;
}): Promise<[number, IUrineFutureData[]]> => {
  return Promise.all([
    urineFutureData.count({
      where: {
        email,
      },
    }),
    urineFutureData.findMany({
      where: {
        email,
        used: false,
        startDate: {
          gte: startDate,
        },
        endDate: {
          lte: endDate,
        },
      },
    }),
  ]);
};

const removeManyUrineFutureData = async (
  where: IUrineFutureDataDelete
): Promise<IBatchCount> => {
  return urineFutureData.deleteMany({
    where,
  });
};

const createManyUrineFutureData = async (
  data: IUrineFutureData[]
): Promise<IBatchCount> => {
  return urineFutureData.createMany({
    data,
  });
};

const removeManyStoolFutureData = async (
  where: IStoolFutureDataDelete
): Promise<IBatchCount> => {
  return stoolFutureData.deleteMany({
    where,
  });
};

const createManyStoolFutureData = async (
  data: IStoolFutureData[]
): Promise<IBatchCount> => {
  return stoolFutureData.createMany({
    data,
  });
};

export {
  updateStoolFutureData,
  removeManyStoolFutureData,
  updateUrineFutureData,
  findStoolFutureData,
  findUrineFutureData,
  removeManyUrineFutureData,
  createManyUrineFutureData,
  createManyStoolFutureData,
};

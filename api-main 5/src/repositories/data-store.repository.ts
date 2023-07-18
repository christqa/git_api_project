import {
  IDataStoreCreateInput,
  IDataStore,
  IDataStoreKeyValues,
} from '@modules/data-store/data-store.type';
import prisma from '@core/prisma/prisma';

const { dataStore } = prisma;

const upsertDataStore = (
  userId: number,
  keyValues: IDataStoreKeyValues
): Promise<IDataStore> => {
  return dataStore.upsert({
    where: {
      userId: userId,
    },
    create: {
      userId,
      data: keyValues,
    } as IDataStoreCreateInput,
    update: {
      data: keyValues,
    } as IDataStoreCreateInput,
  });
};

const getDataStore = (userId: number): Promise<IDataStore | null> => {
  return dataStore.findUnique({
    where: {
      userId,
    },
  });
};

export { upsertDataStore, getDataStore };

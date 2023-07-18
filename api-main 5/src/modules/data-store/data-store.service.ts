import * as repository from '@repositories/data-store.repository';
import { IDataStoreKeyValues } from '@modules/data-store/data-store.type';
import { userService } from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';

const upsertDataStore = async (
  userGuid: string,
  keyValues: IDataStoreKeyValues
): Promise<void> => {
  if (keyValues.size === 0) {
    return;
  }
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  await repository.upsertDataStore(user.id, keyValues);
};

const patchDataStore = async (
  userGuid: string,
  keyValues: IDataStoreKeyValues
): Promise<void> => {
  if (keyValues.size === 0) {
    return;
  }
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  const dataStore = await getDataStore(userGuid);
  await repository.upsertDataStore(user.id, { ...dataStore, ...keyValues });
};

const getDataStore = async (userGuid: string): Promise<IDataStoreKeyValues> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }

  const dataStore = await repository.getDataStore(user.id);
  if (dataStore === null) {
    return {} as IDataStoreKeyValues;
  }

  return dataStore.data as IDataStoreKeyValues;
};

export default { upsertDataStore, patchDataStore, getDataStore };

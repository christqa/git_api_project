import dataStoreService from './data-store.service';
import * as repository from '@repositories/data-store.repository';
import { Prisma } from '@prisma/client';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const userObject = generateUser({ id: 2 });

const dataStore = {
  id: 1,
  userId: 1,
  data: { test: true } as Prisma.JsonValue,
};
beforeAll(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(repository, 'upsertDataStore').mockResolvedValue(dataStore);
  jest.spyOn(repository, 'getDataStore').mockResolvedValue(dataStore);
});

afterAll((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('data store', () => {
  test('should test upsertDataStore function', async () => {
    await dataStoreService.upsertDataStore(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        test: true,
      }
    );
    expect(repository.upsertDataStore).toHaveBeenCalled();
  });

  test('should test patchDataStore function', async () => {
    await dataStoreService.patchDataStore(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      {
        test: true,
      }
    );
    expect(repository.upsertDataStore).toHaveBeenCalled();
  });

  test('should test getDataStore function', async () => {
    const data = await dataStoreService.getDataStore('1');
    expect(data).toEqual({ test: true });
  });
});

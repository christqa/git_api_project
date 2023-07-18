import userRepository from '@repositories/user.repository';
import { generateUser } from '@test/utils/generate';
import {
  CumulativeScoreTypes,
  ICumulativeScoreCreate,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import { getScores } from '@modules/cumulative-score/cs-loader/cs-loader.service';
import { CumulativeScoreGroupType } from '@modules/cumulative-score/dtos/cumulative-score.index.dto';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import {
  create,
  remove,
  upsertDailyScore,
  upsertDailyScoreInternal,
  upsertDailyScores,
} from '@modules/cumulative-score/cumulative-score.service';
import * as profileService from '@modules/profile/profile.service';
import { IProfile } from '@modules/profile/profile.type';
import profileRepository from '@repositories/profile.repository';
import prisma from '@core/prisma/prisma';
import { prismaMock } from '@core/prisma/singleton';
import { TrendIndicators } from '@prisma/client';
import moment from 'moment';

const cumulativeScore = {
  id: 1,
  profileId: 1,
  userId: 1,
  value: 65,
  type: CumulativeScoreTypes.gutHealth,
  date: new Date(),
  scoreOfRecord: true,
  timeOfDay: TimeOfDayEnum.morning,
  trendIndicator: null,
};

beforeEach(() => {
  prismaMock.$transaction.mockImplementation((cb) => cb(prisma));

  const userData = generateUser();
  jest.spyOn(profileService, 'findProfileById').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(profileService, 'findProfileByUserGuid').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
  jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(20);
  jest.spyOn(cumulativeScoreRepository, 'findMany').mockResolvedValue([]);
  jest
    .spyOn(cumulativeScoreRepository, 'remove')
    .mockResolvedValue({ count: 1 });
  jest
    .spyOn(cumulativeScoreRepository, 'createMany')
    .mockResolvedValue({ count: 2 });
  jest
    .spyOn(cumulativeScoreRepository, 'findFirst')
    .mockResolvedValue(cumulativeScore);
  jest
    .spyOn(cumulativeScoreRepository, 'update')
    .mockResolvedValue(cumulativeScore);
  jest
    .spyOn(cumulativeScoreRepository, 'create')
    .mockResolvedValue(cumulativeScore);
  const baselineValue = {
    id: 1,
    profileId: 1,
    value: 2,
    type: CumulativeScoreTypes.gutHealth,
    updatedAt: new Date(),
    timeOfDay: null,
  };
  jest
    .spyOn(cumulativeScoreRepository, 'updateBaseLineValue')
    .mockResolvedValue(baselineValue);
  jest
    .spyOn(cumulativeScoreRepository, 'findFirstBaseLineValue')
    .mockResolvedValue(baselineValue);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('cumulative score', () => {
  test('should test getScores function', async () => {
    await getScores({
      userGuid: '1',
      email: 'dev@projectspectra.dev',
      groupBy: CumulativeScoreGroupType.day,
      type: CumulativeScoreTypes.hydration,
      startDate: new Date('2022-08-07T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    });
  });

  test('should test create function', async () => {
    jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);

    await create({
      userEmail: 'dev@projectspectra.dev',
      date: -3,
      baselineValue: 40,
      type: CumulativeScoreTypes.hydration,
      value: 20,
      timeOfDay: TimeOfDayEnum.night,
    });
  });

  test('should test remove function', async () => {
    await remove({
      userEmail: 'dev@projectspectra.dev',
      date: -3,
      type: CumulativeScoreTypes.hydration,
    });
  });

  test('should test upsertDailyScore function', async () => {
    await upsertDailyScore(
      {
        date: -3,
        baselineValue: 40,
        type: CumulativeScoreTypes.hydration,
        value: 20,
        timeOfDay: TimeOfDayEnum.morning,
      },
      1
    );
  });

  test('should test upsertDailyScores function', async () => {
    await upsertDailyScores(
      {
        type: CumulativeScoreTypes.hydration,
        scores: [
          {
            date: 0,
            value: 20,
          },
          {
            date: -1,
            value: 20,
          },
        ],
      },
      'dev@projectspectra.dev'
    );
  });

  test('should test upsertDailyScoreInternal function', async () => {
    await upsertDailyScoreInternal({
      profileId: 1,
      date: -3,
      type: CumulativeScoreTypes.hydration,
      value: 23,
      timeOfDay: TimeOfDayEnum.night,
    });
    expect(cumulativeScoreRepository.create).toHaveBeenCalled();
  });

  test('should test upsertDailyScoreInternal function - trendIndicator up', async () => {
    let createData: ICumulativeScoreCreate;
    jest
      .spyOn(cumulativeScoreRepository, 'create')
      .mockImplementation((data) => {
        createData = data;
        return Promise.resolve(cumulativeScore);
      });

    await upsertDailyScoreInternal({
      profileId: 1,
      date: 0,
      type: CumulativeScoreTypes.hydration,
      value: 70,
      timeOfDay: TimeOfDayEnum.morning,
    });
    expect(createData!.trendIndicator).toBe(TrendIndicators.up);
  });

  test('should test upsertDailyScoreInternal function - trendIndicator down', async () => {
    let createData: ICumulativeScoreCreate;
    jest
      .spyOn(cumulativeScoreRepository, 'create')
      .mockImplementation((data) => {
        createData = data;
        return Promise.resolve(cumulativeScore);
      });

    await upsertDailyScoreInternal({
      profileId: 1,
      date: 0,
      type: CumulativeScoreTypes.hydration,
      value: 60,
      timeOfDay: TimeOfDayEnum.morning,
    });
    expect(createData!.trendIndicator).toBe(TrendIndicators.down);
  });

  test('should test upsertDailyScoreInternal function - trendIndicator down threshold', async () => {
    let createData: ICumulativeScoreCreate;
    jest.spyOn(cumulativeScoreRepository, 'findFirst').mockResolvedValue(null); // current day
    jest
      .spyOn(cumulativeScoreRepository, 'create')
      .mockImplementation((data) => {
        createData = data;
        return Promise.resolve(cumulativeScore);
      });

    await upsertDailyScoreInternal({
      profileId: 1,
      date: 0,
      type: CumulativeScoreTypes.hydration,
      value: 40,
      timeOfDay: TimeOfDayEnum.morning,
    });
    expect(createData!.trendIndicator).toBe(TrendIndicators.down);
  });

  test('should test upsertDailyScoreInternal function - trendIndicator same', async () => {
    let createData: ICumulativeScoreCreate;
    jest
      .spyOn(cumulativeScoreRepository, 'create')
      .mockImplementation((data) => {
        createData = data;
        return Promise.resolve(cumulativeScore);
      });

    await upsertDailyScoreInternal({
      profileId: 1,
      date: 0,
      type: CumulativeScoreTypes.hydration,
      value: 65,
      timeOfDay: TimeOfDayEnum.morning,
    });
    expect(createData!.trendIndicator).toBe(TrendIndicators.same);
  });

  test('should test upsertDailyScoreInternal function - trendIndicator with previous day data', async () => {
    let createData: ICumulativeScoreCreate;
    jest
      .spyOn(cumulativeScoreRepository, 'findFirst')
      .mockResolvedValueOnce(null); // current day
    jest
      .spyOn(cumulativeScoreRepository, 'findFirst')
      .mockResolvedValueOnce({ ...cumulativeScore, value: 80 }); // previous day
    jest
      .spyOn(cumulativeScoreRepository, 'create')
      .mockImplementation((data) => {
        createData = data;
        return Promise.resolve(cumulativeScore);
      });

    await upsertDailyScoreInternal({
      profileId: 1,
      date: 0,
      type: CumulativeScoreTypes.hydration,
      value: 65,
      timeOfDay: TimeOfDayEnum.morning,
    });
    expect(createData!.trendIndicator).toBe(TrendIndicators.down);
  });
});

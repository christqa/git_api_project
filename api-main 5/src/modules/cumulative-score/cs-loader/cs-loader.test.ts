import * as csLoaderService from './cs-loader.service';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import { CumulativeScoreTypes, TimeOfDayEnum } from '../cumulative-score.type';
import { CumulativeScoreGroupType } from '../dtos/cumulative-score.index.dto';
import * as profileService from '@modules/profile/profile.service';
import { IProfile } from '@modules/profile/profile.type';
import { generateUser } from '@test/utils/generate';
import userRepository from '@repositories/user.repository';
import { userService } from '@modules/index/index.service';

const scoresGutHealthObject = [
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 1,
    type: CumulativeScoreTypes.gutHealth,
    date: new Date('07/10/2022'),
    scoreOfRecord: true,
    timeOfDay: null,
    trendIndicator: null,
  },
];
const scoresGutHealthMonthObject = [
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 1,
    type: CumulativeScoreTypes.gutHealth,
    date: new Date('07/10/2022'),
    scoreOfRecord: true,
    timeOfDay: null,
    trendIndicator: null,
  },
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 2,
    type: CumulativeScoreTypes.gutHealth,
    date: new Date('07/11/2022'),
    scoreOfRecord: true,
    timeOfDay: null,
    trendIndicator: null,
  },
];
const scoresHydrationObject = [
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 1,
    type: CumulativeScoreTypes.hydration,
    date: new Date('07/10/2022'),
    scoreOfRecord: true,
    timeOfDay: null,
    trendIndicator: null,
  },
];
const scoresHydrationMonthObject = [
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 1,
    type: CumulativeScoreTypes.hydration,
    date: new Date('07/10/2022'),
    scoreOfRecord: true,
    timeOfDay: TimeOfDayEnum.night,
    trendIndicator: null,
  },
  {
    id: 1,
    profileId: 1,
    userGuid: '1',
    value: 2,
    type: CumulativeScoreTypes.hydration,
    date: new Date('07/11/2022'),
    scoreOfRecord: true,
    timeOfDay: TimeOfDayEnum.morning,
    trendIndicator: null,
  },
];

const mockedProfile = {
  id: 1,
  dob: 'string',
  regionalPref: 'string',
  weightLbs: 1,
  heightIn: 1,
  userGuid: '1',
  genderId: 1,
  lifeStyleId: null,
  exerciseIntensityId: null,
  urinationsPerDayId: null,
  bowelMovementId: null,
};

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);
  jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(1);
  jest
    .spyOn(cumulativeScoreRepository, 'findMany')
    .mockResolvedValue(scoresGutHealthObject);
  jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);
  jest.spyOn(profileService, 'findProfileByUserGuid').mockResolvedValue({
    id: 1,
  } as IProfile);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Cumulative Score Loader', () => {
  test('should test getScores function (gutHealth group by day)', async () => {
    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.day,
      type: CumulativeScoreTypes.gutHealth,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toEqual({
      groupBy: 'day',
      hydration: undefined,
      gutHealth: {
        scores: [
          {
            date: '7/10/2022',
            value: 1,
            trendIndicator: null,
          },
        ],
        total: 1,
      },
      type: 'gutHealth',
    });
  });

  test('should test getScores function (gutHealth group by month)', async () => {
    jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(2);
    jest
      .spyOn(cumulativeScoreRepository, 'findMany')
      .mockResolvedValue(scoresGutHealthMonthObject);

    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.month,
      type: CumulativeScoreTypes.gutHealth,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toEqual({
      groupBy: 'month',
      hydration: undefined,
      gutHealth: {
        scores: [
          {
            date: '7/1/2022',
            value: 1.5,
            dailyUrineValue: [],
          },
        ],
        total: 1,
      },
      type: 'gutHealth',
    });
  });

  test('should test getScores function (gutHealth group by month with empty data)', async () => {
    jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(0);
    jest.spyOn(cumulativeScoreRepository, 'findMany').mockResolvedValue([]);

    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.day,
      type: CumulativeScoreTypes.gutHealth,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toBeTruthy();
  });

  test('should test getScores function (hydration group by day)', async () => {
    jest
      .spyOn(cumulativeScoreRepository, 'findMany')
      .mockResolvedValue(scoresHydrationObject);

    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.day,
      type: CumulativeScoreTypes.hydration,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toEqual({
      groupBy: 'day',
      gutHealth: undefined,
      hydration: {
        scores: [
          {
            date: '7/10/2022',
            value: null,
            dailyUrineValue: [
              {
                timeOfDay: null,
                value: 1,
                trendIndicator: null,
              },
            ],
          },
        ],
        total: 1,
      },
      type: 'hydration',
    });
  });

  test('should test getScores function (hydration group by month)', async () => {
    jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(2);
    jest
      .spyOn(cumulativeScoreRepository, 'findMany')
      .mockResolvedValue(scoresHydrationMonthObject);

    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.month,
      type: CumulativeScoreTypes.hydration,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toEqual({
      groupBy: 'month',
      gutHealth: undefined,
      hydration: {
        scores: [
          {
            date: '7/1/2022',
            value: 0,
            dailyUrineValue: [
              {
                timeOfDay: 'morning',
                value: 2,
              },
              {
                timeOfDay: 'night',
                value: 1,
              },
            ],
          },
        ],
        total: 1,
      },
      type: 'hydration',
    });
  });

  test('should test getScores function (hydration group by month with empty data)', async () => {
    jest.spyOn(cumulativeScoreRepository, 'count').mockResolvedValue(0);
    jest.spyOn(cumulativeScoreRepository, 'findMany').mockResolvedValue([]);
    jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);

    const request = {
      userGuid: '1',
      email: 'test@test.com',
      groupBy: CumulativeScoreGroupType.day,
      type: CumulativeScoreTypes.hydration,
      startDate: new Date('2022-07-08T00:00:00Z'),
      endDate: new Date('2022-09-08T00:00:00Z'),
    };
    const scores = await csLoaderService.getScores(request);
    expect(scores).toBeTruthy();
  });
});

import * as userConfigurationService from './user-configuration.service';
import * as userConfigurationRepository from '@repositories/user-configuration.repository';
import analytesUrine from '@repositories/analytes-urine.repository';
import analytesStool from '@repositories/analytes-stool.repository';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import { userService } from '@modules/index/index.service';
import analytesManualRepository from '@repositories/analytes-manual.repository';
import { CumulativeScoreTypes, PrismaClient } from '@prisma/client';
import { IUser } from '@modules/user/user.type';
import { IStoolData, IUrineData } from '@modules/analytes/analytes.type';
import { ICumulativeBaselineValue } from '@modules/cumulative-score/cumulative-score.type';
import { IUserConfigurationRequestDto } from '@modules/user-configuration/dtos/base.dto';
import * as profileService from '@modules/profile/profile.service';
import { IProfile } from '@modules/profile/profile.type';
import userRepository from '@repositories/user.repository';
import { generateUser } from '@test/utils/generate';
import profileRepository from '@repositories/profile.repository';

const analyteBound = {
  contributionPercentage: 1,
  baseline: 10,
  warningLowerBound: 5,
  normalLowerBound: 2,
  normalUpperBound: 4,
  warningUpperBound: 7,
  minimumLowerBound: 2,
  maximumUpperBound: 10,
};
const userConfigurationTypeObject = {
  id: 1,
  profileId: 1,
  configuration: {
    hydration: {
      baseline: 1,
      trendIndicator: 'good',
      optimumRangeLow: 1,
      needsImprovementUpperBound: 1,
      warningUpperBound: 1,
      analytes: {
        concentration: analyteBound,
        color: analyteBound,
        frequency: analyteBound,
        durationInSeconds: analyteBound,
      },
    },
    gutHealth: {
      baseline: 1,
      trendIndicator: 'good',
      optimumRangeLow: 1,
      needsImprovementUpperBound: 1,
      warningUpperBound: 1,
      analytes: {
        consistency: analyteBound,
        color: analyteBound,
        frequency: analyteBound,
        durationInSeconds: analyteBound,
      },
    },
    minScoresForAvg: 1,
    avgScoreWindowSize: 1,
    firstSampleDate: '07/08/2022',
  },
};

const userObject = generateUser({ id: 2 });

beforeEach(() => {
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userObject);
  jest.spyOn(userService, 'findByUserGuid').mockResolvedValue(userObject);

  jest.spyOn(PrismaClient.prototype, '$queryRawUnsafe').mockResolvedValue(null);
  jest.spyOn(userService, 'findOne').mockResolvedValue({
    id: 1,
  } as IUser);
  jest.spyOn(profileService, 'findProfileByUserId').mockResolvedValue({
    id: 1,
  } as IProfile);

  jest.spyOn(profileService, 'findProfileByUserGuid').mockResolvedValue({
    id: 1,
  } as IProfile);

  jest
    .spyOn(userConfigurationRepository, 'upsertUserConfiguration')
    .mockResolvedValue(userConfigurationTypeObject);
  jest
    .spyOn(userConfigurationRepository, 'getUserConfiguration')
    .mockResolvedValue(null);

  jest.spyOn(analytesManualRepository, 'findMany').mockResolvedValue([]);
  jest.spyOn(analytesUrine, 'findMany').mockResolvedValue([]);
  jest.spyOn(analytesUrine, 'findMaxValue').mockResolvedValue(null);
  jest.spyOn(analytesUrine, 'findFirst').mockResolvedValue({
    startDate: new Date(),
  } as IUrineData);

  jest.spyOn(analytesStool, 'findMany').mockResolvedValue([]);
  jest.spyOn(analytesStool, 'findMaxValue').mockResolvedValue(null);
  jest.spyOn(analytesStool, 'findFirst').mockResolvedValue({
    startDate: new Date(),
  } as IStoolData);

  jest
    .spyOn(cumulativeScoreRepository, 'findManyBaseLineValue')
    .mockResolvedValue([]);
  jest
    .spyOn(cumulativeScoreRepository, 'updateBaseLineValue')
    .mockResolvedValue({} as ICumulativeBaselineValue);
  jest
    .spyOn(cumulativeScoreRepository, 'createBaseLineValue')
    .mockResolvedValue({} as ICumulativeBaselineValue);
  jest.spyOn(cumulativeScoreRepository, 'findMany').mockResolvedValue(null);

  jest
    .spyOn(userRepository, 'findFirstByProfileId')
    .mockResolvedValue(userObject);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('User configuration', () => {
  test('should test upsertUserConfiguration function', async () => {
    const upsertUserConfiguration =
      await userConfigurationService.upsertUserConfiguration(1, {
        hydration: {},
        gutHealth: {},
      } as IUserConfigurationRequestDto);
    expect(upsertUserConfiguration).toBeUndefined();
  });

  test('should test getUserConfiguration function', async () => {
    const getUserConfiguration =
      await userConfigurationService.getUserConfiguration('1');
    expect(getUserConfiguration).toBeTruthy();
  });
  test('should test getBaselineValue function', async () => {
    jest.spyOn(profileRepository, 'findByUserId').mockResolvedValue({
      id: 1,
    } as IProfile);
    jest
      .spyOn(cumulativeScoreRepository, 'findManyBaseLineValue')
      .mockResolvedValue([
        {
          id: 1,
          profileId: 1,
          value: 10,
          type: CumulativeScoreTypes.gutHealth,
          updatedAt: new Date(),
          timeOfDay: null,
        },
        {
          id: 2,
          profileId: 2,
          value: 20,
          type: CumulativeScoreTypes.gutHealth,
          updatedAt: new Date(),
          timeOfDay: null,
        },
      ]);
    await userConfigurationService.getBaselineValue(
      1,
      new Date().toString(),
      0,
      3
    );
    expect(cumulativeScoreRepository.findManyBaseLineValue).toBeCalled();
  });
});

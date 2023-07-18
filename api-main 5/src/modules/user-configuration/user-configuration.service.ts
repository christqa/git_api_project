import {
  IGetUserConfigurationResponseDto,
  IUserConfigurationRequestDto,
} from './dtos/user-configuration.index.dto';
import * as userConfigurationRepository from '@repositories/user-configuration.repository';
import { userService } from '@modules/index/index.service';
import { IUserUniqueInput } from '@modules/user/user.type';
import userConfigurationJsonData from './user-configuration.json';
import {
  BaseLineValueType,
  IUserConfigurationType,
} from './user-configuration.type';
import { compareObjectProperties } from '@utils/object.util';
import analytesUrine from '@repositories/analytes-urine.repository';
import analytesStool from '@repositories/analytes-stool.repository';
import moment from 'moment';
import repository from '@repositories/cumulative-score.repository';
import {
  CumulativeScoreTypes,
  ICumulativeBaselineValue,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import { avg } from '@utils/array.util';
import { analyteStoolService, analyteUrineService } from '../analytes';
import {
  IStoolDataWhere,
  IUrineDataWhere,
} from '@modules/analytes/analytes.type';
import { findProfileByUserId } from '@modules/profile/profile.service';
import { userNotFound } from '@modules/user/user.error';
import profileRepository from '@repositories/profile.repository';
import userRepository from '@repositories/user.repository';
import {
  userHasNoProfileData,
  wrongProfileOwner,
} from '@modules/profile/profile.error';

const FORMAT_TIMESTAMP = 'YYYY-MM-DD';
const CALCULATE_BASELINE_WEEK_DAY = 0;
const upsertUserConfiguration = async (
  profileId: number,
  configuration: IUserConfigurationRequestDto
) => {
  const user = await userRepository.findFirstByProfileId(profileId);

  if (!user) {
    throw userNotFound();
  }
  if (!configuration.hydration.baseline) {
    configuration.hydration.baseline = null;
  }
  if (!configuration.gutHealth.baseline) {
    configuration.gutHealth.baseline = null;
  }

  await upsert(profileId, configuration);
};

const upsert = (
  profileId: number,
  configuration: IUserConfigurationRequestDto
): Promise<IUserConfigurationType> => {
  return userConfigurationRepository.upsertUserConfiguration({
    configuration,
    profileId,
  });
};

const getUserConfiguration = async (
  userGuid: string,
  requestProfileId?: number
): Promise<IGetUserConfigurationResponseDto> => {
  let profileId: number;
  if (!requestProfileId) {
    const user = await userService.findByUserGuid(userGuid);
    if (!user) {
      throw userNotFound();
    }
    const { id: storedProfileId } = await findProfileByUserId(user.id);
    profileId = storedProfileId;
  } else {
    // validate Profile
    const profile = await profileRepository.findById(requestProfileId);
    if (!profile) throw userHasNoProfileData();
    const user = await userService.findByUserGuid(userGuid);
    if (user?.id !== profile.userId) throw wrongProfileOwner();
    // set validated profile id
    profileId = requestProfileId;
  }

  const userConfiguration =
    await userConfigurationRepository.getUserConfiguration(profileId);

  let scoringConfiguration: IGetUserConfigurationResponseDto;
  if (
    !userConfiguration ||
    !userConfiguration.configuration ||
    !compareObjectProperties(
      userConfigurationJsonData,
      userConfiguration.configuration
    )
  ) {
    const newConfiguration = await upsert(
      profileId,
      userConfigurationJsonData as IGetUserConfigurationResponseDto
    );

    // workaround to convert Prisma.JsonObject type to IUserConfiguration
    scoringConfiguration =
      newConfiguration.configuration as unknown as IGetUserConfigurationResponseDto;
  } else {
    // workaround to convert Prisma.JsonObject type to IUserConfiguration
    scoringConfiguration =
      userConfiguration.configuration as unknown as IGetUserConfigurationResponseDto;
  }

  const firstSampleDate = await getFirstAnalyteSampleDate(profileId);

  const baselineValue = await getBaselineValue(
    profileId,
    firstSampleDate,
    scoringConfiguration.minScoresForAvg,
    scoringConfiguration.avgScoreWindowSize
  );
  scoringConfiguration.gutHealth.baseline = baselineValue.gutHealth;
  scoringConfiguration.hydration.baseline = null;
  scoringConfiguration.hydration.morningBaseline =
    baselineValue.morningHydration;
  scoringConfiguration.hydration.afternoonBaseline =
    baselineValue.afternoonHydration;
  scoringConfiguration.hydration.nightBaseline = baselineValue.nightHydration;
  const urinationMaximumUpperBound = firstSampleDate
    ? await getUrineMaxValues(userGuid, profileId, firstSampleDate)
    : null;
  const stollMaximumUpperBound = firstSampleDate
    ? await getStoolMaxValues(userGuid, profileId, firstSampleDate)
    : null;
  scoringConfiguration.hydration.analytes.frequency.maximumUpperBound =
    urinationMaximumUpperBound ? +urinationMaximumUpperBound.frequency : 0;
  scoringConfiguration.hydration.analytes.durationInSeconds.maximumUpperBound =
    urinationMaximumUpperBound
      ? +urinationMaximumUpperBound.durationInSeconds
      : 0;
  scoringConfiguration.hydration.analytes.concentration.maximumUpperBound =
    urinationMaximumUpperBound ? +urinationMaximumUpperBound.concentration : 0;

  scoringConfiguration.gutHealth.analytes.frequency.maximumUpperBound =
    stollMaximumUpperBound ? +stollMaximumUpperBound.frequency : 0;
  scoringConfiguration.gutHealth.analytes.durationInSeconds.maximumUpperBound =
    stollMaximumUpperBound ? +stollMaximumUpperBound.durationInSeconds : 0;
  return {
    ...scoringConfiguration,
    firstSampleDate,
  };
};

const getUrineMaxValues = async (
  userGuid: string,
  profileId: number,
  firstSampleDate: string
): Promise<{
  frequency: number;
  durationInSeconds: number;
  concentration: number;
}> => {
  const maxDurationInSeconds = await analytesUrine.findMaxValue(
    {
      profileId,
    },
    'durationInSeconds'
  );
  const maxConcentration = await analytesUrine.findMaxValue(
    {
      profileId,
    },
    'concentration'
  );

  const currentDate = moment();
  const daysDiff = moment().diff(moment(firstSampleDate), 'days') + 1;
  const pastDate = moment().subtract(daysDiff, 'days').toDate();

  const urineData = await analyteUrineService.find({
    userGuid,
    startDate: pastDate,
    endDate: currentDate.toDate(),
  } as IUrineDataWhere);
  const frequency = Math.max(...urineData.map((o) => o.frequency || 0)) || 0;
  return {
    durationInSeconds: maxDurationInSeconds?.durationInSeconds || 0,
    concentration: maxConcentration?.concentration || 0,
    frequency,
  };
};
const getStoolMaxValues = async (
  userGuid: string,
  profileId: number,
  firstSampleDate: string
): Promise<{
  frequency: number;
  durationInSeconds: number;
}> => {
  const maxDurationInSeconds = await analytesStool.findMaxValue(
    {
      profileId,
    },
    'durationInSeconds'
  );

  const currentDate = moment();
  const daysDiff = moment().diff(moment(firstSampleDate), 'days') + 1;
  const pastDate = moment().subtract(daysDiff, 'days').toDate();

  const stoolData = await analyteStoolService.find({
    userGuid,
    startDate: pastDate,
    endDate: currentDate.toDate(),
  } as IStoolDataWhere);
  const frequency = Math.max(...stoolData.map((o) => o.frequency || 0)) || 0;
  return {
    durationInSeconds: maxDurationInSeconds?.durationInSeconds || 0,
    frequency,
  };
};

const getFirstAnalyteSampleDate = async (
  profileId: number
): Promise<string | null> => {
  const firstSampleUrine = await analytesUrine.findFirst({
    profileId,
  });

  const firstSampleStool = await analytesStool.findFirst({
    profileId,
  });

  const firstSampleUrineDate = firstSampleUrine?.startDate
    ? moment(firstSampleUrine.startDate).format(FORMAT_TIMESTAMP).toString()
    : null;

  const firstSampleStoolDate = firstSampleStool?.startDate
    ? moment(firstSampleStool.startDate).format(FORMAT_TIMESTAMP).toString()
    : null;
  // get smallest analytes date
  let firstSampleDate = firstSampleUrineDate;
  if (!firstSampleUrineDate) {
    firstSampleDate = firstSampleStoolDate;
  } else if (firstSampleStoolDate) {
    firstSampleDate =
      firstSampleStoolDate < firstSampleUrineDate
        ? firstSampleStoolDate
        : firstSampleUrineDate;
  }
  return firstSampleDate;
};

const getBaselineValue = async (
  profileId: number,
  firstSampleDate: string | null,
  minScoresForAvg: number,
  avgScoreWindowSize: number
): Promise<BaseLineValueType> => {
  const firstSampleDateDifferent = moment
    .utc()
    .diff(moment(firstSampleDate), 'days');
  if (!firstSampleDate || firstSampleDateDifferent < minScoresForAvg) {
    return {
      gutHealth: null,
      morningHydration: null,
      afternoonHydration: null,
      nightHydration: null,
    };
  }

  const userBaseLineData = await repository.findManyBaseLineValue({
    profileId,
  });

  const gutHealthBaseLine = await upsertBaseLineValue(
    profileId,
    avgScoreWindowSize,
    CumulativeScoreTypes.gutHealth,
    undefined,
    userBaseLineData.find(
      (baseLine) => baseLine.type === CumulativeScoreTypes.gutHealth
    )
  );
  const hydrationMorningBaseLine = await upsertBaseLineValue(
    profileId,
    avgScoreWindowSize,
    CumulativeScoreTypes.hydration,
    TimeOfDayEnum.morning,
    userBaseLineData.find(
      (baseLine) => baseLine.timeOfDay === TimeOfDayEnum.morning
    )
  );
  const hydrationAfternoonBaseLine = await upsertBaseLineValue(
    profileId,
    avgScoreWindowSize,
    CumulativeScoreTypes.hydration,
    TimeOfDayEnum.afternoon,
    userBaseLineData.find(
      (baseLine) => baseLine.timeOfDay === TimeOfDayEnum.afternoon
    )
  );
  const hydrationNightBaseLine = await upsertBaseLineValue(
    profileId,
    avgScoreWindowSize,
    CumulativeScoreTypes.hydration,
    TimeOfDayEnum.night,
    userBaseLineData.find(
      (baseLine) => baseLine.timeOfDay === TimeOfDayEnum.night
    )
  );

  return {
    gutHealth: gutHealthBaseLine,
    morningHydration: hydrationMorningBaseLine,
    afternoonHydration: hydrationAfternoonBaseLine,
    nightHydration: hydrationNightBaseLine,
  };
};

const upsertBaseLineValue = async (
  profileId: number,
  avgScoreWindowSize: number,
  type: CumulativeScoreTypes,
  timeOfDay?: TimeOfDayEnum,
  baselineData?: {
    updatedAt: Date;
    value: number;
    id: number;
  } | null
): Promise<number | null> => {
  const lastWeekDay = moment()
    .weekday(CALCULATE_BASELINE_WEEK_DAY)
    .startOf('day');
  if (
    !baselineData?.value ||
    !baselineData?.updatedAt ||
    moment(baselineData.updatedAt).isBefore(lastWeekDay.endOf('day'))
  ) {
    const baselineValue = await calculateBaselineValue(
      profileId,
      avgScoreWindowSize,
      type,
      timeOfDay
    );
    if (!baselineValue) {
      return null;
    }
    if (baselineData?.id) {
      await repository.updateBaseLineValue(
        {
          id: baselineData.id,
        },
        {
          value: baselineValue,
          updatedAt: lastWeekDay.toDate(),
        } as ICumulativeBaselineValue
      );
    } else {
      await repository.createBaseLineValue({
        profileId,
        type,
        value: baselineValue,
        timeOfDay,
        updatedAt: lastWeekDay.toDate(),
      } as ICumulativeBaselineValue);
    }
    return baselineValue;
  } else {
    return baselineData.value;
  }
};

const calculateBaselineValue = async (
  profileId: number,
  avgScoreWindowSize: number,
  type: CumulativeScoreTypes,
  timeOfDay?: TimeOfDayEnum
): Promise<number | null> => {
  const lastWeekDay = moment()
    .weekday(CALCULATE_BASELINE_WEEK_DAY)
    .startOf('day');
  const endDate = lastWeekDay.endOf('day').toDate();
  const startDate = lastWeekDay
    .startOf('day')
    .subtract(avgScoreWindowSize, 'days')
    .toDate();
  const scores = await repository.findMany(
    profileId,
    true,
    timeOfDay,
    startDate,
    endDate,
    type,
    'asc'
  );

  if (!scores || !scores.length) {
    return null;
  }

  return avg(scores.map(({ value }) => value || 0));
};

export { upsertUserConfiguration, getUserConfiguration, getBaselineValue };

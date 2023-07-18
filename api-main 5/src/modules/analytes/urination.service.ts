import repository from '@repositories/analytes-urine.repository';
import moment from 'moment';
import {
  getDateWithFixedOffset,
  getDateWithFixedTime,
  getMaxEndDate,
  getNDayAgoDate,
} from '@utils/date.util';
import {
  deviceActivationService,
  userService,
} from '@modules/index/index.service';
import { IUserUniqueInput } from '@modules/user/user.type';
import {
  AnalyteTypes,
  IAnalytesManualEntry,
  IAnalytesManualEntrySNS,
  IUrineColorType,
  IUrineData,
  IUrineDataDelete,
  IUrineDataPayload,
  IUrineDataWhere,
} from './analytes.type';

import {
  IAnalyteRequestDto,
  ICreateUrineDataInternalRequestDto,
  ICreateUrineDataRequestDto,
  IFileUpsertUrinationResponseDto,
  IGetUrineResponseDto,
} from './dtos/analytes.index.dto';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import {
  CumulativeScoreTypes,
  IDailyUrineValue,
  TimeOfDayEnum,
} from '@modules/cumulative-score/cumulative-score.type';
import ApiError from '@core/error-handling/api-error';
import { removeByteOrderMark } from '@utils/object.util';
import {
  dataFromTheFuture,
  getAnalyteDateInTheFuture,
} from '@modules/analytes/analytes.error';
import { IUrineDataInternalToDBRequestDto } from '@modules/analytes/dtos/internal.dto';
import { EventSource, Prisma, UrineData } from '@prisma/client';
import { publishAnalytesSNS } from '../../lib/sns.client';
import { analyteStoolService } from '.';
import {
  findProfileByUserGuid,
  findProfileByUserId,
} from '@modules/profile/profile.service';
import { userHasNoProfileData } from '@modules/profile/profile.error';
import {
  ICumulativeScoreResponseDto2,
  IScoresHydration,
} from '@modules/cumulative-score/dtos/cumulative-score.index.dto';
import { DATE_FORMAT_ISO8601 } from '../../constants';
import { start } from 'repl';

const START_DATE = -365;

const enrichUrineResponse = async (
  userGuid: string,
  response: ICumulativeScoreResponseDto2
) => {
  const profile = await findProfileByUserGuid(userGuid);
  if (!response.hydration || !response.hydration?.scores.length) {
    return response;
  }

  const getTimeOfDayObject = (
    dailyUrineValue: IDailyUrineValue,
    timeOfDay: UrineData[]
  ) => {
    return {
      value: dailyUrineValue.value !== null ? dailyUrineValue.value : null,
      trendIndicator:
        dailyUrineValue.value !== null ? dailyUrineValue.trendIndicator : null,
      lastUrineDate:
        timeOfDay.length !== 0 && dailyUrineValue.value !== null
          ? getDateWithFixedOffset(
              timeOfDay[timeOfDay.length - 1].endDate,
              timeOfDay[timeOfDay.length - 1].offsetTz
            )
          : null,
      lastUrineColor:
        timeOfDay.length !== 0 && dailyUrineValue.value !== null
          ? timeOfDay[timeOfDay.length - 1].color ===
            IUrineColorType.WellHydrated
            ? 'wellHydrated'
            : 'hydrationDeficient'
          : null,
    };
  };

  for (let idx = 0; idx < response.hydration.scores.length; idx++) {
    const scoreItem = response.hydration.scores[idx];
    const dailyUrineValues = response.hydration.scores[idx].dailyUrineValue;
    const scoreItemWithLastUrine: IScoresHydration = {
      date: scoreItem.date,
      value: null,
      morning: {
        value: null,
        trendIndicator: null,
        lastUrineDate: null,
        lastUrineColor: null,
      },
      afternoon: {
        value: null,
        trendIndicator: null,
        lastUrineDate: null,
        lastUrineColor: null,
      },
      night: {
        value: null,
        trendIndicator: null,
        lastUrineDate: null,
        lastUrineColor: null,
      },
    };

    const scoreDate = moment(scoreItem.date + 'Z', 'MM/DD/YYYYZ').toDate();
    const [morning, afternoon, night] = await dailyUrine(profile.id, scoreDate);
    dailyUrineValues?.forEach((dailyUrineValue) => {
      if (dailyUrineValue.timeOfDay === TimeOfDayEnum.morning) {
        scoreItemWithLastUrine.morning = getTimeOfDayObject(
          dailyUrineValue,
          morning
        );
      } else if (dailyUrineValue.timeOfDay === TimeOfDayEnum.afternoon) {
        scoreItemWithLastUrine.afternoon = getTimeOfDayObject(
          dailyUrineValue,
          afternoon
        );
      } else {
        scoreItemWithLastUrine.night = getTimeOfDayObject(
          dailyUrineValue,
          night
        );
      }
    });
    response.hydration.scores[idx] = scoreItemWithLastUrine;
  }
  return response;
};

const dailyUrine = async (profileId: number, scoreDate: Date) => {
  const urines = await repository.findManyWithScoreDate(profileId, scoreDate);
  const morning = urines.filter(
    (urine) =>
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isAfter(moment(urine.scoreDate).utc().hour(4)) &&
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isBefore(moment(urine.scoreDate).utc().hour(11).minute(59).second(59))
  );
  const afternoon = urines.filter(
    (urine) =>
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isAfter(moment(urine.scoreDate).utc().hour(12)) &&
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isBefore(moment(urine.scoreDate).utc().hour(19).minute(59).second(59))
  );
  const night = urines.filter(
    (urine) =>
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isAfter(moment(urine.scoreDate).utc().hour(20)) &&
      moment(getDateWithFixedTime(urine.endDate, urine.offsetTz))
        .utc()
        .isBefore(
          moment(urine.scoreDate)
            .utc()
            .add(1, 'day')
            .hour(3)
            .minute(59)
            .second(59)
        )
  );
  return [morning, afternoon, night];
};

const remove = async (request: IAnalyteRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);
  const profile = await findProfileByUserId(user.id);

  const date = getNDayAgoDate(request.date);

  const result = await repository.remove({
    profileId: profile.id,
    date: date,
  } as IUrineDataDelete);

  return { message: `success, affected row: ${result.count}` };
};

const find = async (
  analytesWhere: IUrineDataWhere,
  groupBy: GroupByFilter = GroupByFilter.day
): Promise<IGetUrineResponseDto[]> => {
  const profile = await findProfileByUserGuid(analytesWhere.userGuid);

  if (!profile) {
    throw userHasNoProfileData();
  }

  let startDate = analytesWhere.startDate;
  if (startDate) {
    startDate = new Date(startDate);
  } else {
    startDate = new Date(
      moment(moment().diff(START_DATE, 'days'))
        .format(DATE_FORMAT_ISO8601)
        .slice(0, -6) + 'Z'
    );
  }
  let endDate = analytesWhere.endDate || new Date();

  if (moment(endDate).diff(startDate, 'days') < 0) {
    throw getAnalyteDateInTheFuture();
  }

  endDate = new Date(getMaxEndDate(analytesWhere.endDate));
  endDate =
    new Date(endDate) ||
    new Date(
      moment(moment().diff(0, 'days'))
        .format(DATE_FORMAT_ISO8601)
        .slice(0, -6) + 'Z'
    );
  const endDateAsDiffNumber = moment().diff(endDate, 'days');

  return await repository.findByAverage(
    profile.id,
    startDate,
    getNDayAgoDate(endDateAsDiffNumber, false),
    groupBy,
    analytesWhere.type,
    'asc'
  );
};

const insertManual = async (
  request: IAnalytesManualEntry,
  userGuid: string
) => {
  const profile = await findProfileByUserGuid(userGuid);
  await sendToSNS({ data: request }, EventSource.ManualEntry, profile.id);
};

const findAndCheckUserDevice = async (email: string) => {
  const user = await userService.findOne({ email });
  await userService.checkUserDeviceByUserId(user.id);
};

const upsertFileData = async ({
  userEmail,
  deleteData,
  file,
}: IFileUpsertUrinationResponseDto) => {
  await findAndCheckUserDevice(userEmail);

  try {
    if (file.mimetype !== 'application/json') {
      throw new ApiError(400, 'file type must be JSON');
    }
    const jsonData = removeByteOrderMark(file.buffer.toString());
    const payload: IUrineDataPayload[] = JSON.parse(
      jsonData
    ) as IUrineDataPayload[];

    const cdto = {
      payload,
      userEmail,
      deleteData: deleteData,
    } as ICreateUrineDataRequestDto;
    await upsertBulk(cdto);
  } catch (e) {
    throw new ApiError(400, 'Invalid Analyte JSON');
  }
};

const upsertBulk = async (request: ICreateUrineDataRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);

  const device = await analyteStoolService.getUserDeviceIdSerial(user.id);

  const profile = await findProfileByUserId(user.id);

  if (request.deleteData) {
    await repository.remove({
      profileId: profile.id,
    });
    await cumulativeScoreRepository.remove({
      profileId: profile.id,
      type: CumulativeScoreTypes.hydration,
    });
  }

  // check payload
  if (!request.payload.length) {
    return;
  }

  for (const analyte of request.payload) {
    if (!analyte.data?.length) {
      continue;
    }

    for (const analyteItem of analyte.data) {
      if (moment().diff(analyteItem.startDate, 'days') < 0) {
        throw dataFromTheFuture();
      }
    }

    await sendToSNS(
      analyte,
      EventSource.DeviceGenerated,
      profile.id,
      device.deviceSerial
    );
  }
};
const removeUrinationData = async (profileId: number) => {
  await repository.remove({
    profileId: profileId,
  });
  await cumulativeScoreRepository.remove({
    profileId: profileId,
    type: CumulativeScoreTypes.hydration,
  });
};
const upsertInternal = async (request: ICreateUrineDataInternalRequestDto) => {
  const { userGuid, ...payload } = request.payload;
  const user = await userService.findOne({
    userGuid,
  } as IUserUniqueInput);

  return upsertBulk({
    userEmail: user.email,
    payload: [payload],
  });
};

const upsertInternalToDB = async (
  request: IUrineDataInternalToDBRequestDto[]
) => {
  // get devices offsets
  const deviceToOffset = await deviceActivationService.getDeviceToOffset(
    request.map((item) => item.deviceId)
  );

  // add device offset to each entry
  const urineData = request.map((item) => ({
    profileId: item.profileId,
    deviceId: item.deviceId,
    color: item.color,
    durationInSeconds: item.durationInSeconds,
    startDate: item.startDate,
    endDate: item.endDate,
    scoreDate: item.scoreDate,
    concentration: new Prisma.Decimal(+item.concentration),
    firstInDay: item.firstInDay,
    offsetTz: deviceToOffset[item.deviceId],
  })) as IUrineData[];

  // save data
  await repository.createMany(urineData);
};

const getUrination = async (
  profileId: number,
  startDate: Date,
  firstInDay?: boolean,
  endDate?: Date,
  type?: AnalyteTypes,
  sortOrder?: 'asc' | 'desc'
): Promise<IUrineData[]> => {
  return repository.findMany(
    profileId,
    startDate,
    firstInDay,
    endDate,
    type,
    sortOrder
  );
};

const existingDataForDay = async (
  profileId: number,
  scoreDate: string
): Promise<boolean> => {
  const urination = await repository.findFirst({
    profileId,
    scoreDate,
  });
  return Boolean(urination);
};

const sendToSNS = async (
  { data }: IUrineDataPayload | IAnalytesManualEntrySNS,
  eventSource: EventSource,
  profileId: number,
  deviceSerial?: string,
  cameraNeedsAlignment?: boolean
) => {
  const Message = {
    default: `deviceSerial:${deviceSerial}|group:Health|type:Urine`,
    eventSource,
    profileId,
    deviceSerial,
    cameraNeedsAlignment,
    group: 'Health',
    type: 'Urine',
    data,
  };
  const MessageAttributes = {
    type: { DataType: 'String', StringValue: 'Urine' },
    group: { DataType: 'String', StringValue: 'Health' },
  };
  await publishAnalytesSNS(MessageAttributes, Message);
};

export {
  findProfileByUserGuid,
  findAndCheckUserDevice,
  upsertBulk,
  getUrination,
  find,
  remove,
  insertManual,
  upsertFileData,
  upsertInternal,
  upsertInternalToDB,
  existingDataForDay,
  sendToSNS,
  removeUrinationData,
  enrichUrineResponse,
};

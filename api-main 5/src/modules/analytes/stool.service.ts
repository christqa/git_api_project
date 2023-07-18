import repository from '@repositories/analytes-stool.repository';
import manualRepository from '@repositories/analytes-manual.repository';
import cumulativeScoreRepository from '@repositories/cumulative-score.repository';
import groupDevicesRepository from '@repositories/group-devices.repository';
import moment from 'moment';
import {
  getDateWithFixedOffset,
  getMaxEndDate,
  getNDayAgoDate,
} from '@utils/date.util';
import {
  deviceActivationService,
  userService,
} from '@modules/index/index.service';
import { IUserUniqueInput } from '@modules/user/user.type';
import { IGroupDeviceExtended } from '@modules/groups/groups.type';
import {
  AnalyteTypes,
  IAnalytesManualEntry,
  IAnalytesManualEntrySNS,
  IStoolData,
  IStoolDataDelete,
  IStoolDataPayload,
  IStoolDataWhere,
  StoolConsistencyEnum,
} from './analytes.type';

import {
  IAnalyteRequestDto,
  ICreateStoolDataInternalRequestDto,
  ICreateStoolDataRequestDto,
  IFileUpsertStoolResponseDto,
  IGetStoolDataResponseDto,
} from './dtos/analytes.index.dto';
import { GroupByFilter } from '@modules/user-configuration/dtos/user-configuration.index.dto';
import { CumulativeScoreTypes } from '@modules/cumulative-score/cumulative-score.type';
import ApiError from '@core/error-handling/api-error';
import { deepClone, removeByteOrderMark } from '@utils/object.util';
import {
  dataFromTheFuture,
  getAnalyteDateInTheFuture,
  userWithoutGroupDevice,
} from '@modules/analytes/analytes.error';
import { publishAnalytesSNS } from '../../lib/sns.client';
import { IStoolDataInternalToDBRequestDto } from '@modules/analytes/dtos/internal.dto';
import { EventSource, Prisma } from '@prisma/client';
import {
  findProfileByUserId,
  findProfileByUserGuid,
} from '@modules/profile/profile.service';
import { userNotFound } from '@modules/user/user.error';
import { userHasNoProfileData } from '@modules/profile/profile.error';
import {
  ICumulativeScoreResponseDto2,
  ICumulativeScoreResponseDto3,
  IScoresGutHealth,
} from '@modules/cumulative-score/dtos/cumulative-score.index.dto';
import { DATE_FORMAT_ISO8601 } from '../../constants';

const stoolConsistencyMap: { [key: number]: string } = {
  [StoolConsistencyEnum.CONSTIPATED]: 'constipated',
  [StoolConsistencyEnum.NORMAL]: 'normal',
  [StoolConsistencyEnum.DIARRHEA]: 'diarrhea',
};

const enrichStoolResponse = async (
  userGuid: string,
  response: ICumulativeScoreResponseDto2
) => {
  const profile = await findProfileByUserGuid(userGuid);
  if (!response.gutHealth || !response.gutHealth?.scores.length) {
    return response;
  }
  const response2 = deepClone(response);
  for (let idx = 0; idx < response.gutHealth.scores.length; idx++) {
    const scoreItem = response.gutHealth.scores[idx];
    const scoreItemWithLastStool: IScoresGutHealth =
      scoreItem as IScoresGutHealth;

    let stoolItem = await repository.findFirst({
      profileId: profile.id,
      scoreDate: moment(scoreItem.date).toDate(),
    });

    if (!stoolItem) {
      stoolItem = await repository.findFirst(
        {
          profileId: profile.id,
          scoreDate: {
            lte: moment(scoreItem.date, 'MM/DD/YYYY')
              .subtract(6, 'days')
              .toDate(),
          },
        },
        Prisma.SortOrder.desc
      );
    }
    if (!stoolItem) {
      scoreItemWithLastStool.lastStoolDate = null;
      scoreItemWithLastStool.lastStoolConsistency = null;
    } else {
      scoreItemWithLastStool.lastStoolDate = getDateWithFixedOffset(
        stoolItem.endDate,
        stoolItem.offsetTz
      );
      scoreItemWithLastStool.lastStoolConsistency =
        stoolConsistencyMap[stoolItem.consistency];
    }
    response2.gutHealth!.scores[idx] = scoreItemWithLastStool;
  }
  return response2 as ICumulativeScoreResponseDto3;
};

const START_DATE = -365;
const remove = async (request: IAnalyteRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);
  const profile = await findProfileByUserId(user.id);

  const date = getNDayAgoDate(request.date);

  const result = await repository.remove({
    profileId: profile.id,
    date: date,
  } as IStoolDataDelete);

  return { message: `success, affected row: ${result.count}` };
};

const find = async (
  analytesWhere: IStoolDataWhere,
  groupBy: GroupByFilter = GroupByFilter.day
): Promise<IGetStoolDataResponseDto[]> => {
  const profile = await findProfileByUserGuid(analytesWhere.userGuid);

  if (!profile) {
    throw userHasNoProfileData();
  }

  let startDate = analytesWhere.startDate;
  startDate =
    new Date(startDate) ||
    new Date(
      moment(moment().diff(START_DATE, 'days'))
        .format(DATE_FORMAT_ISO8601)
        .slice(0, -6) + 'Z'
    );
  let endDate = new Date(analytesWhere.endDate) || new Date();

  if (moment(endDate).diff(startDate, 'days') < 0) {
    throw getAnalyteDateInTheFuture();
  }

  endDate = new Date(getMaxEndDate(analytesWhere.endDate));
  const endDateAsDiffNumber = moment().diff(endDate, 'days');
  return (
    (await repository.findByAverage(
      profile.id,
      startDate,
      getNDayAgoDate(endDateAsDiffNumber, false),
      groupBy,
      analytesWhere.type || '',
      'asc'
    )) || []
  );
};

const insertManual = async (
  request: IAnalytesManualEntry,
  userGuid: string
) => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const profile = await findProfileByUserId(userId);
  await sendToSNS({ data: request }, EventSource.ManualEntry, profile.id);
};

const upsertInternalManualToDB = async (request: IAnalytesManualEntry) => {
  await manualRepository.createMany([request]);
};

const findAndCheckUserDevice = async (email: string) => {
  const user = await userService.findOne({ email });
  await userService.checkUserDeviceByUserId(user.id);
};

const upsertFileData = async ({
  userEmail,
  deleteData,
  file,
}: IFileUpsertStoolResponseDto) => {
  await findAndCheckUserDevice(userEmail);

  try {
    if (file.mimetype !== 'application/json') {
      throw new ApiError(400, 'file type must be JSON');
    }
    const jsonData = removeByteOrderMark(file.buffer.toString());
    const payload: IStoolDataPayload[] = JSON.parse(
      jsonData
    ) as IStoolDataPayload[];

    const cdto = {
      payload,
      userEmail,
      deleteData: deleteData,
    } as ICreateStoolDataRequestDto;
    await upsertBulk(cdto);
  } catch (e) {
    throw new ApiError(400, 'Invalid Analyte JSON');
  }
};

const upsertBulk = async (request: ICreateStoolDataRequestDto) => {
  const user = await userService.findOne({
    email: request.userEmail,
  } as IUserUniqueInput);

  const device = await getUserDeviceIdSerial(user.id);
  const profile = await findProfileByUserId(user.id);

  if (request.deleteData) {
    await repository.remove({
      profileId: profile.id,
    });
    await cumulativeScoreRepository.remove({
      profileId: profile.id,
      type: CumulativeScoreTypes.gutHealth,
    });
  }

  for (const analyte of request.payload) {
    if (!analyte.data || !analyte.data.length) {
      return;
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

const upsertInternal = async (request: ICreateStoolDataInternalRequestDto) => {
  const { userGuid, ...payload } = request.payload;
  const user = await userService.findOne({
    userGuid,
  } as IUserUniqueInput);

  return upsertBulk({
    userEmail: user.email,
    payload: [payload],
  });
};

const sendToSNS = async (
  { data }: IStoolDataPayload | IAnalytesManualEntrySNS,
  eventSource: EventSource,
  profileId: number,
  deviceSerial?: string,
  cameraNeedsAlignment?: boolean
) => {
  const Message = {
    default: `deviceSerial:${deviceSerial}|group:Health|type:Stool`,
    profileId,
    eventSource,
    deviceSerial,
    cameraNeedsAlignment,
    group: 'Health',
    type: 'Stool',
    data,
  };
  const MessageAttributes = {
    type: { DataType: 'String', StringValue: 'Stool' },
    group: { DataType: 'String', StringValue: 'Health' },
  };
  await publishAnalytesSNS(MessageAttributes, Message);
};

const upsertInternalToDB = async (data: IStoolDataInternalToDBRequestDto[]) => {
  // get devices offsets
  const deviceToOffset = await deviceActivationService.getDeviceToOffset(
    data.map((item) => item.deviceId)
  );

  // add device offset to each entry
  const stoolData = data.map((item) => ({
    ...item,
    offsetTz: deviceToOffset[item.deviceId],
  })) as IStoolData[];

  // save data
  await repository.createMany(stoolData);
};

const getStools = async (profileId: number, startDate: Date, endDate: Date) => {
  return repository.findMany(profileId, startDate, endDate);
};

const getAnalytesManual = async (
  profileId: number,
  startDate: Date,
  endDate: Date,
  sortOrder: 'asc' | 'desc',
  type: AnalyteTypes
): Promise<IAnalytesManualEntry[]> => {
  return manualRepository.findMany(
    profileId,
    startDate,
    endDate,
    sortOrder,
    type
  );
};

const getUserDeviceIdSerial = async (userId: number) => {
  const userDevice = (await groupDevicesRepository.findFirst({
    group: {
      deleted: null,
      groupUsers: {
        some: {
          userId,
          deleted: null,
        },
      },
    },
  })) as IGroupDeviceExtended;
  if (!userDevice?.deviceInventory?.deviceSerial) {
    throw userWithoutGroupDevice();
  }
  return {
    deviceId: userDevice.deviceInventory.id,
    deviceSerial: userDevice.deviceInventory.deviceSerial,
  };
};

const removeStoolData = async (profileId: number) => {
  await repository.remove({
    profileId: profileId,
  });
  await cumulativeScoreRepository.remove({
    profileId: profileId,
    type: CumulativeScoreTypes.gutHealth,
  });
};

export {
  upsertBulk,
  sendToSNS,
  find,
  remove,
  insertManual,
  upsertFileData,
  upsertInternal,
  upsertInternalToDB,
  getStools,
  getAnalytesManual,
  upsertInternalManualToDB,
  getUserDeviceIdSerial,
  removeStoolData,
  enrichStoolResponse,
};

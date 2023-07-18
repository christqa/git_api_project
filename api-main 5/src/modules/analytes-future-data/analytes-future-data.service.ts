import {
  IFutureAnalyteRequestDto,
  IFutureAnalyteResponseDto,
  IFutureStoolRequestDto,
  IFutureUrineRequestDto,
} from './dtos/base.dto';
import {
  AnalyteTypes,
  IStoolDataPayload,
} from '@modules/analytes/analytes.type';
import {
  createManyStoolFutureData,
  createManyUrineFutureData,
  findStoolFutureData,
  findUrineFutureData,
  removeManyStoolFutureData,
  removeManyUrineFutureData,
  updateStoolFutureData,
  updateUrineFutureData,
} from '@repositories/future-data.repository';
import {
  IBatchCount,
  IStoolFutureData,
  IUrineFutureData,
} from './analytes-future-data.type';
import moment from 'moment';
import ApiError from '@core/error-handling/api-error';
import { Prisma } from '@prisma/client';
import * as userService from '@modules/user/user.service';

const getFutureAnalyteData = async ({
  type,
  ...futureParams
}: IFutureAnalyteRequestDto): Promise<IFutureAnalyteResponseDto> => {
  if (type === AnalyteTypes.stool) {
    const [count, data] = await findStoolFutureData(futureParams);
    return {
      count,
      data,
    };
  } else {
    const [count, data] = await findUrineFutureData(futureParams);
    return {
      count,
      data: data.map((item) => ({
        ...item,
        concentration: Number(item.concentration),
      })),
    };
  }
};

const updateFutureAnalyteData = async ({
  type,
  ...updateParams
}: IFutureAnalyteRequestDto): Promise<IBatchCount> => {
  if (type === AnalyteTypes.stool) {
    return updateStoolFutureData(updateParams);
  } else {
    return updateUrineFutureData(updateParams);
  }
};

const addUrineData = async (inputDto: IFutureUrineRequestDto) => {
  const user = await userService.findOne({ email: inputDto.userEmail });
  await userService.checkUserDeviceByUserId(user.id);

  await removeManyUrineFutureData({
    email: inputDto.userEmail,
  });

  // check payload
  if (!inputDto.payload.length) {
    return;
  }

  const analytes: IUrineFutureData[] = [];

  // parse payload
  const today = moment();
  for (const analyte of inputDto.payload) {
    if (!analyte.data?.length) {
      continue;
    }

    for (const entry of analyte.data) {
      if (moment(entry.startDate).diff(today) < 0) {
        throw new ApiError(400, `startDate ${entry.startDate} is in the past`);
      }

      analytes.push({
        email: inputDto.userEmail,
        color: entry.color,
        durationInSeconds: entry.durationInSeconds,
        startDate: entry.startDate,
        endDate: entry.endDate,
        concentration: new Prisma.Decimal(+entry.concentration),
      } as IUrineFutureData);
    }
  }

  return createManyUrineFutureData(analytes);
};

const addStoolData = async (inputDto: IFutureStoolRequestDto) => {
  const user = await userService.findOne({ email: inputDto.userEmail });
  await userService.checkUserDeviceByUserId(user.id);

  await removeManyStoolFutureData({
    email: inputDto.userEmail,
  });

  const analytes: IStoolFutureData[] = [];
  const today = moment();
  inputDto.payload.forEach((analyte: IStoolDataPayload) => {
    if (!analyte.data || !analyte.data.length) {
      return;
    }

    for (const entry of analyte.data) {
      if (moment(entry.startDate).diff(today) < 0) {
        throw new ApiError(400, `startDate ${entry.startDate} is in the past`);
      }

      analytes.push({
        email: inputDto.userEmail,
        color: entry.color,
        hasBlood: entry.hasBlood,
        durationInSeconds: entry.durationInSeconds,
        consistency: entry.consistency,
        startDate: entry.startDate,
        endDate: entry.endDate,
      } as IStoolFutureData);
    }
  });

  return createManyStoolFutureData(analytes);
};

export {
  getFutureAnalyteData,
  updateFutureAnalyteData,
  addUrineData,
  addStoolData,
};

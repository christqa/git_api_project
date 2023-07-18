import { IAnalytesWhere } from './analytes-combined.type';
import { userHasNoProfileData } from '@modules/profile/profile.error';
import analytesStoolRepository from '@repositories/analytes-stool.repository';
import analytesUrineRepository from '@repositories/analytes-urine.repository';
import moment from 'moment';
import {
  IAnalytesCombinedResponseDTO,
  IAnalyteDataType,
} from './dtos/analytes-combined.dto';
import { getAnalyteDateInTheFuture } from '@modules/analytes/analytes.error';
import { AnalyteTypes } from '@modules/analytes/analytes.type';
import { analyteStoolService } from '@modules/analytes';
import {
  deviceActivationService,
  profileService,
  userService,
} from '@modules/index/index.service';
import { userNotFound } from '@modules/user/user.error';
import { getDateWithFixedOffset } from '@utils/date.util';
import ApiError from '@core/error-handling/api-error';
import httpStatus from 'http-status';

const findAnalytes = async (analytesWhere: IAnalytesWhere) => {
  // get user
  const user = await userService.findByUserGuid(analytesWhere.userGuid);
  if (!user) {
    throw userNotFound();
  }

  // get user profile
  const profile = await profileService.findProfileByUserId(user.id);
  if (!profile) {
    throw userHasNoProfileData();
  }

  // get device offsetTz
  const deviceOffsetTz = await getDeviceOffsetTz(user.id, profile.id);
  if (!deviceOffsetTz) {
    return {
      count: 0,
      data: [],
    } as IAnalytesCombinedResponseDTO;
  }

  // compute start/end date with device offset
  const currentDay = moment().utcOffset(deviceOffsetTz);
  let startDate = analytesWhere.startDate || currentDay.format('MM/DD/YYYY');
  let endDate = analytesWhere.endDate || currentDay.format('MM/DD/YYYY');

  // check if end date is in the future
  if (currentDay.diff(moment(endDate, 'MM/DD/YYYY'), 'days') < 0) {
    throw getAnalyteDateInTheFuture();
  }

  // query analytes data
  startDate = moment(startDate, 'MM/DD/YYYY').utc().startOf('day').toDate();
  endDate = moment(endDate, 'MM/DD/YYYY').utc().endOf('day').toDate();

  const stools = await analytesStoolRepository.findManyByDate(
    profile.id,
    startDate,
    endDate
  );
  const urines = await analytesUrineRepository.findManyWithoutFirstInDay(
    profile.id,
    startDate,
    endDate
  );

  // retrieve analytes data
  const data: IAnalyteDataType[] = [];

  if (stools) {
    for (const stool of stools) {
      data.push({
        type: AnalyteTypes.stool,
        durationInSeconds: stool.durationInSeconds,
        startDate: getDateWithFixedOffset(stool.startDate, stool.offsetTz),
        endDate: getDateWithFixedOffset(stool.endDate, stool.offsetTz),
      });
    }
  }
  if (urines) {
    for (const urine of urines) {
      data.push({
        type: AnalyteTypes.urine,
        durationInSeconds: urine.durationInSeconds,
        startDate: getDateWithFixedOffset(urine.startDate, urine.offsetTz),
        endDate: getDateWithFixedOffset(urine.endDate, urine.offsetTz),
      });
    }
  }
  // eslint-disable-next-line
  const sortedData = data.sort((a: any, b: any) => {
    return a.startDate - b.startDate;
  });
  return {
    count: data.length,
    data: sortedData,
  } as IAnalytesCombinedResponseDTO;
};

const getDeviceOffsetTz = async (
  userId: number,
  profileId: number
): Promise<string | null> => {
  try {
    // get user device
    const device = await analyteStoolService.getUserDeviceIdSerial(userId);

    // get device offset
    return await deviceActivationService.getDeviceTimeZoneOffset(
      device.deviceId
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === httpStatus.BAD_REQUEST) {
      // try to get device offset from stool/urine when no device found
      const stool = await analytesStoolRepository.findFirst({
        profileId,
      });
      if (stool) {
        return stool.offsetTz;
      } else {
        const urine = await analytesUrineRepository.findFirst({
          profileId,
        });
        if (urine) {
          return urine.offsetTz;
        }
      }
      return null;
    }
    throw error;
  }
};

export { findAnalytes };

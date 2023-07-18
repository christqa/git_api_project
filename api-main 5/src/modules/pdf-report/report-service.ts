import { IUser } from '@modules/user/user.type';
import moment from 'moment';
import {
  IGetReportRequestDto,
  IGetReportResponseDto,
  IReportRequestDtoFilterType,
  IReportRequestDtoGroupBy,
} from './dtos/report.index.dto';
import { analyteStoolService, analyteUrineService } from '../analytes';
import {
  GroupByFilter,
  IGetUserConfigurationResponseDto,
} from '@modules/user-configuration/dtos/user-configuration.index.dto';
import {
  AnalyteTypes,
  IAnalytesManualEntry,
  IStoolDataWhere,
  IUrineData,
  IUrineDataWhere,
} from '@modules/analytes/analytes.type';
import { getScores } from '@modules/cumulative-score/cs-loader/cs-loader.service';
import profileRepository from '@repositories/profile.repository';
import {
  CumulativeScoreGroupType,
  ICumulativeScoreResponseDto2,
  IGetCumulativeScoreRequestDto2,
} from '@modules/cumulative-score/dtos/cumulative-score.index.dto';
import { getMaxEndDate } from '@utils/date.util';
import { getUserConfiguration } from '@modules/user-configuration/user-configuration.service';
import {
  getMedicalConditionTexts,
  getMedicationTexts,
} from '@modules/user/user.service';
import analytesUrineRepository from '@repositories/analytes-urine.repository';
import analytesManualRepository from '@repositories/analytes-manual.repository';
import analytesStoolRepository from '@repositories/analytes-stool.repository';
import { StoolData } from '@prisma/client';
import { IGetUrineResponseDto } from '@modules/analytes/dtos/get-urinations.dto';
import { IGetStoolDataResponseDto } from '@modules/analytes/dtos/get-stools.dto';

const START_DATE = 365;
const FORMAT_TIMESTAMP = 'YYYY-MM-DDTHH:mm:ssZ';

const doAverage = (
  // eslint-disable-next-line
  inputArray: any[] | undefined,
  field: string,
  numDays?: number
) => {
  if (!inputArray) {
    inputArray = [];
  }
  const records = numDays || inputArray.length;
  if (records <= 0) {
    return 0;
  }
  let value = 0;
  for (const element of inputArray) {
    value += element[field];
  }
  value /= records;
  return value;
};

// eslint-disable-next-line
const formatArrayDateValue = (inputArray: any[], field: any) => {
  const arr: {
    date: string;
    // eslint-disable-next-line
    value: any;
  }[] = [];

  for (const element of inputArray) {
    const { date, [field]: dynamic_prop } = element;
    arr.push({
      date,
      value: dynamic_prop,
    });
  }
  return arr;
};

const doDynamicMaxUpperBound = (
  // eslint-disable-next-line
  inputArray: { date: string; value: any }[],
  currentMaximumUpperBound: number
) => {
  return Math.max(
    ...inputArray.map((item) => item.value),
    currentMaximumUpperBound
  );
};

const generateReportData = async (
  currentUser: IUser,
  request: IGetReportRequestDto
): Promise<IGetReportResponseDto> => {
  if (!request.groupBy) {
    request.groupBy = IReportRequestDtoGroupBy.day;
  }

  if (!request.filterType) {
    request.filterType = IReportRequestDtoFilterType.all;
  }

  const name = currentUser.firstName + ' ' + currentUser.lastName;
  let age = 0;

  currentUser.profile = await getProfile(currentUser);

  if (currentUser.profile?.dob?.length) {
    age = moment().diff(moment(currentUser.profile.dob), 'years');
  } else {
    request.personalData = false;
  }

  const { startDate, endDate } = getStartEndDate(request);
  request.startDate = startDate;
  request.endDate = new Date(endDate);

  const numDays = moment(request.endDate).diff(request.startDate, 'days');

  //day and month are supported by groupby
  const analyteScores: ICumulativeScoreResponseDto2 = await getScores({
    userGuid: currentUser.userGuid,
    email: currentUser.email,
    startDate: request.startDate,
    endDate: request.endDate,
    groupBy: request.groupBy as unknown as CumulativeScoreGroupType,
  } as IGetCumulativeScoreRequestDto2);

  let urinations: IGetUrineResponseDto[] = [],
    stools: IGetStoolDataResponseDto[] = [],
    urinationsEntries: IUrineData[] = [],
    stoolsEntries: StoolData[] | null = [],
    manualEntries: IAnalytesManualEntry[] = [],
    frequencyDetails = [];

  if (
    request.filterType == IReportRequestDtoFilterType.hydration ||
    request.filterType == IReportRequestDtoFilterType.all
  ) {
    urinations = await analyteUrineService.find(
      {
        userGuid: currentUser.userGuid,
        userEmail: currentUser.email,
        startDate: request.startDate,
        endDate: request.endDate,
      } as IUrineDataWhere,
      request.groupBy as unknown as GroupByFilter
    );
    // Queries for frequencyDetails
    urinationsEntries = await analytesUrineRepository.findMany(
      currentUser.id,
      // eslint-disable-next-line
      new Date(request.startDate),
      undefined as any, // include true/false
      new Date(request.endDate)
    );
  }

  if (
    request.filterType == IReportRequestDtoFilterType.gutHealth ||
    request.filterType == IReportRequestDtoFilterType.all
  ) {
    stools = await analyteStoolService.find(
      {
        userGuid: currentUser.userGuid,
        startDate: request.startDate,
        endDate: request.endDate,
      } as IStoolDataWhere,
      request.groupBy as unknown as GroupByFilter
    );

    stoolsEntries = await analytesStoolRepository.findMany(
      currentUser.id,
      new Date(request.startDate),
      new Date(request.endDate)
    );
  }

  if (request.filterType != IReportRequestDtoFilterType.none) {
    manualEntries = await analytesManualRepository.findMany(
      currentUser.id,
      new Date(request.startDate),
      new Date(request.endDate),
      'desc',
      request.filterType == IReportRequestDtoFilterType.gutHealth
        ? AnalyteTypes.stool
        : AnalyteTypes.urine
    );
  }

  frequencyDetails = [
    ...(urinationsEntries || []).map((item) => ({
      ...item,
      date: item.startDate,
      isUrine: true,
    })),
    ...(stoolsEntries || []).map((item) => ({
      ...item,
      date: item.startDate,
      isStool: true,
    })),
    ...(manualEntries || []),
  ].sort((a, b) =>
    moment(a.date).unix() > moment(b.date).unix() ? 1 : -1
  ) as { isUrine: boolean; isStool: true; date: Date }[];

  const { dob } = currentUser.profile;

  const userConfiguration: IGetUserConfigurationResponseDto =
    await getUserConfiguration(currentUser.userGuid);

  const medications = await getMedicationTexts(currentUser.profile);
  const medicalConditions = await getMedicalConditionTexts(currentUser.profile);
  const isBloodInStool = stools.some((elem) => {
    return elem.hasBlood;
  });

  const resp: IGetReportResponseDto = {
    header: {
      dateRange:
        moment(request.startDate).format('MMMM D, YYYY').toString() +
        ' - ' +
        moment(request.endDate).format('MMMM D, YYYY').toString(),
      timePeriod: getTimePeriod(numDays),
      gender: currentUser.profile.gender,
      name,
      age,
      dob,
      medicalConditions,
      medications,
    },
    annotations: [],
    frequencyDetails: [],
  };
  if (
    request.filterType == IReportRequestDtoFilterType.gutHealth ||
    request.filterType == IReportRequestDtoFilterType.all
  ) {
    resp.gutHealth = {
      overall: Math.round(doAverage(analyteScores.gutHealth?.scores, 'value')),
      stoolConsistency: {
        config: userConfiguration.gutHealth.analytes.consistency,
        leftHandSide: doAverage(stools, 'consistency', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(stools, 'consistency'),
        },
      },
      stoolColor: {
        config: userConfiguration.gutHealth.analytes.color,
        leftHandSide: doAverage(stools, 'color', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(stools, 'color'),
        },
      },
      stoolFrequency: {
        config: userConfiguration.gutHealth.analytes.frequency,
        leftHandSide: doAverage(stools, 'frequency', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(stools, 'frequency'),
        },
      },
      stoolDuration: {
        config: userConfiguration.gutHealth.analytes.durationInSeconds,
        leftHandSide: doAverage(stools, 'durationInSeconds', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(stools, 'durationInSeconds'),
        },
      },
      isBloodInStool,
      //TODO https://projectspectra.atlassian.net/browse/SWP-163 for localizing
      bloodInStool: isBloodInStool
        ? 'Blood has been detected in stool.'
        : 'No blood has been detected in stool.',
    };
    // compute dynamic maximumUpperBound
    resp.gutHealth.stoolConsistency.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.gutHealth.stoolConsistency.rightHandSide.analytes,
        resp.gutHealth.stoolConsistency.config.maximumUpperBound
      );
    resp.gutHealth.stoolColor.config.maximumUpperBound = doDynamicMaxUpperBound(
      resp.gutHealth.stoolColor.rightHandSide.analytes,
      resp.gutHealth.stoolColor.config.maximumUpperBound
    );
    resp.gutHealth.stoolFrequency.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.gutHealth.stoolFrequency.rightHandSide.analytes,
        resp.gutHealth.stoolFrequency.config.maximumUpperBound
      );
    resp.gutHealth.stoolDuration.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.gutHealth.stoolDuration.rightHandSide.analytes,
        resp.gutHealth.stoolDuration.config.maximumUpperBound
      );
  }

  if (
    request.filterType == IReportRequestDtoFilterType.hydration ||
    request.filterType == IReportRequestDtoFilterType.all
  ) {
    resp.hydration = {
      overall: Math.round(doAverage(analyteScores.hydration?.scores, 'value')),
      urineColor: {
        config: userConfiguration.hydration.analytes.color,
        leftHandSide: doAverage(urinations, 'color', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(urinations, 'color'),
        },
      },
      urineConcentration: {
        config: userConfiguration.hydration.analytes.concentration,
        leftHandSide: doAverage(urinations, 'concentration', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(urinations, 'concentration'),
        },
      },
      urineFrequency: {
        config: userConfiguration.hydration.analytes.frequency,
        leftHandSide: doAverage(urinations, 'frequency', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(urinations, 'frequency'),
        },
      },
      urineDuration: {
        config: userConfiguration.hydration.analytes.durationInSeconds,
        leftHandSide: doAverage(urinations, 'durationInSeconds', numDays),
        rightHandSide: {
          analytes: formatArrayDateValue(urinations, 'durationInSeconds'),
        },
      },
    };
    resp.hydration.urineColor.config.maximumUpperBound = doDynamicMaxUpperBound(
      resp.hydration.urineColor.rightHandSide.analytes,
      resp.hydration.urineColor.config.maximumUpperBound
    );
    resp.hydration.urineConcentration.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.hydration.urineConcentration.rightHandSide.analytes,
        resp.hydration.urineConcentration.config.maximumUpperBound
      );
    resp.hydration.urineFrequency.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.hydration.urineFrequency.rightHandSide.analytes,
        resp.hydration.urineFrequency.config.maximumUpperBound
      );
    resp.hydration.urineDuration.config.maximumUpperBound =
      doDynamicMaxUpperBound(
        resp.hydration.urineDuration.rightHandSide.analytes,
        resp.hydration.urineDuration.config.maximumUpperBound
      );
  }

  /*
   rightHandSide: {
        analytes: [
          { date: '2022-06-01', value: 2 },
          { date: '2022-06-03', value: 2 }
        ]
      }
  */

  for (const elem of frequencyDetails) {
    resp.frequencyDetails.push({
      date: moment(elem.date).utc().format(FORMAT_TIMESTAMP).toString(),
      time: moment(elem.date).utc().format('hh:mm A'),
      type: elem.isUrine ? 'Urine' : 'Stool',
      annotation: '',
    });
  }

  if (!request.conditionsAndMedications) {
    delete resp.header.medicalConditions;
    delete resp.header.medications;
  }
  if (!request.personalData) {
    delete resp.header.gender;
    delete resp.header.name;
    delete resp.header.age;
    delete resp.header.dob;
  }
  if (!request.annotations) {
    delete resp.annotations;
  }

  return resp;
};

const getProfile = async (currentUser: Omit<IUser, 'id'>) => {
  if (!currentUser.profile) {
    return {
      dob: null,
      gender: 'Other',
      medicalConditionIds: [],
      medicationIds: [],
    };
  } else {
    // eslint-disable-next-line
    let gender: any = await profileRepository.findGenderById(
      currentUser.profile.genderId
    );
    if (!gender) {
      gender = { text: 'Other' };
    }
    return {
      ...currentUser.profile,
      gender: gender.text,
    };
  }
};

const getStartEndDate = (request: IGetReportRequestDto) => {
  const today = new Date();
  let startDate = request.startDate || START_DATE;
  const endDate = getMaxEndDate(request.endDate) || 0;

  //start, end date can be either number or date;
  //if it is number, it means undefined, so convert to Date
  if (typeof startDate == 'number') {
    //convert to date
    const sd = startDate;
    startDate = new Date(
      moment(today).subtract(sd, 'days').format(FORMAT_TIMESTAMP)
    );
  }

  return {
    startDate,
    endDate,
  };
};

const getTimePeriod = (numDays: number) => {
  // TODO: https://projectspectra.atlassian.net/browse/SWP-163 for localizing
  // time period
  let timePeriod = '';
  if (numDays <= 7) {
    timePeriod = 'Past Week';
  } else if (numDays > 7 && numDays <= 14) {
    timePeriod = 'Past 2 Weeks';
  } else if (numDays > 14) {
    timePeriod = 'Past Month';
  }

  return timePeriod;
};

export { generateReportData };

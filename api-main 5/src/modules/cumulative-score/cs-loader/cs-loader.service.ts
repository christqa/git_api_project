import moment from 'moment';
import { avg } from '@utils/array.util';
import { getMaxEndDate, getNDayAgoDate } from '@utils/date.util';
import repository from '@repositories/cumulative-score.repository';
import {
  CumulativeScoreTypes,
  ICumulativeScore,
  IDailyUrineValue,
  TimeOfDayEnum,
} from '../cumulative-score.type';
import {
  CumulativeScoreGroupType,
  IGetCumulativeScoreRequestDto2,
  ICumulativeScoreResponseDto2,
  IScores2,
} from '../dtos/cumulative-score.index.dto';
import * as gutHealthJsonData from './gut-health-21-days.json';
import * as hydrationJsonData from './hydration-21-days.json';
import { findProfileByUserGuid } from '@modules/profile/profile.service';

const dateFormat = 'YYYY-MM-DDTHH:mm:ssZ';

const getScores = async (
  request: IGetCumulativeScoreRequestDto2
): Promise<ICumulativeScoreResponseDto2> => {
  let response = createDefaultLoaderResponse(request);

  let startDate = moment(request.startDate, dateFormat);
  let endDate = moment(
    getMaxEndDate(request.endDate as unknown as Date),
    dateFormat
  ).endOf('day');

  if (request.groupBy == null) {
    request.groupBy = CumulativeScoreGroupType.day;
  }

  if (request.groupBy === CumulativeScoreGroupType.month) {
    startDate = moment(startDate).startOf('month');
    endDate = moment(endDate).endOf('month');
  }

  const profile = await findProfileByUserGuid(request.userGuid);
  const profileId = profile.id;

  let allScoresHydrationMappedLength: number = await repository.count(
    profileId,
    CumulativeScoreTypes.hydration
  );
  let allScoresGutHealthMappedLength: number = await repository.count(
    profileId,
    CumulativeScoreTypes.gutHealth
  );

  console.log('endDate2 ', endDate.toDate());

  let scores =
    (await repository.findMany(
      profileId,
      true,
      null,
      startDate.toDate(),
      endDate.toDate(),
      request.type,
      'asc'
    )) || [];

  if (
    scores.length === 0 &&
    allScoresHydrationMappedLength == 0 &&
    allScoresGutHealthMappedLength == 0 &&
    !request.email.includes('+nodata')
  ) {
    const hasAnyData = (await repository.count(profileId)) !== 0;
    if (hasAnyData) {
      return response;
    }

    scores = getStaticScores2(request.type);

    const allScoresHydrationMapped = mapScores(
      scores?.filter((s) => s.type === CumulativeScoreTypes.hydration)
    );
    const allScoresGutHealthMapped = mapScores(
      scores?.filter((s) => s.type === CumulativeScoreTypes.gutHealth)
    );
    allScoresHydrationMappedLength = allScoresHydrationMapped.length;
    allScoresGutHealthMappedLength = allScoresGutHealthMapped.length;
  } else {
    allScoresHydrationMappedLength = allScoresGutHealthMappedLength =
      scores.length;
  }

  response = getGroupByHydrationResponse(
    request,
    response,
    scores,
    allScoresHydrationMappedLength
  );
  response = getGroupByGutHealthResponse(
    request,
    response,
    scores,
    allScoresGutHealthMappedLength
  );
  return response;
};

const getGroupByHydrationResponse = (
  request: IGetCumulativeScoreRequestDto2,
  response: ICumulativeScoreResponseDto2,
  scores: ICumulativeScore[],
  allScoresHydrationMappedLength: number
) => {
  const hydrationMappedScores = mapUrineScores(
    scores?.filter((s) => s.type === CumulativeScoreTypes.hydration)
  );

  if (
    request.type === CumulativeScoreTypes.hydration ||
    request.type === undefined
  ) {
    if (request.groupBy === CumulativeScoreGroupType.day) {
      response.hydration = {
        scores: hydrationMappedScores,
        total: allScoresHydrationMappedLength,
      };
    } else if (request.groupBy === CumulativeScoreGroupType.month) {
      response.hydration = {
        scores: [],
        total: allScoresHydrationMappedLength,
      };

      if (hydrationMappedScores.length) {
        const grp = groupByDate(hydrationMappedScores);
        response.hydration.scores = grp;
        response.hydration.total = grp.length;
      }
    }
  }

  return response;
};

const getGroupByGutHealthResponse = (
  request: IGetCumulativeScoreRequestDto2,
  response: ICumulativeScoreResponseDto2,
  scores: ICumulativeScore[],
  allScoresGutHealthMappedLength: number
) => {
  const gutHealthMappedScores = mapScores(
    scores?.filter((s) => s.type === CumulativeScoreTypes.gutHealth)
  );

  if (
    request.type === CumulativeScoreTypes.gutHealth ||
    request.type === undefined
  ) {
    if (request.groupBy === CumulativeScoreGroupType.day) {
      response.gutHealth = {
        scores: gutHealthMappedScores,
        total: allScoresGutHealthMappedLength,
      };
    } else if (request.groupBy === CumulativeScoreGroupType.month) {
      response.gutHealth = {
        scores: [],
        total: allScoresGutHealthMappedLength,
      };

      if (gutHealthMappedScores.length) {
        const grp = groupByDate(gutHealthMappedScores);
        response.gutHealth.scores = grp;
        response.gutHealth.total = grp.length;
      }
    }
  }

  return response;
};

const createDefaultLoaderResponse = (
  request: IGetCumulativeScoreRequestDto2
) => {
  return {
    type: request.type,
    groupBy: request.groupBy,
    hydration:
      request.type === CumulativeScoreTypes.hydration
        ? { total: 0, scores: [] }
        : undefined,
    gutHealth:
      request.type === CumulativeScoreTypes.gutHealth
        ? { total: 0, scores: [] }
        : undefined,
  } as ICumulativeScoreResponseDto2;
};

const getStaticScores2 = (type?: CumulativeScoreTypes): ICumulativeScore[] => {
  const scores: ICumulativeScore[] = [];
  let index = 0;

  if (type === CumulativeScoreTypes.gutHealth || type === undefined) {
    for (let i = gutHealthJsonData.scores.length - 1; i >= 0; i--) {
      scores[index] = {
        type: CumulativeScoreTypes.gutHealth,
        date: getNDayAgoDate(gutHealthJsonData.scores[i].date),
        value: gutHealthJsonData.scores[i].value,
      } as ICumulativeScore;
      index++;
    }
  }

  if (type === CumulativeScoreTypes.hydration || type === undefined) {
    for (let i = hydrationJsonData.scores.length - 1; i >= 0; i--) {
      scores[index] = {
        type: CumulativeScoreTypes.hydration,
        date: getNDayAgoDate(hydrationJsonData.scores[i].date),
        value: hydrationJsonData.scores[i].value,
      } as ICumulativeScore;
      index++;
    }
  }

  return scores;
};
const mapUrineScores = (
  scores: ICumulativeScore[]
): {
  date: string;
  value: number | null;
  dailyUrineValue: IDailyUrineValue[];
}[] => {
  const obj: any = {};
  for (let i = 0; i < scores.length; i++) {
    obj[scores[i].date.toISOString()] = [];
  }
  for (let i = 0; i < scores.length; i++) {
    obj[scores[i].date.toISOString()].push({
      timeOfDay: scores[i].timeOfDay,
      value: scores[i].value,
      trendIndicator: scores[i].trendIndicator,
    });
  }
  return Object.keys(obj).map((dates) => ({
    date: moment(dates).format('M/D/YYYY'),
    value: null,
    dailyUrineValue: obj[dates],
  }));
};

const mapScores = (
  scores: ICumulativeScore[]
): {
  date: string;
  value: number | null;
}[] => {
  return scores.map((score) => ({
    date: moment(score.date).format('M/D/YYYY'),
    value: score.value,
    trendIndicator: score.trendIndicator,
  }));
};

const groupByDate = (
  array: {
    date: string | Date;
    value: number | null;
    dailyUrineValue?: IDailyUrineValue[];
  }[]
): IScores2[] => {
  if (array.length === 0) {
    return [];
  }

  const groups = array.reduce(
    (acc, currentScore) => {
      const key = moment(currentScore.date).startOf('month').format('M/D/YYYY');
      if (acc[key]) {
        acc[key].data.push(currentScore);
      } else {
        acc[key] = { group: key, data: [currentScore] };
      }
      return acc;
    },
    {} as {
      [key: string]: {
        group: string;
        data: {
          date: string | Date;
          value: number | null;
          dailyUrineValue?: IDailyUrineValue[];
        }[];
      };
    }
  );
  const result = Object.keys(groups).map((date) => {
    const score = parseFloat(
      avg(
        groups[date].data.map((s: { value: number | null }) => s.value || 0)
      ).toFixed(3)
    );
    const urineResult = groups[date].data.map((v) =>
      v.dailyUrineValue?.map((dv) => dv)
    );
    let morningSum = 0;
    let morningCount = 0;
    let afternoonSum = 0;
    let afternoonCount = 0;
    let nightCount = 0;
    let nightSum = 0;
    urineResult.forEach((el) => {
      el?.forEach((e) => {
        if (e.timeOfDay === TimeOfDayEnum.morning) {
          morningCount++;
          morningSum += e.value !== null ? e.value : 0;
        } else if (e.timeOfDay === TimeOfDayEnum.afternoon) {
          afternoonCount++;
          afternoonSum += e.value !== null ? e.value : 0;
        } else {
          nightCount++;
          nightSum += e.value !== null ? e.value : 0;
        }
      });
    });

    const dailyUrineValue: IDailyUrineValue[] = [];
    if (morningCount !== 0) {
      dailyUrineValue.push({
        timeOfDay: 'morning',
        value:
          morningCount !== null ? Math.round(morningSum / morningCount) : null,
      });
    }
    if (afternoonCount !== 0) {
      dailyUrineValue.push({
        timeOfDay: 'afternoon',
        value:
          afternoonCount !== null
            ? Math.round(afternoonSum / afternoonCount)
            : null,
      });
    }
    if (nightCount !== 0) {
      dailyUrineValue.push({
        timeOfDay: 'night',
        value: nightCount !== null ? Math.round(nightSum / nightCount) : null,
      });
    }
    return { date, value: score, dailyUrineValue } as IScores2;
  });

  const year = moment(result[0].date).year();
  const firstMonth = moment(result[0].date).month() + 1; // Jan=0, Dec=11
  const lastMonth = moment(result[result.length - 1].date).month() + 1;

  for (let i = firstMonth; i <= lastMonth; i++) {
    const date = `${i}/1/${year}`;
    if (result.some((s) => s.date === date)) {
      continue;
    }
    result.push({ date, value: null });
  }

  return result.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export { getScores };

import {
  CumulativeScoreTypes,
  IDailyScores,
  IDailyUrineValue,
  TimeOfDayEnum,
} from '../cumulative-score.type';
import { TrendIndicators } from '@prisma/client';

export * from './create-cumulative-score.dto';
export * from './delete-cumulative-score.dto';
export * from './get-cumulative-score-2.dto';
export * from './update-cumulative-score-2.dto';

export interface IScores2 {
  date: string;
  value: number | null;
  dailyUrineValue?: IDailyUrineValue[];
}

export interface IScoresHydration {
  date: string;
  value: number | null;
  morning: {
    value: number | null;
    trendIndicator?: TrendIndicators | null;
    lastUrineDate: Date | null;
    lastUrineColor: string | null;
  };
  afternoon: {
    value: number | null;
    trendIndicator?: TrendIndicators | null;
    lastUrineDate: Date | null;
    lastUrineColor: string | null;
  };
  night: {
    value: number | null;
    trendIndicator?: TrendIndicators | null;
    lastUrineDate: Date | null;
    lastUrineColor: string | null;
  };
}

export interface IScoresGutHealth {
  date: string;
  value: number | null;
  trendIndicator: TrendIndicators | null;
  lastStoolDate: Date | null;
  lastStoolConsistency: string | null;
}

export enum CumulativeScoreGroupType {
  day = 'day',
  month = 'month',
}

export enum ScoreTrendDirection {
  up = 'up',
  down = 'down',
}

// Not part of any request
export interface ICumulativeScoreCreateDto2 {
  userEmail: string;
  baselineValue: number;
  type: CumulativeScoreTypes;
  scores: IDailyScores[];
  deleteData?: boolean;
}

export interface ICreateCumulativeScoreInternalRequestDto {
  profileId: number;
  date: number;
  type: CumulativeScoreTypes;
  value: number | null;
  timeOfDay?: TimeOfDayEnum;
}

// Not part of any cumulative score request
export interface ICumulativeScoreResponseDto2 {
  type: CumulativeScoreTypes;
  groupBy: CumulativeScoreGroupType;
  hydration?: {
    total: number;
    scores: IScores2[];
  };
  gutHealth?: {
    total: number;
    scores: IScores2[];
  };
}

export interface ICumulativeScoreResponseDto3 {
  type: CumulativeScoreTypes;
  groupBy: CumulativeScoreGroupType;
  hydration?: {
    total: number;
    scores: IScoresHydration[];
  };
  gutHealth?: {
    total: number;
    scores: IScoresGutHealth[];
  };
}

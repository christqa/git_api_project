import {
  Prisma,
  CumulativeScore,
  CumulativeBaselineValue,
  TrendIndicators,
} from '@prisma/client';

import {
  ICreateCumulativeScoreRequestDto,
  ICumulativeScoreCreateDto2,
} from './dtos/cumulative-score.index.dto';

export type ICumulativeScore = CumulativeScore;

export type ICumulativeScoreCreate = Prisma.CumulativeScoreUncheckedCreateInput;

export type ICumulativeBaselineValue = CumulativeBaselineValue;

export type ICumulativeScoreUpdate = Omit<ICumulativeScore, 'id'>;

export type ICumulativeScoreUniqueInput =
  Prisma.CumulativeScoreWhereUniqueInput;

export type ICumulativeScoreDelete = Prisma.CumulativeScoreWhereInput;

export type ICumulativeScoreBatchCount = Prisma.BatchPayload;

export type ICumulativeBaselineValueUniqueInput =
  Prisma.CumulativeBaselineValueWhereUniqueInput;

export type ICumulativeScoreWhereInput = Prisma.CumulativeScoreWhereInput;

export type ICumulativeBaselineValueWhereInput =
  Prisma.CumulativeBaselineValueWhereInput;

export interface IDailyScores {
  date: number;
  value: number;
}

export enum CumulativeScoreTypes {
  hydration = 'hydration',
  gutHealth = 'gutHealth',
}

export type ICumulativeScoreDeleteRequestDTO = Omit<
  ICreateCumulativeScoreRequestDto,
  'baselineValue' | 'value'
>;

export type ICumulativeScoreCreateBodyDTO2 = Omit<
  ICumulativeScoreCreateDto2,
  'userEmail' | 'baselineValue' | 'deleteData'
>;

export enum TimeOfDayEnum {
  morning = 'morning',
  afternoon = 'afternoon',
  night = 'night',
}

export type IDailyUrineValue = {
  timeOfDay: string | null;
  value: number | null;
  trendIndicator?: TrendIndicators | null;
};

import { CumulativeScoreTypes, TimeOfDayEnum } from '../cumulative-score.type';

export interface ICreateCumulativeScoreRequestDto {
  userEmail: string;
  date?: number;
  baselineValue?: number;
  type: CumulativeScoreTypes;
  value?: number | null;
  timeOfDay?: TimeOfDayEnum;
}

export interface ICreateCumulativeScore {
  date?: number;
  baselineValue?: number;
  type: CumulativeScoreTypes;
  value?: number | null;
  timeOfDay?: TimeOfDayEnum;
}

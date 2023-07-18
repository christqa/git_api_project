import { ICreateCumulativeScoreRequestDto } from './create-cumulative-score.dto';

export type IDeleteCumulativeScoreRequestDto = Omit<
  ICreateCumulativeScoreRequestDto,
  'baselineValue' | 'value'
>;

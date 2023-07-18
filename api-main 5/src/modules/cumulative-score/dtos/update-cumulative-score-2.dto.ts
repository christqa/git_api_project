import { ICumulativeScoreCreateDto2 } from './cumulative-score.index.dto';

export type IUpdateCumulativeScoreRequestDto2 = Omit<
  ICumulativeScoreCreateDto2,
  'userEmail' | 'baselineValue' | 'deleteData'
>;

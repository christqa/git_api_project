import { CumulativeScoreTypes } from '../cumulative-score.type';
import { CumulativeScoreGroupType } from './cumulative-score.index.dto';

export interface IGetCumulativeScoreRequestDto2 {
  userGuid: string;
  email: string;
  groupBy: CumulativeScoreGroupType;
  type?: CumulativeScoreTypes;
  startDate?: Date;
  endDate?: Date;
}

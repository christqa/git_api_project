import { TrendIndicator } from './enums.support';

export interface IAnalyteBound {
  contributionPercentage: number;
  baseline: number;
  warningLowerBound: number;
  normalLowerBound: number;
  normalUpperBound: number;
  warningUpperBound: number;
  minimumLowerBound: number;
  maximumUpperBound: number;
}
// TODO: Request and Response Configuration DTO should be in individual files: clean code
export interface IUserConfigurationRequestDto {
  hydration: {
    baseline: number | null; // Cleanup after client integration
    morningBaseline?: number | null;
    afternoonBaseline?: number | null;
    nightBaseline?: number | null;
    trendIndicator: TrendIndicator;
    optimumRangeLow: number;
    needsImprovementUpperBound: number;
    warningUpperBound: number;
    analytes: {
      concentration: IAnalyteBound;
      color: IAnalyteBound;
      frequency: IAnalyteBound;
      durationInSeconds: IAnalyteBound;
    };
  };
  gutHealth: {
    baseline: number | null;
    trendIndicator: TrendIndicator;
    optimumRangeLow: number;
    needsImprovementUpperBound: number;
    warningUpperBound: number;
    analytes: {
      consistency: IAnalyteBound;
      color: IAnalyteBound;
      frequency: IAnalyteBound;
      durationInSeconds: IAnalyteBound;
    };
  };
  minScoresForAvg: number;
  avgScoreWindowSize: number;
}

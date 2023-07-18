import { IAnalyteBound } from '@modules/user-configuration/dtos/user-configuration.index.dto';

export enum IReportRequestDtoGroupBy {
  day = 'day',
  month = 'month',
}

export enum IReportRequestDtoFilterType {
  all = 'all',
  gutHealth = 'gutHealth',
  hydration = 'hydration',
  none = 'none',
}

type IAnalyteReading = {
  date: string;
  value: number;
};

export interface IGetReportRequestDto {
  startDate?: Date;
  endDate?: Date;
  personalData?: boolean;
  annotations?: boolean;
  conditionsAndMedications?: boolean;
  groupBy?: IReportRequestDtoGroupBy;
  filterType?: string;
}

export interface IGetReportResponseDto {
  header: {
    dateRange: string;
    timePeriod: string;
    gender?: string;
    name?: string;
    age?: number;
    dob?: string;
    medicalConditions?: string[];
    medications?: string[];
  };
  annotations?: string[];
  gutHealth?: {
    overall: number;
    stoolConsistency: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    stoolColor: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    stoolFrequency: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    stoolDuration: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    isBloodInStool: boolean;
    bloodInStool: string;
  };
  hydration?: {
    overall: number;
    urineColor: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    urineConcentration: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    urineFrequency: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: IAnalyteReading[];
      };
    };
    urineDuration: {
      config: IAnalyteBound;
      leftHandSide: number;
      rightHandSide: {
        analytes: {
          date: string;
          value: number;
        }[];
      };
    };
  };
  frequencyDetails: {
    date: string;
    time: string;
    type: string;
    annotation: string;
  }[];
}

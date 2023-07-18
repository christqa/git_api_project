import {
  AnalytesManualEntry,
  Prisma,
  StoolData,
  UrineData,
} from '@prisma/client';

export type IUrineData = UrineData;

export type IUrineDataOptional = Partial<UrineData>;

export type IUrineDataCreate = Prisma.UrineDataCreateInput;

export type IUrineDataUpdate = Omit<IUrineData, 'id'>;

export type IUrineDataUniqueInput = Prisma.UrineDataWhereUniqueInput;

export type IUrineDataDelete = Prisma.UrineDataWhereInput;

export type IUrineDataBatchCount = Prisma.BatchPayload;

export type IUrineDataWhereInput = Prisma.UrineDataWhereInput;

export type IStoolData = StoolData;

export type IStoolDataCreate = Prisma.StoolDataCreateInput;

export type IStoolDataUpdate = Omit<IStoolData, 'id'>;

export type IStoolDataUniqueInput = Prisma.StoolDataWhereUniqueInput;

export type IStoolDataDelete = Prisma.StoolDataWhereInput;

export type IStoolDataBatchCount = Prisma.BatchPayload;

export type IStoolDataWhereInput = Prisma.StoolDataWhereInput;

export type IAnalytesManualEntry = AnalytesManualEntry;

export type IAnalyteManualEntryCreate = Prisma.AnalytesManualEntryCreateInput;

export type IAnalyteManualEntryUpdate = Omit<IAnalytesManualEntry, 'id'>;

export type IAnalyteManualEntryUniqueInput =
  Prisma.AnalytesManualEntryWhereUniqueInput;

export type IAnalyteManualEntryDelete = Prisma.AnalytesManualEntryWhereInput;

export type IAnalyteManualEntryBatchCount = Prisma.BatchPayload;

export type IAnalyteManualEntryWhereInput =
  Prisma.AnalytesManualEntryWhereInput;

export interface IAnalytesManualEntrySNS {
  data: IAnalytesManualEntry;
}

export enum StoolConsistencyEnum {
  CONSTIPATED = 1,
  NORMAL = 2,
  DIARRHEA = 3,
}

export interface IUrineDataWhere {
  userGuid: string;
  userEmail?: string;
  color?: IUrineColorType;
  durationInSeconds?: number;
  concentration?: number;
  startDate?: Date;
  endDate?: Date;
  type?: UrineFilterType;
  firstInDay?: boolean;
}

export interface IStoolDataWhere {
  userGuid: string;
  color: number;
  consistency: boolean;
  hasBlood: boolean;
  durationInSeconds: number;
  frequency: number;
  startDate: Date;
  endDate: Date;
  type: StoolFilterType;
}

/**
 * @example "{\"data\": [{\"startDate\": \"2022-06-10T08:00:00Z\", \"endDate\": \"2022-06-10T08:05:00Z\", \"color\": 1, \"hasBlood\": false, \"durationInSeconds\": 3, \"consistency\": 10}]}"
 */
export interface IStoolDataPayload {
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: number;
    hasBlood: boolean;
    durationInSeconds: number;
    consistency: number;
  }>;
}

/**
 * @example "{\"data\": [{\"startDate\": \"2022-06-10T08:00:00Z\", \"endDate\": \"2022-06-10T08:05:00Z\", \"color\": 1, \"hasBlood\": false, \"durationInSeconds\": 3, \"consistency\": 10}]}"
 */
export interface IStoolDataBody {
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: number;
    hasBlood: boolean;
    durationInSeconds: number;
    consistency: number;
  }>;
}

export interface IStoolDataInternalPayload {
  userGuid: string;
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: number;
    hasBlood: boolean;
    durationInSeconds: number;
    consistency: number;
  }>;
}

/**
 * @example "{\"data\": [{\"startDate\": \"2022-06-10T08:00:00Z\", \"endDate\": \"2022-06-10T08:05:00Z\", \"color\": 1, \"durationInSeconds\": 3, \"concentration\": 1.01}]}"
 */
export interface IUrineDataPayload {
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: IUrineColorType;
    durationInSeconds: number;
    concentration: number;
  }>;
}

export interface IUrineDataInternalPayload {
  userGuid: string;
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: IUrineColorType;
    durationInSeconds: number;
    concentration: number;
  }>;
}

export enum AnalyteTypes {
  urine = 'urine',
  stool = 'stool',
}

export enum StoolFilterType {
  color = 'color',
  durationInSeconds = 'durationInSeconds',
  hasBlood = 'hasBlood',
  frequency = 'frequency',
  consistency = 'consistency',
}

export enum UrineFilterType {
  color = 'color',
  durationInSeconds = 'durationInSeconds',
  concentration = 'concentration',
  frequency = 'frequency',
}

export enum IUrineColorType {
  WellHydrated = 1,
  HydrationDeficient = 2,
}
export type IColor = {
  total: number;
  wellHydratedCount: number;
  hydrationDeficientCount: number;
};

export interface PrismaMiddlewareDataType {
  [key: string]: {
    prisma__type: string;
    prisma__value: number | string;
  };
}

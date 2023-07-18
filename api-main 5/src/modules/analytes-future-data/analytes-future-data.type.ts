import { Prisma, StoolFutureData, UrineFutureData } from '@prisma/client';

export type IStoolFutureData = StoolFutureData;
export type IUrineFutureData = UrineFutureData;
export type IUrineFutureDataDelete = Prisma.UrineFutureDataWhereInput;
export type IStoolFutureDataDelete = Prisma.StoolFutureDataWhereInput;
export type IBatchCount = Prisma.BatchPayload;

/**
 * @example "{\"data\": [{\"startDate\": \"2022-06-10T08:00:00Z\", \"endDate\": \"2022-06-10T08:05:00Z\", \"color\": 1, \"durationInSeconds\": 3, \"concentration\": 1.01}]}"
 */
export interface IFutureUrineDataPayload {
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: number;
    durationInSeconds: number;
    concentration: number;
  }>;
}

/**
 * @example "{\"data\": [{\"startDate\": \"2022-06-10T08:00:00Z\", \"endDate\": \"2022-06-10T08:05:00Z\", \"color\": 1, \"hasBlood\": false, \"durationInSeconds\": 3, \"consistency\": 10}]}"
 */
export interface IFutureStoolDataPayload {
  data: Array<{
    startDate: Date;
    endDate: Date;
    color: number;
    hasBlood: boolean;
    durationInSeconds: number;
    consistency: number;
  }>;
}

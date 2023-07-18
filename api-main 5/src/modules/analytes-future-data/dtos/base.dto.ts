import {
  AnalyteTypes,
  IStoolDataPayload,
} from '@modules/analytes/analytes.type';
import { IFutureUrineDataPayload } from '../analytes-future-data.type';

export type IStoolFutureData = {
  id: number;
  color: number;
  hasBlood: boolean;
  durationInSeconds: number;
  consistency: number;
  startDate: Date;
  endDate: Date;
  email: string;
  used: boolean;
};

export type IUrineFutureData = {
  id: number;
  color: number;
  durationInSeconds: number;
  concentration: number;
  startDate: Date;
  endDate: Date;
  email: string;
  used: boolean;
};

export interface IFutureAnalyteRequestDto {
  email: string;
  type: AnalyteTypes;
  startDate: Date;
  endDate?: Date;
}

export interface IFutureAnalyteResponseDto {
  count: number;
  data: IStoolFutureData[] | IUrineFutureData[];
}

export interface IFutureUrineRequestDto {
  userEmail: string;
  payload: IFutureUrineDataPayload[];
}

export interface IFutureStoolRequestDto {
  userEmail: string;
  payload: IStoolDataPayload[];
}

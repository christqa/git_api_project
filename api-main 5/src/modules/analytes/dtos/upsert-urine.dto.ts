import { IUrineDataInternalPayload, IUrineDataPayload } from '../analytes.type';

export interface ICreateUrineDataRequestDto {
  userEmail: string;
  deleteData?: boolean;
  payload: IUrineDataPayload[];
}

export interface ICreateUrineDataInternalRequestDto {
  payload: IUrineDataInternalPayload;
}

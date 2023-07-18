import { IStoolDataInternalPayload, IStoolDataPayload } from '../analytes.type';

export interface ICreateStoolDataRequestDto {
  userEmail: string;
  deleteData?: boolean;
  payload: IStoolDataPayload[];
}

export interface ICreateStoolDataInternalRequestDto {
  payload: IStoolDataInternalPayload;
}

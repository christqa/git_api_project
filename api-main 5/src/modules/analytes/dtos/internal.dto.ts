import { IStoolDataBody, IUrineDataPayload } from '../analytes.type';

export interface IUrineDataInternalToDBRequestDto {
  profileId: number;
  deviceId: number;
  color: number;
  durationInSeconds: number;
  startDate: Date;
  endDate: Date;
  scoreDate: Date;
  concentration: number;
  firstInDay: boolean;
}

export interface IStoolDataInternalToDBRequestDto {
  profileId: number;
  deviceId: number;
  color: number;
  durationInSeconds: number;
  startDate: Date;
  endDate: Date;
  scoreDate: Date;
  consistency: number;
  hasBlood: boolean;
}

export interface IStoolSNSRequestDto extends IStoolDataBody {
  profileId: number;
  deviceSerial: string;
  cameraNeedsAlignment?: boolean;
}

export interface IUrineSNSRequestDto extends IUrineDataPayload {
  profileId: number;
  deviceSerial: string;
  cameraNeedsAlignment?: boolean;
}

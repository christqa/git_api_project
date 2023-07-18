import { IDeviceActivationDto } from './base.dto';

export interface IGetUserDevicesInternalRequestDto {
  userGuid: string;
  deviceSerial: string;
}

export interface IGetUserDevicesInternalResponseDto
  extends IDeviceActivationDto {
  activatedOn: string;
}

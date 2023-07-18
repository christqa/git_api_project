import { IDeviceActivationStatusTypes } from '../device-activation.type';

/**
 * @example "{\"deviceSerial\": \"73b01504-2f7\"}"
 */
export interface IGetDeviceStatusRequestDto {
  deviceSerial: string;
}

export interface IGetDeviceStatusResponseDto {
  status: IDeviceActivationStatusTypes;
  deviceName: string;
}

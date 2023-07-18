import { IDeviceActivationDto } from './base.dto';

/**
 * @example "{\"deviceSerial\": \"73b01504-2f7\", \"deviceName\": \"Smart Toilet\", \"timeZoneId\": 491, \"groupId\": 1}"
 */
export interface IActivateDeviceRequestDto extends IDeviceActivationDto {
  groupId: number;
}

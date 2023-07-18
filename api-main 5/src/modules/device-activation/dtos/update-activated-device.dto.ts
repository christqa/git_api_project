import { IDeviceActivationDto } from './base.dto';

/**
 * @example "{\"deviceSerial\": \"73b01504-2f7\", \"deviceName\": \"Smart Toilet\", \"timeZoneId\": 491}"
 */
export interface IUpdateActivatedDeviceRequestDto
  extends IDeviceActivationDto {}

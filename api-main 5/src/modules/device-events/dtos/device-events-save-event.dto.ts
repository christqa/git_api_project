import { IDeviceEventsRequestDto } from './base.dto';

/**
 * @example "{\"deviceSerial\": \"73b01504-2f7\", \"eventData\": {}, \"eventSource\": \"DeviceGenerated\"}"
 */
export interface ISaveEventRequestDto extends IDeviceEventsRequestDto {}

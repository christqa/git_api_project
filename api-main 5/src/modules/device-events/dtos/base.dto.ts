import { EventSource } from '@prisma/client';

export interface IDeviceEventsRequestDto {
  deviceSerial?: string;
  // eslint-disable-next-line
  eventData: { [key: string]: any };
  eventSource: EventSource;
}

import { JsonValue } from '../../../core/core-types/json-type';

export interface IGetEventsResponseDto {
  total: number;
  events: ExtendedEvent[];
}

export type ExtendedEvent = {
  id: number;
  deviceId: number | null;
  eventData: JsonValue;
  eventSource: 'DeviceGenerated' | 'SystemGenerated' | 'ManualEntry';
  generatedOn: Date;
  deviceName?: string;
  user?: {
    firstName: string;
    lastName: string;
    userGuid: string;
    email: string;
  };
};

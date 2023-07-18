import { JsonValue } from '../../../core/core-types/json-type';

export interface IGetMessageByGuidResponseDto {
  id: number;
  userId: number;
  title: string;
  timestamp: Date;
  message: string;
  messageTypeId: number;
  read: boolean;
  metadata?: JsonValue;
}

export interface IGetMessageByGuidRequestDto {
  skip: number;
  take: number;
  startDate?: Date; // filter by timestamp
  endDate?: Date; // filter by timestamp
  read?: boolean; // filter by read
  messageTypeId?: number; // filter by type
  deleted?: boolean; // show deleted messages
}

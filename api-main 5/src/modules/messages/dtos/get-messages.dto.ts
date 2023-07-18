import { IGetMessageByGuidResponseDto } from './get-message-by-guid.dto';

export interface IGetMessagesRequestDto {
  skip: number;
  take: number;
  startDate?: number | string; // filter by timestamp
  endDate?: number | string; // filter by timestamp
  read?: boolean; // filter by read
  messageTypeId?: number; // filter by type
  deleted?: boolean; // show deleted messages
}

export interface IGetMessagesResponseDto {
  total: number;
  unread: number;
  message: IGetMessageByGuidResponseDto[];
}

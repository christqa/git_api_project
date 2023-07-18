// this is to have backwards compatibility
export type CreateMessagesInternalRequestDto =
  | CreateMessagesRequestType
  | CreateMessagesRequestType[];

export type CreateMessagesRequestType = {
  userGuid: string;
  messageGuid: string;
  title: string;
  message: string;
  messageTypeId: number;
  read: boolean;
  timestamp?: Date;
  // eslint-disable-next-line
  metaData?: { [key: string]: any };
};

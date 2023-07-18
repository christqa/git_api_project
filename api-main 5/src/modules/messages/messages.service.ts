import {
  CreateMessagesInternalRequestDto,
  IGetMessageByGuidRequestDto,
  IGetMessageByGuidResponseDto,
  IGetMessagesResponseDto,
} from '@modules/messages/dtos/messages.index.dto';
import {
  findMessageType,
  messageFindOne,
  messagesCreate,
  messagesCreateMany,
  messagesFindMany,
  messagesFindManyCount,
  messagesSoftDelete,
  messagesUpdateMany,
} from '@repositories/messages.repository';
import {
  getMaxEndDate,
  getMaxEndDateAsNumber,
  getNDayAgoDate,
} from '@utils/date.util';
import moment from 'moment';
import {
  ICreateMessage,
  IMessage,
  IMessageBatchCount,
} from '@modules/messages/messages.type';
import {
  messageAlreadyMarkedAsRead,
  messageNotFound,
  messageTypeNotFound,
} from '@modules/messages/messages.error';
import { userService } from '@modules/index/index.service';
import { IUserUniqueInput } from '@modules/user/user.type';
import { NotificationSettingsOptions } from '@modules/notification-settings/notification-settings.type';
import { IGetMessagesCountResponseDto } from '@modules/messages/dtos/internal.dto';
import { dateInTheFuture } from './messages.error';
import { userNotFound } from '@modules/user/user.error';

const START_DATE = -366;

const findMessageByGuid = async (
  messageGuid: string,
  userGuid: string
): Promise<IGetMessageByGuidResponseDto> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const message = await messageFindOne({ messageGuid, userId });
  // return 404 message not found error
  if (!message) {
    throw messageNotFound();
  }
  return message;
};

const findMessages = async (
  {
    skip,
    take,
    read,
    messageTypeId,
    startDate,
    endDate,
    deleted,
  }: IGetMessageByGuidRequestDto,
  userGuid: string
): Promise<IGetMessagesResponseDto> => {
  console.log('findMessages here');
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    console.log('USER NOT FOUND !!');
    throw userNotFound();
  }

  let startTime: number | Date | undefined = startDate;
  let endTime = getMaxEndDateAsNumber(endDate);

  if (moment().diff(endDate, 'days') < 0) {
    console.log('findMessages, date in the future');
    throw dateInTheFuture();
  }
  //startTime is alway a date, calculate the difference in days
  startTime = moment(new Date()).diff(moment(startTime), 'days');
  startTime = -1 * startTime;

  //endTime is alway a date, calculate the difference in days
  endTime = -1 * Math.max(moment(new Date()).diff(moment(endTime), 'days'), 0);

  console.log('findMessages, startTime, endTime ', startTime, endTime);

  const [total, unread, message] = await messagesFindMany(
    {
      userId: user.id,
      read,
      messageTypeId,
      deleted: deleted
        ? {
            not: null,
          }
        : undefined,
      timestamp: startDate
        ? {
            gte: getNDayAgoDate(startTime),
            lte: getNDayAgoDate(endTime, false),
          }
        : undefined,
    },
    {
      skip,
      take,
    }
  );
  return {
    total,
    unread,
    message,
  };
};

const findMessagesCountByPeriod = async (
  timeZoneGMT: string,
  period: number,
  skip: number,
  take: number,
  option: NotificationSettingsOptions,
  push?: boolean,
  sms?: boolean
): Promise<IGetMessagesCountResponseDto[]> => {
  return messagesFindManyCount(
    timeZoneGMT,
    moment().utcOffset(`${timeZoneGMT}:00`).subtract(period, 'd').format(),
    moment().utcOffset(`${timeZoneGMT}:00`).format(),
    option,
    skip,
    take,
    push,
    sms
  );
};

const markAllMessagesAsRead = async (userGuid: string): Promise<void> => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  await messagesUpdateMany(
    {
      userId,
    },
    {
      read: true,
    }
  );
};

const messageMarkAsRead = async (messageGuid: string, userGuid: string) => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  const message = await findMessageByGuid(messageGuid, userGuid);
  // the state of the message is already “read”
  if (message.read) {
    throw messageAlreadyMarkedAsRead();
  }
  await messagesUpdateMany(
    {
      userId,
      messageGuid,
    },
    {
      read: true,
    }
  );
};

const removeMessage = async (messageGuid: string, userGuid: string) => {
  const user = await userService.findByUserGuid(userGuid);
  if (!user) {
    throw userNotFound();
  }
  const userId = user.id;
  await findMessageByGuid(messageGuid, userGuid);
  await messagesSoftDelete({
    userId,
    messageGuid,
  });
};

const createMessage = async (data: ICreateMessage): Promise<IMessage> => {
  const messageType = await findMessageType(data.messageTypeId);
  if (!messageType) {
    throw messageTypeNotFound();
  }
  return messagesCreate(data);
};

const createMessageInternal = async (
  request: CreateMessagesInternalRequestDto
): Promise<IMessage | IMessageBatchCount> => {
  //this is to have backwards compatibility
  if (Array.isArray(request)) {
    const requests: ICreateMessage[] = [];
    for (const req of request) {
      const { userGuid, ...data } = req;
      const user = await userService.findOne({
        userGuid,
      } as IUserUniqueInput);
      requests.push({
        userId: user.id,
        ...data,
      } as ICreateMessage);
    }
    return messagesCreateMany(requests);
  } else {
    const { userGuid, ...data } = request;
    const user = await userService.findOne({
      userGuid,
    } as IUserUniqueInput);
    return createMessage({ userId: user.id, ...data } as ICreateMessage);
  }
};

export {
  findMessageByGuid,
  removeMessage,
  findMessagesCountByPeriod,
  findMessages,
  markAllMessagesAsRead,
  messageMarkAsRead,
  createMessage,
  createMessageInternal,
};

import httpStatus from 'http-status';
import { PrismaClient } from '@prisma/client';
import * as messagesRepository from '@repositories/messages.repository';
import * as messagesService from './messages.service';
import ApiError from '@core/error-handling/api-error';
import { ICreateMessage, IMessage, IMessageType } from './messages.type';
import userRepository from '@repositories/user.repository';
import { generateAuth0User, generateUser } from '@test/utils/generate';

const messageObject = {
  id: 1,
  userId: 1,
  title: 'Alert',
  timestamp: new Date(),
  message: 'message',
  messageTypeId: 1,
  read: false,
  deleted: null,
} as IMessage;
const createMessageObject = {
  userId: 1,
  title: 'Alert',
  timestamp: new Date(),
  message: 'message',
  messageTypeId: 1,
  read: false,
  deleted: null,
  metaData: {},
} as ICreateMessage;
const messageTypeObject = {
  id: 1,
  text: 'type',
} as IMessageType;
const messagesFindManyObject = [1, 1, [messageObject]] as [
  number,
  number,
  IMessage[]
];

beforeEach(() => {
  const auth0User = generateAuth0User();
  const userData = generateUser({
    email: auth0User.email,
  });

  jest
    .spyOn(PrismaClient.prototype, '$use')
    .mockImplementation(() => undefined);
  jest
    .spyOn(messagesRepository, 'messagesFindMany')
    .mockResolvedValue(messagesFindManyObject);
  jest
    .spyOn(messagesRepository, 'messageFindOne')
    .mockResolvedValue(messageObject);
  jest
    .spyOn(messagesRepository, 'findMessageType')
    .mockResolvedValue(messageTypeObject);
  jest
    .spyOn(messagesRepository, 'messagesUpdateMany')
    .mockResolvedValue(undefined);
  jest
    .spyOn(messagesRepository, 'messagesSoftDelete')
    .mockResolvedValue(undefined);
  jest
    .spyOn(messagesRepository, 'messagesCreate')
    .mockResolvedValue(messageObject);
  jest.spyOn(userRepository, 'findFirst').mockResolvedValue(userData);
});

afterEach((done) => {
  jest.restoreAllMocks();
  return done();
});

describe('Messages', () => {
  test('should test findMessageByGuid function', async () => {
    await messagesService.findMessageByGuid(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '1'
    );
    expect(userRepository.findFirst).toBeCalled();
    expect(messagesRepository.messageFindOne).toBeCalled();
  });

  test('should test findMessages function', async () => {
    await messagesService.findMessages({ skip: 0, take: 10 }, '1');
    expect(userRepository.findFirst).toBeCalled();
    expect(messagesRepository.messagesFindMany).toBeCalled();
  });

  test('should test markAllMessagesAsRead function', async () => {
    await messagesService.markAllMessagesAsRead('1');
  });

  test('should test messageMarkAsRead function', async () => {
    await messagesService.messageMarkAsRead(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '1'
    );
  });

  test('should test messageMarkAsRead function (404 message not found)', async () => {
    jest.spyOn(messagesRepository, 'messageFindOne').mockResolvedValue(null);

    try {
      await messagesService.messageMarkAsRead(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('messages_message_not_found');
    }
  });

  test('should test messageMarkAsRead function (409 message is already "read")', async () => {
    jest
      .spyOn(messagesRepository, 'messageFindOne')
      .mockResolvedValue({ ...messageObject, read: true });

    try {
      await messagesService.messageMarkAsRead(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.CONFLICT);
      expect(error?.localised.key).toBe(
        'messages_message_already_marked_as_read'
      );
    }
  });

  test('should test removeMessage function', async () => {
    await messagesService.removeMessage(
      '397322cd-6405-464f-8fc6-4dc28971ef2f',
      '1'
    );
  });

  test('should test removeMessage function (404 message not found)', async () => {
    jest.spyOn(messagesRepository, 'messageFindOne').mockResolvedValue(null);

    try {
      await messagesService.removeMessage(
        '397322cd-6405-464f-8fc6-4dc28971ef2f',
        '1'
      );
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('messages_message_not_found');
    }
  });

  test('should test createMessage function', async () => {
    await messagesService.createMessage(createMessageObject);
  });

  test('should test createMessage function (404 message type not found)', async () => {
    jest.spyOn(messagesRepository, 'findMessageType').mockResolvedValue(null);

    try {
      await messagesService.createMessage(createMessageObject);
      // eslint-disable-next-line
    } catch (error: any) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error?.status).toBe(httpStatus.NOT_FOUND);
      expect(error?.localised.key).toBe('messages_message_type_not_found');
    }
  });
});

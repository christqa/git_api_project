import {
  ICreateMessage,
  IMessage,
  IMessageBatchCount,
  IMessageType,
  IMessageUniqueInput,
  IMessageUpdateManyMutationInput,
} from '@modules/messages/messages.type';
import { NotificationSettingsOptions } from '@modules/notification-settings/notification-settings.type';
import { IGetMessagesCountResponseDto } from '@modules/messages/dtos/internal.dto';
import prisma from '@repositories/prisma.use.repository';

const { message, messageType } = prisma;

const findMessageType = (id: number): Promise<IMessageType | null> => {
  return messageType.findFirst({
    where: {
      id,
    },
  });
};

const messageFindOne = async ({
  userId,
  messageGuid,
  read,
}: {
  userId: number;
  messageGuid: string;
  read?: boolean;
}) => {
  return message.findFirst({
    where: {
      userId,
      messageGuid,
      read,
    },
  });
};

const messagesFindManyCount = async (
  timeZoneGMT: string,
  startDate: string,
  endDate: string,
  option: NotificationSettingsOptions,
  skip = 0,
  take = 10,
  push?: boolean,
  sms?: boolean
): Promise<IGetMessagesCountResponseDto[]> => {
  const pushQuery = push ? `AND push = ${push}` : '';
  const smsQuery = sms ? `AND sms = ${sms}` : '';
  const query = `
  SELECT COUNT(DISTINCT "Message".message_guid)::integer as count, "Account".user_guid from "Message"
INNER JOIN "MessageType" ON
    "Message".message_type_id = "MessageType"."id"
INNER JOIN "Account" on "Account".id = "Message".user_id
INNER JOIN "GroupUsers" ON "GroupUsers".deleted IS NULL AND "GroupUsers".user_id = "Message".user_id
  INNER JOIN "Groups" ON "Groups".deleted IS NULL AND "Groups".id = "GroupUsers".group_id
    INNER JOIN "GroupDevices" ON "GroupDevices".deleted IS NULL AND "GroupDevices".group_id = "Groups".id
      INNER JOIN "DeviceActivation" ON "DeviceActivation".deleted IS NULL AND "DeviceActivation".deactivated_by IS NULL AND "DeviceActivation".device_id = "GroupDevices".device_id
        INNER JOIN "TimeZone" ON "TimeZone".id = "DeviceActivation".time_zone_id
INNER JOIN (SELECT notification_settings_type as type, user_id FROM "Account"
   JOIN "NotificationSettings" ON
    "NotificationSettings"."user_id" = "Account"."id"
   WHERE
   "notification_settings_option" = '${option}'
   ${pushQuery}
   ${smsQuery}
     ) as notification_settings
  ON "notification_settings".user_id = "Message".user_id and
  "notification_settings".type = "MessageType".notification_settings_type
WHERE
 "Message".deleted IS NULL
 and read = false
 and gmt LIKE '${timeZoneGMT}%'
 and timestamp BETWEEN '${startDate}' AND '${endDate}'

GROUP BY "Account".user_guid
ORDER BY "Account".user_guid ASC
OFFSET ${skip} LIMIT ${take};
 `;

  return prisma.$queryRawUnsafe(query);
};

const messagesFindMany = (
  where: IMessageUniqueInput,
  {
    skip,
    take,
  }: {
    skip: number;
    take: number;
  }
): Promise<[number, number, IMessage[]]> => {
  return Promise.all([
    message.count({ where }),
    message.count({
      where: {
        ...where,
        read: false,
      },
    }),
    message.findMany({
      where,
      skip,
      take,
      orderBy: [
        {
          timestamp: 'desc',
        },
      ],
    }),
  ]);
};

const messagesUpdateMany = async (
  where: IMessageUniqueInput,
  data: IMessageUpdateManyMutationInput
): Promise<void> => {
  await message.updateMany({
    where,
    data,
  });
};

const messagesCreate = async (data: ICreateMessage): Promise<IMessage> => {
  return message.create({
    data,
  });
};

const messagesCreateMany = async (
  data: ICreateMessage[]
): Promise<IMessageBatchCount> => {
  return message.createMany({
    data,
  });
};

const messagesSoftDelete = async (
  where: IMessageUniqueInput
): Promise<void> => {
  await message.deleteMany({
    where,
  });
};

export {
  messageFindOne,
  messagesCreateMany,
  messagesFindManyCount,
  messagesSoftDelete,
  messagesFindMany,
  messagesUpdateMany,
  messagesCreate,
  findMessageType,
};

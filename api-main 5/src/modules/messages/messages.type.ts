import { Message, MessageType, Prisma } from '@prisma/client';

export type IMessage = Message;

export type ICreateMessage = Prisma.MessageCreateManyInput;

export type IMessages = Message[];

export type IMessageType = MessageType;

export type IMessageUniqueInput = Prisma.MessageWhereInput;

export type IMessageBatchCount = Prisma.BatchPayload;

export type IMessageUpdateManyMutationInput =
  Prisma.MessageUpdateManyMutationInput;

import {
  IPushToken,
  IPushTokenWhereInput,
  IPushTokenWhereUniqueInput,
} from '@modules/notifications/push-token.type';
import { PrismaClient } from '@prisma/client';
import prisma from '@core/prisma/prisma';
import userRepository from './user.repository';
import { IUser } from '@modules/user/user.type';

const { pushToken } = prisma;

const create = (data: IPushToken): Promise<IPushToken> => {
  return pushToken.create({
    data,
  });
};

const findFirst = (where: IPushTokenWhereInput): Promise<IPushToken | null> => {
  return pushToken.findFirst({
    where,
    include: {
      UserMobile: true,
    },
  });
};

const findActiveDeviceTokenMany = (userId: number): Promise<IPushToken[]> => {
  return pushToken.findMany({
    where: {
      UserMobile: {
        some: {
          userId,
          active: true,
        },
      },
    },
  });
};

const findActiveDeviceTokenManyByUserGuid = (
  userGuid: string
): Promise<IPushToken[]> => {
  return userRepository
    .findFirst({
      userGuid,
    })
    .then((user: IUser | null) => {
      if (!user) {
        throw 'Could not find user by guid ' + userGuid;
      }
      return pushToken.findMany({
        where: {
          UserMobile: {
            some: {
              userId: user.id,
              active: true,
            },
          },
        },
      });
    })
    .catch((err) => {
      throw 'Could not find user ' + err;
    });
};

const remove = async (
  where: IPushTokenWhereUniqueInput,
  prismaTr?: PrismaClient
): Promise<void> => {
  await (prismaTr || prisma).pushToken.delete({
    where,
  });
};

export default {
  create,
  findFirst,
  findActiveDeviceTokenMany,
  findActiveDeviceTokenManyByUserGuid,
  remove,
};

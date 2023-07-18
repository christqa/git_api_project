import prisma from '@core/prisma/prisma';
import {
  IUserMobile,
  IUserMobileCreate,
  IUserMobilePushTokens,
  IUserMobileUpdate,
  IUserMobileWhereUniqueInput,
} from '@modules/user-mobile/user-mobile.type';

const { userMobile } = prisma;

const upsert = async (
  data: IUserMobileCreate,
  active = true
): Promise<IUserMobile> => {
  // reset
  if (active) {
    await userMobile.updateMany({
      where: {
        pushTokenId: data.pushTokenId,
      },
      data: { active: false },
    });
  }

  return userMobile.upsert({
    where: {
      userId_pushTokenId: {
        userId: data.userId,
        pushTokenId: data.pushTokenId,
      },
    },
    update: {
      active,
    },
    create: {
      ...data,
      active,
    },
  });
};

const update = async (
  where: IUserMobileWhereUniqueInput,
  data: IUserMobileUpdate
): Promise<IUserMobile> => {
  return userMobile.update({
    where,
    data,
  });
};

const findUserMobilePushTokens = async (
  userId: number
): Promise<IUserMobilePushTokens[]> => {
  return userMobile.findMany({
    where: {
      userId,
    },
    select: {
      active: true,
      updatedAt: true,
      pushToken: {
        select: {
          deviceToken: true,
        },
      },
    },
  });
};

export default { upsert, update, findUserMobilePushTokens };

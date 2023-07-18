import { Prisma, UserMobile } from '@prisma/client';

export type IUserMobile = UserMobile;
export type IUserMobileCreate = Prisma.UserMobileUncheckedCreateInput;
export type IUserMobileWhereInput = Prisma.UserMobileWhereInput;
export type IUserMobileWhereUniqueInput = Prisma.UserMobileWhereUniqueInput;
export type IUserMobileUpdate = Prisma.UserMobileUpdateInput;
export type IUserMobilePushTokens = {
  active: boolean;
  updatedAt: Date;
  pushToken: {
    deviceToken: string;
  };
};

import { Prisma, Account } from '@prisma/client';
import { ISignedAgreementsTypes } from '@modules/signed-agreements/signed-agreements.type';

export type IUser = Account & {
  lastAgreement?: ISignedAgreementsTypes;
  shareUsageAgreement?: boolean;
  isEmailVerified?: boolean;
  /* eslint-disable */
  [index: string]: any;
};

export type IUserCtAdmin = Omit<
  Account,
  'id' | 'timeZoneId' | 'localCutoff'
> & { numberOfActiveDevices: number };

export type IUserCreate = Prisma.AccountUncheckedCreateInput;

export type IUserWhereInput = Prisma.AccountWhereInput;

export type IUserUpdate = Omit<IUser, 'id'>;

export type IUserUniqueInput = Prisma.AccountWhereUniqueInput & {
  email?: string;
  userGuid?: string;
  transient?: boolean;
};

export type IUserSelect = Prisma.AccountSelect;

export enum IUserCtAdminSortBy {
  firstName = 'firstName',
  lastName = 'lastName',
  email = 'email',
  numberOfActiveDevices = 'numberOfActiveDevices',
  userGuid = 'userGuid',
}
